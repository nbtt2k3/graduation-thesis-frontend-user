"use client";

import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { useState } from "react";

const Item = ({ productItem }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!productItem) return null;

  const originalPrice = productItem.retailPrice || 0;
  const discountedPrice = productItem.discountedPrice || originalPrice;
  const onSale = discountedPrice < originalPrice && originalPrice > 0;
  const discountAmount = originalPrice - discountedPrice;
  const percentage = originalPrice > 0 ? Math.floor((discountAmount / originalPrice) * 100) : 0;
  const showDiscount = onSale && discountAmount >= 1000 && percentage >= 1;

  const mainImage = productItem.thumbUrl || "/placeholder.svg";
  const rating = Math.max(0, Math.min(5, productItem.ratingAvg || 0));
  const productName = productItem.name || "Unnamed Product";
  const reviewCount = Math.max(0, productItem.reviewCount || 0);

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const totalStars = 5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FaStar key={`full-${i}`} className="w-4 h-4 text-yellow-400" />
      );
    }
    if (hasHalfStar) {
      stars.push(
        <div className="relative w-4 h-4" key="half">
          <FaStar className="w-4 h-4 text-gray-300" />
          <FaStar
            className="w-4 h-4 text-yellow-400 absolute top-0 left-0"
            style={{ clipPath: "inset(0 50% 0 0)" }}
          />
        </div>
      );
    }
    for (let i = stars.length; i < totalStars; i++) {
      stars.push(
        <FaStar key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      );
    }
    return stars;
  };

  return (
    <Link
      to={`/product/${productItem.productId}?sku=${productItem.sku || ""}`}
      className="group cursor-pointer overflow-hidden rounded-lg shadow-sm border bg-white h-full flex flex-col relative select-none"
    >
      {/* Banner giảm giá */}
      {showDiscount && (
        <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md z-10">
          Giảm {percentage}%
        </span>
      )}

      {/* Ảnh */}
      <div className="relative p-4 bg-white flex items-center justify-center h-52 overflow-hidden group-hover:scale-110 transition-transform duration-300">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
        )}
        <img
          src={mainImage}
          alt={productName}
          className={`object-contain w-full h-full transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
        />
      </div>

      {/* Nội dung */}
      <div className="p-4 flex-grow flex flex-col justify-between gap-2">
        <h4 className="font-semibold text-base sm:text-lg line-clamp-2 mb-2 min-h-[2.5rem] sm:min-h-[3rem]">
          {productName}
        </h4>

        <div className="flex items-center justify-between">
          <div className="text-right">
            {onSale ? (
              <>
                <p className="text-xs text-gray-500 line-through">
                  {originalPrice.toLocaleString("vi-VN")}đ
                </p>
                <p className="text-base sm:text-lg font-semibold text-red-600">
                  {discountedPrice.toLocaleString("vi-VN")}đ
                </p>
              </>
            ) : (
              <p className="text-base sm:text-lg font-semibold text-gray-800">
                {originalPrice.toLocaleString("vi-VN")}đ
              </p>
            )}
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {renderStars()}
            <span className="text-xs text-gray-500">({reviewCount})</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Item;