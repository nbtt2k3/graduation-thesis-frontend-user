import React from "react";

const AddressForm = ({ editData, handleChange, handleSubmit, handleCancel, title }) => {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block mb-1 font-medium">Họ và tên</label>
          <input
            type="text"
            name="fullName"
            value={editData.fullName}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập họ và tên"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Số điện thoại</label>
          <input
            type="text"
            name="phoneNumber"
            value={editData.phoneNumber}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập số điện thoại"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Tỉnh/Thành phố</label>
          <input
            type="text"
            name="province"
            value={editData.province}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập tỉnh/thành phố"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Quận/Huyện</label>
          <input
            type="text"
            name="district"
            value={editData.district}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập quận/huyện"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Phường/Xã</label>
          <input
            type="text"
            name="ward"
            value={editData.ward}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập phường/xã"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Địa chỉ cụ thể</label>
          <input
            type="text"
            name="specificAddress"
            value={editData.specificAddress}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập địa chỉ cụ thể"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Mã bưu chính</label>
          <input
            type="text"
            name="postalCode"
            value={editData.postalCode}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập mã bưu chính"
          />
        </div>
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isDefault"
              checked={editData.isDefault}
              onChange={handleChange}
              className="w-4 h-4"
            />
            Đặt làm địa chỉ mặc định
          </label>
        </div>
        <div className="flex gap-4">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Lưu thay đổi
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;