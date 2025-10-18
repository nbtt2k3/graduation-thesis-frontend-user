"use client";

import React, { useEffect, useState, useMemo, useContext } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Autoplay, Navigation } from "swiper/modules";
import * as apis from "../../apis";
import Title from "../Title/Title";
import { ShopContext } from "../../Context/ShopContext";
import { toast } from "react-hot-toast";

const VoucherProduct = () => {
  const [vouchers, setVouchers] = useState([]);
  const [savedVoucherIds, setSavedVoucherIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDataReady, setIsDataReady] = useState(false);
  const [isSaving, setIsSaving] = useState({});
  const [error, setError] = useState(null);
  const { auth, user } = useContext(ShopContext);

  const getAllVouchers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apis.getAllVouchers();
      if (!response?.voucherList || !Array.isArray(response.voucherList)) {
        throw new Error("Dữ liệu voucher không hợp lệ.");
      }
      setVouchers(response.voucherList);
    } catch (error) {
      setError(error?.msg || "Không thể tải voucher. Vui lòng thử lại sau.");
      toast.error(error?.msg || "Không thể tải voucher. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const getUserSavedVouchers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apis.getAllUserVouchersById();
      if (!res?.success || !Array.isArray(res?.userVoucherList)) {
        throw new Error("Dữ liệu voucher đã lưu không hợp lệ.");
      }
      const ids = res.userVoucherList.map((v) => v.voucherId._id);
      setSavedVoucherIds(ids);
    } catch (error) {
      setError(error?.msg || "Không thể tải voucher đã lưu. Vui lòng thử lại sau.");
      toast.error(error?.msg || "Không thể tải voucher đã lưu. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveVoucher = async (voucherId) => {
    if (isSaving[voucherId]) return;
    setIsSaving((prev) => ({ ...prev, [voucherId]: true }));
    try {
      await apis.createUserVoucher(voucherId);
      setSavedVoucherIds((prev) => [...prev, voucherId]);
      toast.success("Lưu voucher thành công!");
    } catch (error) {
      toast.error(error?.msg || "Không thể lưu voucher. Vui lòng thử lại sau.");
    } finally {
      setIsSaving((prev) => ({ ...prev, [voucherId]: false }));
    }
  };

  const handleRetry = async () => {
    await Promise.all([getAllVouchers(), getUserSavedVouchers()]);
    setIsDataReady(true);
  };

  useEffect(() => {
    if (!auth.isLoggedIn) return;
    handleRetry();
  }, [user, auth.isLoggedIn]);

  const filteredVouchers = useMemo(() => {
    const currentDate = new Date();
    return vouchers
      .filter((voucher) => {
        const validTo = new Date(voucher.validTo);
        return (
          !savedVoucherIds.includes(voucher._id) &&
          validTo >= currentDate
        );
      })
      .slice(0, 5);
  }, [vouchers, savedVoucherIds]);

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

  // Hide the entire section if not logged in or no vouchers (and not loading or in error state)
  if (!auth.isLoggedIn || (filteredVouchers.length === 0 && !isLoading && !error && isDataReady)) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <Title
        title1="Danh sách"
        title2="Voucher"
        titleStyles="pb-8 text-center text-2xl sm:text-3xl font-semibold text-gray-800"
        paraStyles="max-w-xl mx-auto text-gray-600 text-sm sm:text-base"
      />

      {isLoading || !isDataReady ? (
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
              onClick={handleRetry}
              className="mt-4 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-300 text-sm"
            >
              Thử lại
            </button>
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
          {filteredVouchers.map((voucher) => (
            <SwiperSlide key={voucher._id} className="py-2">
              <div className="p-4 sm:p-5 w-full max-w-[260px] mx-auto border border-gray-200 rounded-2xl shadow-sm transition-transform duration-300 hover:scale-105 hover:shadow-lg bg-white flex flex-col justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-red-600 mb-2 truncate">
                    {voucher.name} ({voucher.code})
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {voucher.description}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Giảm tối đa:</span>{" "}
                    {voucher.maxValue.toLocaleString()}đ
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Từ:</span>{" "}
                    {new Date(voucher.validFrom).toLocaleDateString("vi-VN")} <br />
                    <span className="font-medium">Đến:</span>{" "}
                    {new Date(voucher.validTo).toLocaleDateString("vi-VN")}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <span className="font-medium">Đơn tối thiểu:</span>{" "}
                    {voucher.minValue.toLocaleString()}đ
                  </p>
                </div>
                <button
                  onClick={() => handleSaveVoucher(voucher._id)}
                  disabled={isSaving[voucher._id]}
                  className={`mt-4 w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg transition-colors duration-300 text-sm ${
                    isSaving[voucher._id]
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-blue-700"
                  }`}
                >
                  {isSaving[voucher._id] ? "Đang lưu..." : "Lưu Voucher"}
                </button>
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

export default VoucherProduct;