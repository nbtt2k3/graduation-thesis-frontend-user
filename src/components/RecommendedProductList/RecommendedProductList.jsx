"use client";

import { useEffect, useState, useMemo, useContext } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Autoplay, Navigation } from "swiper/modules";
import Title from "../Title/Title";
import Item from "../Item/Item";
import * as apis from "../../apis";
import { toast } from "react-hot-toast";
import { ShopContext } from "../../Context/ShopContext";

const RecommendedProductList = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy trạng thái đăng nhập từ context
  const { auth } = useContext(ShopContext);
  const isLoggedIn = auth.isLoggedIn;

  // 🔹 Hàm gọi API gợi ý sản phẩm
  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apis.apiGetRecommendationsForNewUserService();

      if (
        !response?.data?.recommendedProductList ||
        !Array.isArray(response.data.recommendedProductList)
      ) {
        throw new Error("Dữ liệu sản phẩm đề xuất không hợp lệ.");
      }

      // ✅ Gán trực tiếp danh sách gợi ý (đã sắp theo predicted_rating từ backend)
      setProducts(response.data.recommendedProductList);

      // ✅ Log thứ tự để kiểm tra
      console.log("🔍 Danh sách sản phẩm từ backend (đã sắp theo predicted_rating):");
      response.data.recommendedProductList.forEach((p, i) => {
        console.log(`#${i + 1}. ${p.name || "Không tên"} (${p.predicted_rating || "?"})`);
      });

    } catch (error) {
      setError(error?.msg || "Không thể tải sản phẩm đề xuất. Vui lòng thử lại sau.");
      toast.error(error?.msg || "Không thể tải sản phẩm đề xuất. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔸 Gọi API khi người dùng đăng nhập
  useEffect(() => {
    if (isLoggedIn) {
      fetchRecommendations();
    }
  }, [isLoggedIn]);

  // 🔹 Lọc trùng, giữ nguyên thứ tự backend
  const uniqueProducts = useMemo(() => {
    const seen = new Set();
    return products.filter((p) => {
      const key = p._id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [products]);

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

  // Ẩn toàn bộ nếu chưa đăng nhập hoặc không có sản phẩm
  if (!isLoggedIn || (uniqueProducts.length === 0 && !isLoading && !error)) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <Title
        title1="Có thể bạn"
        title2="sẽ thích"
        titleStyles="pb-8 text-center text-2xl sm:text-3xl font-semibold text-gray-800"
        paraStyles="max-w-xl mx-auto text-gray-600 text-sm sm:text-base"
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
            {isLoggedIn && (
              <button
                onClick={fetchRecommendations}
                className="mt-4 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-300 text-sm"
              >
                Thử lại
              </button>
            )}
          </div>
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
          {uniqueProducts.map((productItem, index) => (
            <SwiperSlide key={productItem._id || index} className="py-2">
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

export default RecommendedProductList;
