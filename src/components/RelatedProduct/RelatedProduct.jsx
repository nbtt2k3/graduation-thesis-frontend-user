"use client";

import { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Autoplay, Navigation } from "swiper/modules";
import Title from "../Title/Title";
import Item from "../Item/Item";
import {
  apiGetRelatedProductItems,
  apiGetSimilarItems,
} from "../../apis/product";
import { toast } from "react-hot-toast";

const RelatedProduct = ({ productItemId }) => {
  const [productItems, setProductItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔍 Lấy danh sách sản phẩm tương tự hoặc liên quan
  const fetchRelatedProductItems = async () => {
    if (!productItemId) {
      setProductItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Ưu tiên lấy từ mô hình MF (Python API)
      const responseSimilar = await apiGetSimilarItems(productItemId);

      if (
        responseSimilar?.success &&
        responseSimilar?.data?.success &&
        Array.isArray(responseSimilar?.data?.recommendedProductList) &&
        responseSimilar.data.recommendedProductList.length > 0
      ) {
        // ✅ Sắp xếp theo similarity_score giảm dần
        const sortedList = [...responseSimilar.data.recommendedProductList].sort(
          (a, b) => (b.similarity_score || 0) - (a.similarity_score || 0)
        );
        setProductItems(sortedList);
      } else {
        // 🔁 Fallback sang API sản phẩm liên quan
        const responseRelated = await apiGetRelatedProductItems(productItemId, {
          limit: 10,
        });

        if (
          !responseRelated?.success ||
          !Array.isArray(responseRelated.productItemList)
        ) {
          throw new Error(
            responseRelated?.msg || "Dữ liệu sản phẩm không hợp lệ."
          );
        }

        setProductItems(responseRelated.productItemList);
      }
    } catch (error) {
      setError(
        error?.msg || "Không thể tải sản phẩm liên quan. Vui lòng thử lại sau."
      );
      toast.error(
        error?.msg || "Không thể tải sản phẩm liên quan. Vui lòng thử lại sau."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Gọi API khi thay đổi productItemId
  useEffect(() => {
    fetchRelatedProductItems();
  }, [productItemId]);

  // 🔧 Lọc trùng & bỏ sản phẩm gốc, giữ thứ tự theo similarity_score
  const uniqueProductItems = useMemo(() => {
    const seen = new Set();
    return productItems
      .filter((p) => {
        const key = p._id;
        if (seen.has(key) || p._id === productItemId) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 10);
  }, [productItems, productItemId]);

  const swiperBreakpoints = useMemo(
    () => ({
      320: { slidesPerView: 1, spaceBetween: 16 },
      480: { slidesPerView: 2, spaceBetween: 20 },
      640: { slidesPerView: 3, spaceBetween: 24 },
      768: { slidesPerView: 4, spaceBetween: 24 },
      1024: { slidesPerView: 5, spaceBetween: 30 },
    }),
    []
  );

  return (
    <section
      className="max-w-7xl mx-auto py-8 md:py-12"
      aria-label="Sản phẩm liên quan"
    >
      <Title
        title1="Sản phẩm"
        title2="liên quan"
        titleStyles="pb-8 text-center text-2xl sm:text-3xl font-semibold text-gray-800"
        paraStyles="max-w-xl mx-auto text-gray-600 text-sm sm:text-base"
        showDescription={false}
      />

      {isLoading ? (
        <div className="mt-6 min-h-[200px] flex items-center justify-center">
          <div className="animate-pulse flex space-x-4">
            <div className="w-60 h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg" />
            <div className="w-60 h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg hidden sm:block" />
            <div className="w-60 h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg hidden md:block" />
          </div>
        </div>
      ) : error ? (
        <div className="mt-6 min-h-[200px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 text-lg font-medium">{error}</p>
            <button
              onClick={fetchRelatedProductItems}
              className="mt-4 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-300 text-sm"
            >
              Thử lại
            </button>
          </div>
        </div>
      ) : uniqueProductItems.length === 0 ? (
        <div className="mt-6 min-h-[200px] flex items-center justify-center">
          <p className="text-gray-500 text-lg font-medium">
            Không có sản phẩm liên quan.
          </p>
        </div>
      ) : (
        <Swiper
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          navigation={{
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          }}
          breakpoints={swiperBreakpoints}
          modules={[Autoplay, Navigation]}
          className="mt-6 min-h-[200px] md:min-h-[250px] lg:min-h-[300px] w-full"
        >
          {uniqueProductItems.map((productItem) => (
            <SwiperSlide key={productItem._id} className="py-2">
              <div className="w-full max-w-[260px] mx-auto">
                <Item productItem={productItem} />
              </div>
            </SwiperSlide>
          ))}
          <div className="swiper-button-prev !text-blue-600 !w-10 !h-10 after:text-lg" />
          <div className="swiper-button-next !text-blue-600 !w-10 !h-10 after:text-lg" />
        </Swiper>
      )}
    </section>
  );
};

RelatedProduct.propTypes = {
  productItemId: PropTypes.string.isRequired,
};

export default RelatedProduct;
