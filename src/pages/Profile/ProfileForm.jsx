"use client";
import { useForm } from "react-hook-form";
import { useRef, useState } from "react";

const ProfileForm = ({
  editData,
  handleChange,
  handleAvatarChange,
  handleSaveProfile,
  isEditingProfile,
  setIsEditingProfile,
  cancelEditProfile,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      firstName: editData.firstName || "",
      lastName: editData.lastName || "",
      email: editData.email || "",
      phone: editData.phone || "",
      gender: editData.gender || "",
      dob: editData.dob || "",
    },
    mode: "onChange",
  });

  const fileInputRef = useRef(null);
  const [isSaving, setIsSaving] = useState(false);

  const onSubmit = async () => {
    setIsSaving(true);
    try {
      await handleSaveProfile(fileInputRef);
      setIsEditingProfile(false);
      reset();
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    cancelEditProfile();
    setIsEditingProfile(false);
    reset();
  };

  const inputStyles = "w-full p-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors";
  const labelStyles = "block text-sm font-medium text-gray-700 mb-1";
  const errorStyles = "text-xs text-red-600 mt-1";
  const buttonStyles = "px-4 py-2 rounded-md text-sm font-medium transition-colors min-w-[80px] whitespace-nowrap";
  const primaryButtonStyles = `${buttonStyles} bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed`;
  const secondaryButtonStyles = `${buttonStyles} bg-gray-200 text-gray-700 hover:bg-gray-300`;

  return (
    <div className="p-4 sm:p-6 bg-white border border-gray-200 rounded-lg shadow-sm max-w-2xl mx-auto">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
        Thông tin cá nhân
      </h3>
      {isEditingProfile ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelStyles}>Họ</label>
              <input
                {...register("firstName", { required: "Họ là bắt buộc" })}
                name="firstName"
                value={editData.firstName}
                onChange={handleChange}
                placeholder="Nhập họ"
                className={inputStyles}
                aria-describedby="firstName-error"
              />
              {errors.firstName && (
                <p id="firstName-error" className={errorStyles}>
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <label className={labelStyles}>Tên</label>
              <input
                {...register("lastName", { required: "Tên là bắt buộc" })}
                name="lastName"
                value={editData.lastName}
                onChange={handleChange}
                placeholder="Nhập tên"
                className={inputStyles}
                aria-describedby="lastName-error"
              />
              {errors.lastName && (
                <p id="lastName-error" className={errorStyles}>
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>
          <div>
            <label className={labelStyles}>Email</label>
            <input
              {...register("email", {
                required: "Email là bắt buộc",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "Email không hợp lệ",
                },
              })}
              name="email"
              value={editData.email}
              disabled
              className={`${inputStyles} bg-gray-100 cursor-not-allowed`}
              aria-describedby="email-error"
            />
            {errors.email && (
              <p id="email-error" className={errorStyles}>
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label className={labelStyles}>Số điện thoại</label>
            <input
              {...register("phone", {
                required: "Số điện thoại là bắt buộc",
                pattern: {
                  value: /^(0[3|5|7|8|9])[0-9]{8}$/,
                  message: "Số điện thoại không hợp lệ",
                },
              })}
              name="phone"
              value={editData.phone}
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
              className={inputStyles}
              aria-describedby="phone-error"
            />
            {errors.phone && (
              <p id="phone-error" className={errorStyles}>
                {errors.phone.message}
              </p>
            )}
          </div>
          <div>
            <label className={labelStyles}>Giới tính</label>
            <select
              {...register("gender")}
              name="gender"
              value={editData.gender}
              onChange={handleChange}
              className={inputStyles}
            >
              <option value="">Chọn giới tính</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
          <div>
            <label className={labelStyles}>Ngày sinh</label>
            <input
              {...register("dob")}
              type="date"
              name="dob"
              value={editData.dob}
              onChange={handleChange}
              className={inputStyles}
            />
          </div>
          <div>
            <label className={labelStyles}>Ảnh đại diện</label>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              className={inputStyles}
            />
            {editData.avatar && (
              <img
                src={editData.avatar || "/placeholder.svg"}
                alt="Avatar"
                className="w-20 h-20 rounded-full mt-2 object-cover"
              />
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className={primaryButtonStyles}
              disabled={isSaving}
              aria-label="Lưu thông tin cá nhân"
            >
              {isSaving ? "Đang lưu..." : "Lưu"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className={secondaryButtonStyles}
              aria-label="Hủy chỉnh sửa"
            >
              Hủy
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Họ và tên:</p>
              <p className="text-base text-gray-900">
                {`${editData.firstName} ${editData.lastName}`.trim() || "Chưa cập nhật"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Email:</p>
              <p className="text-base text-gray-900">
                {editData.email || "Chưa cập nhật"}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Số điện thoại:</p>
            <p className="text-base text-gray-900">
              {editData.phone || "Chưa cập nhật"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Giới tính:</p>
            <p className="text-base text-gray-900">
              {editData.gender === "male"
                ? "Nam"
                : editData.gender === "female"
                  ? "Nữ"
                  : editData.gender === "other"
                    ? "Khác"
                    : "Chưa cập nhật"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Ngày sinh:</p>
            <p className="text-base text-gray-900">
              {editData.dob || "Chưa cập nhật"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Ảnh đại diện:</p>
            {editData.avatar ? (
              <img
                src={editData.avatar || "/placeholder.svg"}
                alt="Avatar"
                className="w-20 h-20 rounded-full mt-2 object-cover"
              />
            ) : (
              <p className="text-base text-gray-900">Chưa cập nhật</p>
            )}
          </div>
          <button
            onClick={() => setIsEditingProfile(true)}
            className={primaryButtonStyles}
            aria-label="Chỉnh sửa thông tin cá nhân"
          >
            Sửa
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileForm;