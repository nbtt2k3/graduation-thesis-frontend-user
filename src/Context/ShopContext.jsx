import React, { createContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as apis from "../apis";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const [productsData, setProductsData] = useState([]);
  const [productItemsData, setProductItemsData] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  const [search, setsearch] = useState("");
  const [orders, setorders] = useState([]);
  const navigate = useNavigate();
  const currency = "VNĐ";
  const [cartItems, setCartItems] = useState({});
  const [auth, setAuth] = useState({
    isLoggedIn: false,
    token: null,
  });
  const [current, setCurrent] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ============================
  // LẤY THÔNG TIN NGƯỜI DÙNG HIỆN TẠI
  // ============================
  const getUserCurrent = async () => {
    setIsLoading(true);
    try {
      const response = await apis.apiGetCurrent();
      if (response?.success) {
        setCurrent(response.userInfo);
      } else {
        throw new Error(
          "API returned no success: " + (response?.msg || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error in getUserCurrent:", error);
      toast.error(
        error.msg ||
          error.message ||
          "Đã xảy ra lỗi khi truy xuất thông tin người dùng."
      );
      setAuth({ isLoggedIn: false, token: null });
      localStorage.removeItem("TechZone/user");
      setCurrent(null);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================
  // LẤY TOKEN TỪ LOCALSTORAGE
  // ============================
  useEffect(() => {
    const initializeAuth = async () => {
      const stored = localStorage.getItem("TechZone/user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setAuth({
            isLoggedIn: parsed.isLoggedIn,
            token: parsed.token,
          });
          if (parsed.isLoggedIn) {
            await getUserCurrent();
          } else {
            setIsLoading(false);
          }
        } catch (err) {
          console.error("Lỗi parse localStorage TechZone/user:", err);
          localStorage.removeItem("TechZone/user");
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, []);

  useEffect(() => {
    localStorage.setItem("TechZone/user", JSON.stringify(auth));
  }, [auth]);

  // ============================
  // LOGIN / LOGOUT
  // ============================
  const login = async (token) => {
    const updatedAuth = {
      isLoggedIn: true,
      token,
    };
    setAuth(updatedAuth);
    localStorage.setItem("TechZone/user", JSON.stringify(updatedAuth));
    await getUserCurrent(); // Đợi getUserCurrent hoàn tất
  };

  const logout = async () => {
    try {
      await apis.apiLogoutUser();
    } catch (error) {
      console.warn("Lỗi khi logout:", error.msg || error.message);
    } finally {
      setAuth({ isLoggedIn: false, token: null });
      setCurrent(null);
      setCartItems({});
      localStorage.removeItem("TechZone/user");
    }
  };

  // ============================
  // FETCH PRODUCTS
  // ============================
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apis.apiGetAllProducts({ limit: 0 });
        if (response?.productList) {
          setProductsData(response.productList);
        }
      } catch (error) {
        toast.error(
          error.msg || error.message || "Đã xảy ra lỗi khi tải sản phẩm."
        );
      }
    };
    fetchProducts();
  }, []);

  // ============================
  // FETCH PRODUCT ITEMS
  // ============================
  useEffect(() => {
    const fetchProductItems = async () => {
      try {
        const response = await apis.apiGetAllProductItems({ limit: 0 });
        if (response?.productItemList) {
          setProductItemsData(response.productItemList);
        }
      } catch (error) {
        toast.error(
          error.msg ||
            error.message ||
            "Đã xảy ra lỗi khi tải biến thể sản phẩm."
        );
      }
    };
    fetchProductItems();
  }, []);

  // ============================
  // BUILD CATEGORY TREE
  // ============================
  const buildCategoryTree = (categories) => {
    const categoryMap = {};
    categories.forEach((category) => {
      categoryMap[category._id] = { ...category, children: [] };
    });

    const tree = [];
    categories.forEach((category) => {
      const parentId = category.parentId?._id;
      if (!parentId) {
        tree.push(categoryMap[category._id]);
      } else {
        const parent = categoryMap[parentId];
        if (parent) {
          parent.children.push(categoryMap[category._id]);
        }
      }
    });

    const sortByDisplayOrder = (arr) =>
      arr.sort((a, b) => a.displayOrder - b.displayOrder);
    sortByDisplayOrder(tree);
    tree.forEach((category) => {
      sortByDisplayOrder(category.children);
    });

    return tree;
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apis.apiGetAllCategories({ limit: 0 });
        if (response?.success) {
          const tree = buildCategoryTree(response.categoryList);
          setCategoryTree(tree);
        }
      } catch (error) {
        toast.error(
          error.msg || error.message || "Đã xảy ra lỗi khi tải danh mục."
        );
      }
    };
    fetchCategories();
  }, []);

  // ============================
  // FETCH CART
  // ============================
  const fetchCart = async () => {
    if (auth.isLoggedIn && auth.token) {
      try {
        const response = await apis.apiGetUserCart();
        if (response?.success && response.cart) {
          if (JSON.stringify(cartItems) !== JSON.stringify(response.cart)) {
            setCartItems(response.cart);
          }
        }
      } catch (error) {
        toast.error(
          error.msg || error.message || "Đã xảy ra lỗi khi tải giỏ hàng."
        );
      }
    }
  };

  useEffect(() => {
    if (auth.isLoggedIn && auth.token) {
      fetchCart();
    }
  }, [auth]);

  // ============================
  // CART CALCULATIONS
  // ============================
  const getCartCount = () => {
    let totalCount = 0;
    for (const itemId in cartItems) {
      for (const color in cartItems[itemId]) {
        for (const gb in cartItems[itemId][color]) {
          const quantity = cartItems[itemId]?.[color]?.[gb] || 0;
          if (quantity > 0) totalCount += quantity;
        }
      }
    }
    return totalCount;
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const itemId in cartItems) {
      const itemInfo = productsData.find(
        (product) => String(product._id) === String(itemId)
      );
      if (!itemInfo) continue;

      const price =
        itemInfo.onSale && itemInfo.discountedPrice != null
          ? parseFloat(itemInfo.discountedPrice)
          : parseFloat(itemInfo.price);

      for (const color in cartItems[itemId]) {
        for (const gb in cartItems[itemId][color]) {
          const quantity = cartItems[itemId]?.[color]?.[gb] || 0;
          if (!isNaN(price) && !isNaN(quantity)) {
            totalAmount += price * quantity;
          }
        }
      }
    }
    return totalAmount;
  };

  const getCartDiscountAmount = () => {
    let totalDiscount = 0;
    for (const itemId in cartItems) {
      const itemInfo = productsData.find(
        (product) => String(product._id) === String(itemId)
      );
      if (!itemInfo || !itemInfo.onSale) continue;

      const originalPrice = parseFloat(itemInfo.price);
      const discountedPrice = parseFloat(itemInfo.discountedPrice);

      for (const color in cartItems[itemId]) {
        for (const gb in cartItems[itemId][color]) {
          const quantity = cartItems[itemId]?.[color]?.[gb] || 0;
          if (
            !isNaN(originalPrice) &&
            !isNaN(discountedPrice) &&
            !isNaN(quantity)
          ) {
            totalDiscount += (originalPrice - discountedPrice) * quantity;
          }
        }
      }
    }
    return totalDiscount;
  };

  // ============================
  // ORDERS
  // ============================
  useEffect(() => {
    if (user) {
      const savedorders = localStorage.getItem(`orders_${user._id}`);
      if (savedorders) {
        setorders(JSON.parse(savedorders));
      } else {
        setorders([]);
      }
    } else {
      setorders([]);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`orders_${user._id}`, JSON.stringify(orders));
    }
  }, [orders, user]);

  const addorder = useCallback((order) => {
    setorders((prev) => [...prev, order]);
    toast.success("Đơn hàng đã được tạo!");
  }, []);

  const getordersByUser = useCallback(
    (userId) => {
      return orders.filter((order) => order.userId === userId);
    },
    [orders]
  );

  const resetCart = () => {
    setCartItems({});
  };

  // ============================
  // CONTEXT VALUE
  // ============================
  const value = {
    search,
    setsearch,
    navigate,
    currency,
    cartItems,
    getCartCount,
    getCartAmount,
    getCartDiscountAmount,
    user,
    setUser,
    login,
    logout,
    orders,
    setorders,
    addorder,
    getordersByUser,
    productsData,
    productItemsData,
    setCurrent,
    current,
    auth,
    fetchCart,
    resetCart,
    categoryTree,
    isLoading,
  };

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;
