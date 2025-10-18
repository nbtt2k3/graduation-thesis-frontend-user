"use client";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import * as apis from "../../apis";

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWishlist = async () => {
      setIsLoading(true);
      try {
        const response = await apis.apiGetAllWishlists();
        if (response.success && Array.isArray(response.wishlists)) {
          const formattedWishlist = response.wishlists.map((item) => ({
            _id: item._id,
            productId: item.productItemId.productId, // Use productItemId.productId for navigation
            productItemId: item.productItemId._id, // Store productItemId._id for removal
            name: item.productItemId.name,
            price: item.productItemId.retailPrice,
            description:
              item.productItemId.specifications?.[0]?.items?.[0]?.value ||
              "Không có mô tả",
            image:
              item.productItemId.thumbUrl || "https://placehold.co/100x100",
            attributes: item.productItemId.attributes || [],
            sku: item.productItemId.sku, // Use productItemId.sku for navigation
            addedAt: new Date(item.createdAt).toLocaleDateString("vi-VN"),
          }));
          setWishlistItems(formattedWishlist);
        } else {
          setWishlistItems([]);
          toast.error(response.msg || "Không thể tải danh sách yêu thích!");
        }
      } catch (error) {
        toast.error(error.msg || "Không thể tải danh sách yêu thích!");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const handleRemoveFromWishlist = async (productItemId) => {
    try {
      const response = await apis.apiRemoveFromWishlist(productItemId);
      if (response.success) {
        setWishlistItems((prev) =>
          prev.filter((item) => item.productItemId !== productItemId)
        );
        toast.success("Đã xóa sản phẩm khỏi danh sách yêu thích!");
      } else {
        throw new Error(response.msg || "Không thể xóa sản phẩm!");
      }
    } catch (error) {
      toast.error(error.msg || "Không thể xóa sản phẩm!");
    }
  };

  const handleNavigateToProduct = (productId, sku) => {
    navigate(`/product/${productId}?sku=${sku}`);
  };

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      {isLoading ? (
        <div className="flex justify-center items-center py-6">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-2 text-sm text-gray-600">Đang tải...</p>
        </div>
      ) : wishlistItems.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-6">
          Hiện tại chưa có sản phẩm nào trong danh sách yêu thích của bạn.
        </p>
      ) : (
        <div className="space-y-4">
          {wishlistItems.map((item) => (
            <div
              key={item._id}
              className="border border-gray-300 bg-gray-100 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-md"
                />
                <div className="flex-1">
                  <h3
                    className="text-base font-semibold text-gray-900 hover:text-blue-600 hover:underline cursor-pointer"
                    onClick={() =>
                      handleNavigateToProduct(item.productId, item.sku)
                    }
                  >
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  <p className="text-sm text-gray-600">
                    Giá: {item.price.toLocaleString("vi-VN")} VNĐ
                  </p>
                  {item.attributes.length > 0 && (
                    <div className="text-sm text-gray-600">
                      {item.attributes.map((attr) => (
                        <p key={attr._id}>
                          {attr.code}: {attr.value}
                        </p>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-gray-600">
                    Thêm vào: {item.addedAt}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleRemoveFromWishlist(item.productItemId)}
                className="mt-2 text-sm text-red-500 hover:underline"
              >
                Xóa
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
