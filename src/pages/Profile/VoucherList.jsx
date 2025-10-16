"use client";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import * as apis from "../../apis";

const VoucherList = () => {
  const [vouchers, setVouchers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchVouchers = async () => {
      setIsLoading(true);
      try {
        const response = await apis.getAllUserVouchersById();
        if (response.success && Array.isArray(response.userVoucherList)) {
          const formattedVouchers = response.userVoucherList.map((voucher) => ({
            _id: voucher._id,
            voucherId: voucher.voucherId._id,
            name: voucher.voucherId.name,
            code: voucher.voucherId.code,
            description: voucher.voucherId.description,
            type: voucher.voucherId.type,
            value: voucher.voucherId.value,
            minValue: voucher.voucherId.minValue,
            maxValue: voucher.voucherId.maxValue,
            validFrom: new Date(voucher.voucherId.validFrom).toLocaleDateString("vi-VN"),
            validTo: new Date(voucher.voucherId.validTo).toLocaleDateString("vi-VN"),
            applyTo: voucher.voucherId.applyTo,
            isActive: voucher.voucherId.isActive,
            isUsed: voucher.isUsed,
          }));
          setVouchers(formattedVouchers);
        }
      } catch (error) {
        toast.error(error.msg || "Không thể tải danh sách voucher!");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md max-w-2xl mx-auto">
      {isLoading ? (
        <div className="flex justify-center items-center py-6">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="ml-2 text-sm text-gray-600">Đang tải...</p>
        </div>
      ) : vouchers.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-6">
          Bạn chưa có voucher nào.
        </p>
      ) : (
        <div className="space-y-4">
          {vouchers.map((voucher) => (
            <div
              key={voucher._id}
              className="border border-gray-300 bg-gray-100 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-base font-semibold text-gray-900">{voucher.name}</h3>
              <p className="text-sm text-gray-600">Mã: <span className="font-medium">{voucher.code}</span></p>
              <p className="text-sm text-gray-600">{voucher.description}</p>
              <p className="text-sm text-gray-600">
                Giá trị: {voucher.type === "percentage" ? `${voucher.value}%` : `${voucher.value.toLocaleString("vi-VN")} VNĐ`}
              </p>
              <p className="text-sm text-gray-600">
                Đơn tối thiểu: {voucher.minValue.toLocaleString("vi-VN")} VNĐ
              </p>
              <p className="text-sm text-gray-600">
                Đơn tối đa: {voucher.maxValue.toLocaleString("vi-VN")} VNĐ
              </p>
              <p className="text-sm text-gray-600">
                Hiệu lực: {voucher.validFrom} - {voucher.validTo}
              </p>
              <p className="text-sm text-gray-600">
                Áp dụng cho: {voucher.applyTo === "product" ? "Sản phẩm" : "Đơn hàng"}
              </p>
              <p className="text-sm text-gray-600 flex justify-between items-center">
                Trạng thái:
                <span className={`ml-2 px-2 py-1 rounded ${voucher.isUsed ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                  {voucher.isUsed ? "Đã sử dụng" : "Chưa sử dụng"}
                </span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VoucherList;