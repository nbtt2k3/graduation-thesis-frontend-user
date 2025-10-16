"use client";

import React, { useContext, useState, useEffect, useMemo } from "react";
import { ShopContext } from "../../Context/ShopContext";
import Title from "../../components/Title/Title";
import { FaRegWindowClose } from "react-icons/fa";
import { FaMinus, FaPlus } from "react-icons/fa6";
import CartTotal from "../../components/CartTotal/CartTotal";
import { toast } from "react-hot-toast";
import * as apis from "../../apis";
import { debounce } from "lodash";

// Hàm xử lý lỗi API chung
const handleApiError = (error, defaultMessage) => {
  toast.error(error.msg || defaultMessage, { duration: 4000 });
};

const Cart = () => {
  const { currency, navigate, cartItems, fetchCart } = useContext(ShopContext);
  const [localQuantities, setLocalQuantities] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Đồng bộ localQuantities với cartItems khi cartItems thay đổi
  useEffect(() => {
    if (cartItems?.items) {
      const updatedQuantities = cartItems.items.reduce((acc, item) => {
        const id = item?.productItem?._id;
        if (id) {
          acc[id] = item?.quantity ?? 1;
        }
        return acc;
      }, {});
      setLocalQuantities(updatedQuantities);
    }
  }, [cartItems]);

  const debouncedUpdateQuantity = debounce(async (productItemId, quantity) => {
    setIsLoading(true);
    try {
      const response = await apis.apiUpdateQuantity({
        productItemId,
        quantity,
      });
      if (!response.success) {
        throw new Error("Cập nhật số lượng không thành công!");
      }
      await fetchCart(); // Làm mới dữ liệu giỏ hàng từ server
      if (quantity === 0) {
        toast.success("Đã xóa sản phẩm khỏi giỏ hàng!");
      } else {
        toast.success("Cập nhật số lượng thành công!");
      }
    } catch (error) {
      // Hoàn nguyên localQuantities nếu có lỗi
      setLocalQuantities((prev) => ({
        ...prev,
        [productItemId]:
          cartItems?.items?.find(
            (item) => item?.productItem?._id === productItemId
          )?.quantity ?? 1,
      }));
      handleApiError(error, "Đã xảy ra lỗi khi cập nhật giỏ hàng!");
    } finally {
      setIsLoading(false);
    }
  }, 300);

  const updateQuantity = (productItemId, quantity) => {
    debouncedUpdateQuantity(productItemId, quantity);
  };

  const increment = (id, quantity, maxQuantity = Infinity) => {
    const newQuantity = (Number(quantity) || 0) + 1;
    if (newQuantity > maxQuantity) {
      toast.info(`Số lượng tối đa là ${maxQuantity}`);
      return;
    }
    setLocalQuantities((prev) => ({
      ...prev,
      [id]: newQuantity,
    }));
    updateQuantity(id, newQuantity);
  };

  const decrement = (id, quantity) => {
    if (quantity > 1) {
      const newQuantity = Number(quantity) - 1;
      setLocalQuantities((prev) => ({
        ...prev,
        [id]: newQuantity,
      }));
      updateQuantity(id, newQuantity);
    } else {
      toast.info("Số lượng tối thiểu là 1");
    }
  };

  const totalAmount = useMemo(() => {
    const itemsTotal =
      cartItems?.items?.reduce((sum, item) => {
        const quantity =
          localQuantities[item?.productItem?._id] ?? item?.quantity ?? 1;
        return sum + Number(item.finalPrice ?? 0) * Number(quantity);
      }, 0) ?? 0;

    const shippingFee = cartItems?.shippingFee ?? 0;
    return itemsTotal + shippingFee;
  }, [cartItems, localQuantities]);

  if (!cartItems || !cartItems.items) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-x-4">
            <Title
              title={"Danh sách"}
              title2={"sản phẩm"}
              title1Styles={"text-xl font-bold"}
            />
            <h5 className="text-base font-medium text-gray-500">
              (0 Sản phẩm)
            </h5>
          </div>
          <p className="text-center text-gray-500 mt-6 text-sm">
            Giỏ hàng trống
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-x-4">
          <Title
            title={"Danh sách"}
            title2={"sản phẩm"}
            title1Styles={"text-xl font-bold"}
          />
          <h5 className="text-base font-medium text-gray-500">
            ({cartItems?.totalItems || 0} Sản phẩm)
          </h5>
        </div>

        <div className="mt-6">
          {cartItems.items.length > 0 ? (
            cartItems.items.map((item, i) => {
              const id = item?.productItem?._id;
              const localValue =
                localQuantities[id] !== undefined
                  ? localQuantities[id]
                  : (item?.quantity ?? 1);
              const maxQuantity = item?.productItem?.stock ?? Infinity;

              return (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm"
                >
                  <div className="flex items-center gap-x-4">
                    <img
                      src={
                        item?.productItem?.thumbUrl ||
                        "https://via.placeholder.com/150"
                      }
                      alt={item?.productItem?.name || "Sản phẩm"}
                      className="w-16 sm:w-20 rounded-md object-cover"
                    />

                    <div className="flex flex-col w-full">
                      <div className="flex justify-between items-start">
                        <h5 className="text-lg font-medium line-clamp-1">
                          {item?.productItem?.name || "Unknown Product"}
                        </h5>
                        <button
                          onClick={() => !isLoading && updateQuantity(id, 0)}
                          className="text-gray-500 hover:text-red-500 transition-colors"
                          aria-label={`Xóa sản phẩm ${item?.productItem?.name}`}
                          disabled={isLoading}
                        >
                          <FaRegWindowClose className="text-lg" />
                        </button>
                      </div>

                      {Array.isArray(item?.productItem?.attributes) &&
                        item.productItem.attributes.map((attr, index) => (
                          <p key={index} className="text-sm text-gray-600 mt-1">
                            {attr.code}: {attr.value || "N/A"}
                          </p>
                        ))}

                      <div className="flex justify-between items-center mt-3">
                        <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                          <button
                            onClick={() =>
                              !isLoading && decrement(id, localValue)
                            }
                            aria-label={`Giảm số lượng sản phẩm ${item?.productItem?.name}`}
                            className="p-2 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                            disabled={isLoading}
                          >
                            <FaMinus className="text-xs" />
                          </button>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={localValue}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (
                                /^\d*$/.test(val) &&
                                (val === "" || Number(val) <= maxQuantity)
                              ) {
                                setLocalQuantities((prev) => ({
                                  ...prev,
                                  [id]: val,
                                }));
                              }
                            }}
                            onBlur={(e) => {
                              const val = e.target.value.trim();
                              if (val === "" || Number(val) < 1) {
                                setLocalQuantities((prev) => ({
                                  ...prev,
                                  [id]: item?.quantity ?? 1,
                                }));
                                toast.info("Số lượng tối thiểu là 1");
                              } else if (Number(val) > maxQuantity) {
                                setLocalQuantities((prev) => ({
                                  ...prev,
                                  [id]: maxQuantity,
                                }));
                                toast.info(`Số lượng tối đa là ${maxQuantity}`);
                                updateQuantity(id, maxQuantity);
                              } else {
                                updateQuantity(id, Number(val));
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                const val = e.target.value.trim();
                                if (val === "" || Number(val) < 1) {
                                  setLocalQuantities((prev) => ({
                                    ...prev,
                                    [id]: item?.quantity ?? 1,
                                  }));
                                  toast.info("Số lượng tối thiểu là 1");
                                } else if (Number(val) > maxQuantity) {
                                  setLocalQuantities((prev) => ({
                                    ...prev,
                                    [id]: maxQuantity,
                                  }));
                                  toast.info(`Số lượng tối đa là ${maxQuantity}`);
                                  updateQuantity(id, maxQuantity);
                                } else {
                                  updateQuantity(id, Number(val));
                                }
                                e.target.blur();
                              }
                            }}
                            className="w-12 text-center border-x border-gray-200 outline-none text-sm"
                            disabled={isLoading}
                            aria-label={`Số lượng sản phẩm ${item?.productItem?.name}`}
                          />
                          <button
                            onClick={() =>
                              !isLoading && increment(id, localValue, maxQuantity)
                            }
                            aria-label={`Tăng số lượng sản phẩm ${item?.productItem?.name}`}
                            className="p-2 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                            disabled={isLoading}
                          >
                            <FaPlus className="text-xs" />
                          </button>
                        </div>

                        <div className="text-right">
                          <h4 className="text-lg font-semibold text-red-500">
                            {(
                              Number(item?.finalPrice ?? 0) * Number(localValue)
                            ).toLocaleString("vi-VN")}{" "}
                            {currency}
                          </h4>
                          {Number(item?.originalPrice ?? 0) >
                            Number(item?.finalPrice ?? 0) && (
                            <p className="text-sm text-gray-500 line-through">
                              {(
                                Number(item?.originalPrice ?? 0) *
                                Number(localValue)
                              ).toLocaleString("vi-VN")}{" "}
                              {currency}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-500 text-sm">
              Giỏ hàng trống
            </p>
          )}
        </div>

        <div className="mt-10">
          <div className="w-full sm:max-w-md">
            <CartTotal
              totalAmount={totalAmount}
              shippingFee={cartItems?.shippingFee}
            />
            <button
              disabled={!cartItems?.totalItems || isLoading}
              onClick={() => navigate("/place-order")}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mt-4"
              aria-label={
                !cartItems?.totalItems
                  ? "Giỏ hàng trống, không thể thanh toán"
                  : isLoading
                  ? "Đang xử lý, vui lòng đợi"
                  : "Thanh toán ngay"
              }
            >
              Thanh toán ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;