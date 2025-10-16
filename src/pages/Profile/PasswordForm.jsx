"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

const PasswordForm = ({ editData, handleChange, handleChangePassword }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      currentPassword: editData.currentPassword || "",
      newPassword: editData.newPassword || "",
      confirmPassword: editData.confirmPassword || "",
    },
    mode: "onChange",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = (field) => {
    if (field === "currentPassword") setShowCurrentPassword(!showCurrentPassword);
    else if (field === "newPassword") setShowNewPassword(!showNewPassword);
    else if (field === "confirmPassword") setShowConfirmPassword(!showConfirmPassword);
  };

  const onSubmit = (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Mật khẩu mới và xác nhận không khớp.");
      return;
    }
    handleChangePassword({ preventDefault: () => {}, target: data });
    reset();
  };

  const handleCancel = () => {
    reset();
    handleChange({ target: { name: "currentPassword", value: "", type: "text" } });
    handleChange({ target: { name: "newPassword", value: "", type: "text" } });
    handleChange({ target: { name: "confirmPassword", value: "", type: "text" } });
  };

  const inputStyles = "w-full p-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors";
  const labelStyles = "block text-sm font-medium text-gray-700 mb-1";
  const errorStyles = "text-xs text-red-500 mt-1";
  const buttonStyles = "w-full sm:w-auto px-4 py-2 rounded-md text-sm font-medium transition-colors min-w-[80px] whitespace-nowrap";

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6 max-w-2xl mx-auto">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
        Đổi mật khẩu
      </h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className={labelStyles}>Mật khẩu hiện tại</label>
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              {...register("currentPassword", {
                required: "Mật khẩu hiện tại là bắt buộc",
                minLength: {
                  value: 6,
                  message: "Mật khẩu phải có ít nhất 6 ký tự",
                },
              })}
              placeholder="Nhập mật khẩu hiện tại"
              className={inputStyles}
              onChange={(e) => {
                handleChange(e);
                register("currentPassword").onChange(e);
              }}
              aria-describedby="currentPassword-error"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("currentPassword")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 min-w-[40px] h-10"
              aria-label={showCurrentPassword ? "Ẩn mật khẩu hiện tại" : "Hiện mật khẩu hiện tại"}
            >
              {showCurrentPassword ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7 1.275-4.057 5.065-7 9.543-7 4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-1.668 3.825M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7 1.275-4.057 5.065-7 9.543-7 4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-1.668 3.825M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 3l18 18"
                  />
                </svg>
              )}
            </button>
          </div>
          {errors.currentPassword && (
            <p id="currentPassword-error" className={errorStyles}>
              {errors.currentPassword.message}
            </p>
          )}
        </div>
        <div>
          <label className={labelStyles}>Mật khẩu mới</label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              {...register("newPassword", {
                required: "Mật khẩu mới là bắt buộc",
                minLength: {
                  value: 6,
                  message: "Mật khẩu phải có ít nhất 6 ký tự",
                },
              })}
              placeholder="Nhập mật khẩu mới"
              className={inputStyles}
              onChange={(e) => {
                handleChange(e);
                register("newPassword").onChange(e);
              }}
              aria-describedby="newPassword-error"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("newPassword")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 min-w-[40px] h-10"
              aria-label={showNewPassword ? "Ẩn mật khẩu mới" : "Hiện mật khẩu mới"}
            >
              {showNewPassword ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7 1.275-4.057 5.065-7 9.543-7 4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-1.668 3.825M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7 1.275-4.057 5.065-7 9.543-7 4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-1.668 3.825M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 3l18 18"
                  />
                </svg>
              )}
            </button>
          </div>
          {errors.newPassword && (
            <p id="newPassword-error" className={errorStyles}>
              {errors.newPassword.message}
            </p>
          )}
        </div>
        <div>
          <label className={labelStyles}>Xác nhận mật khẩu mới</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword", {
                required: "Xác nhận mật khẩu là bắt buộc",
                minLength: {
                  value: 6,
                  message: "Mật khẩu phải có ít nhất 6 ký tự",
                },
                validate: (value, { newPassword }) => value === newPassword || "Mật khẩu không khớp",
              })}
              placeholder="Xác nhận mật khẩu mới"
              className={inputStyles}
              onChange={(e) => {
                handleChange(e);
                register("confirmPassword").onChange(e);
              }}
              aria-describedby="confirmPassword-error"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility("confirmPassword")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 min-w-[40px] h-10"
              aria-label={showConfirmPassword ? "Ẩn xác nhận mật khẩu" : "Hiện xác nhận mật khẩu"}
            >
              {showConfirmPassword ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7 1.275-4.057 5.065-7 9.543-7 4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-1.668 3.825M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7 1.275-4.057 5.065-7 9.543-7 4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-1.668 3.825M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 3l18 18"
                  />
                </svg>
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p id="confirmPassword-error" className={errorStyles}>
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
        <div className="flex gap-3 mt-4">
          <button
            type="submit"
            className={`${buttonStyles} bg-blue-600 text-white hover:bg-blue-700`}
            aria-label="Lưu mật khẩu mới"
          >
            Lưu
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className={`${buttonStyles} bg-gray-200 text-gray-700 hover:bg-gray-300`}
            aria-label="Hủy đổi mật khẩu"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default PasswordForm;