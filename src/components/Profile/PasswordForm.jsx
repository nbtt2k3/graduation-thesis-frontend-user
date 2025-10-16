import React from "react";

const PasswordForm = ({ editData, handleChange, handleChangePassword }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Đổi mật khẩu</h2>
      <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
        <div>
          <label className="block mb-1 font-medium">Mật khẩu hiện tại</label>
          <input
            type="password"
            name="currentPassword"
            value={editData.currentPassword}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập mật khẩu hiện tại"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Mật khẩu mới</label>
          <input
            type="password"
            name="newPassword"
            value={editData.newPassword}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập mật khẩu mới"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Xác nhận mật khẩu mới</label>
          <input
            type="password"
            name="confirmPassword"
            value={editData.confirmPassword}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nhập lại mật khẩu mới"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Đổi mật khẩu
        </button>
      </form>
    </div>
  );
};

export default PasswordForm;