import React, { useContext, useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import Fuse from "fuse.js";
import { htmlToText } from "html-to-text";
import Search from "../../components/Search/Search";
import { ShopContext } from "../../Context/ShopContext";
import Item from "../../components/Item/Item";
import { ChevronDown, ChevronRight, AlertCircle, SearchX } from "lucide-react";
import * as apis from "../../apis";
import { toast } from "react-hot-toast";

const Collection = () => {
  const { search, categoryTree } = useContext(ShopContext);
  const [category, setCategory] = useState([]);
  const [sortType, setSortType] = useState("low");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productItemsData, setProductItemsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openCategories, setOpenCategories] = useState([]);
  const [visibleItems, setVisibleItems] = useState(8); // Số sản phẩm hiển thị ban đầu
  const itemsPerLoad = 8; // Số sản phẩm tải thêm mỗi lần bấm "Xem thêm"

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apis.apiGetAllProductItems({ limit: 0 });
        if (!response?.success || !Array.isArray(response.productItemList)) {
          throw new Error("Dữ liệu sản phẩm không hợp lệ.");
        }
        setProductItemsData(response.productItemList);
      } catch (error) {
        setError(error.msg || "Không thể tải danh sách sản phẩm.");
        toast.error(error.msg || "Không thể tải danh sách sản phẩm.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const toggleFilter = (value, setState) => {
    setState((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const toggleOpen = (id) => {
    setOpenCategories((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleResetFilters = () => {
    setCategory([]);
    setSortType("low");
    setVisibleItems(8); // Reset số sản phẩm hiển thị khi xóa bộ lọc
    setOpenCategories([]);
  };

  const fuse = useMemo(() => {
    const cleanedProducts = productItemsData.map((product) => ({
      ...product,
      description: htmlToText(product.description || "", {
        wordwrap: false,
        ignoreHref: true,
        ignoreImage: true,
      }),
    }));

    const options = {
      keys: ["name", "description", "category.name", "brand.name"],
      threshold: 0.3,
      includeScore: true,
      ignoreLocation: true,
      minMatchCharLength: 2,
    };
    return new Fuse(cleanedProducts, options);
  }, [productItemsData]);

  const applyFilter = useMemo(() => {
    return (products) => {
      let filtered = [...products];

      if (category.length) {
        filtered = filtered.filter((product) =>
          category.includes(product.category?.slug)
        );
      }

      if (typeof search === "string" && search.trim()) {
        const results = fuse.search(search.trim(), { limit: 50 });
        filtered = results.map((result) => result.item);
      }

      return filtered;
    };
  }, [search, category, fuse]);

  const applySorting = useMemo(() => {
    return (productList) => {
      const sorted = [...productList];
      switch (sortType) {
        case "low":
          return sorted.sort(
            (a, b) =>
              (a.discountedPrice ?? a.retailPrice ?? 0) -
              (b.discountedPrice ?? b.retailPrice ?? 0)
          );
        case "high":
          return sorted.sort(
            (a, b) =>
              (b.discountedPrice ?? b.retailPrice ?? 0) -
              (a.discountedPrice ?? a.retailPrice ?? 0)
          );
        default:
          return sorted;
      }
    };
  }, [sortType]);

  useEffect(() => {
    const filtered = applyFilter(productItemsData);
    const sorted = applySorting(filtered);
    setFilteredProducts(sorted);
    setVisibleItems(8); // Reset số sản phẩm hiển thị khi bộ lọc hoặc sắp xếp thay đổi
  }, [productItemsData, applyFilter, applySorting]);

  const handleLoadMore = () => {
    setVisibleItems((prev) => prev + itemsPerLoad); // Tăng số sản phẩm hiển thị
  };

  const SkeletonCard = () => (
    <div className="animate-pulse bg-white rounded-lg shadow-sm p-4">
      <div className="w-full h-52 bg-gradient-to-br from-gray-100 to-gray-200 rounded mb-4"></div>
      <div className="h-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded w-1/4"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8 md:py-12 rounded-xl min-h-screen">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* FILTER SECTION */}
        <div className="filter-section w-full lg:w-80 bg-white rounded-xl shadow-sm p-4 sm:p-6 transition-shadow duration-300 hover:shadow-lg border-t lg:border-t-0 lg:border-l border-gray-300 border-2 lg:sticky top-5 self-start z-10 max-h-screen overflow-y-auto">
          <Search />
          {/* CATEGORIES */}
          <div className="mt-4 sm:mt-6">
            <div className="flex justify-between items-center mb-4">
              <h5 className="text-lg sm:text-xl font-semibold text-gray-800">
                Danh mục
              </h5>
              {category.length > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-300"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
            <div className="flex flex-col gap-2 sm:gap-3 text-sm sm:text-base">
              {Array.isArray(categoryTree) &&
                categoryTree.map((cat) => (
                  <div key={cat._id} className="flex flex-col">
                    <div
                      className="flex items-center justify-between cursor-pointer hover:bg-gray-100 hover:text-blue-600 px-3 py-2 rounded-md transition-colors duration-300"
                      onClick={() => toggleOpen(cat._id)}
                    >
                      <span className="font-medium text-gray-800 hover:text-blue-600">
                        {cat.name}
                      </span>
                      {cat.children?.length > 0 &&
                        (openCategories.includes(cat._id) ? (
                          <ChevronDown size={20} className="text-blue-600" />
                        ) : (
                          <ChevronRight size={20} className="text-blue-600" />
                        ))}
                    </div>
                    {cat.children?.length > 0 &&
                      openCategories.includes(cat._id) && (
                        <div className="pl-6 flex flex-col gap-2 mt-2">
                          {cat.children.map((child) => (
                            <label
                              key={child._id}
                              className="flex gap-3 items-center text-gray-600 hover:text-blue-600 transition-colors duration-300"
                            >
                              <input
                                type="checkbox"
                                value={child.slug}
                                checked={category.includes(child.slug)}
                                onChange={(e) =>
                                  toggleFilter(e.target.value, setCategory)
                                }
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                              />
                              <span className="text-sm sm:text-base">
                                {child.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
            </div>
          </div>
          {/* SORTING */}
          <div className="mt-4 sm:mt-6">
            <h5 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
              Sắp xếp theo
            </h5>
            <select
              onChange={(e) => setSortType(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm sm:text-base text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
              value={sortType}
            >
              <option value="low">Giá thấp đến cao</option>
              <option value="high">Giá cao đến thấp</option>
            </select>
          </div>
        </div>
        {/* PRODUCT SECTION */}
        <div className="product-section flex-1 bg-white rounded-xl shadow-sm p-4 sm:p-6 border-t lg:border-t-0 lg:border-l border-gray-300 border-2">
          {isLoading ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: visibleItems }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 text-center">
              <AlertCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 sm:px-6 rounded-lg transition-colors duration-300 text-sm sm:text-base"
              >
                Thử lại
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.length > 0 ? (
                  filteredProducts.slice(0, visibleItems).map((productItem) => (
                    <Item key={productItem._id} productItem={productItem} />
                  ))
                ) : (
                  <div className="col-span-full bg-white rounded-lg shadow-sm p-6 sm:p-8 text-center">
                    <SearchX className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg font-medium mb-4">
                      Không tìm thấy sản phẩm nào với bộ lọc đã chọn
                    </p>
                    <div className="flex justify-center gap-2 sm:gap-4">
                      <button
                        onClick={handleResetFilters}
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 sm:px-6 rounded-lg transition-colors duration-300 text-sm sm:text-base"
                      >
                        Xóa bộ lọc
                      </button>
                      <button
                        onClick={() => window.location.href = "/"}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 sm:px-6 rounded-lg transition-colors duration-300 text-sm sm:text-base"
                      >
                        Về trang chủ
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {/* LOAD MORE BUTTON */}
              {filteredProducts.length > visibleItems && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={handleLoadMore}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition-colors duration-300 text-sm sm:text-base shadow-sm"
                  >
                    Xem thêm
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

Collection.propTypes = {
  search: PropTypes.string,
  categoryTree: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      children: PropTypes.arrayOf(
        PropTypes.shape({
          _id: PropTypes.string.isRequired,
          name: PropTypes.string.isRequired,
          slug: PropTypes.string.isRequired,
        })
      ),
    })
  ),
};

export default Collection;