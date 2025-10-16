import React, { useState } from "react";
import { toast } from "react-hot-toast";

const ProfileForm = ({ editData, handleChange, handleAvatarChange, handleSaveProfile }) => {
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPhoneForm, setShowPhoneForm] = useState(false);
  const [showDobForm, setShowDobForm] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [currentEmail, setCurrentEmail] = useState("");
  const [currentPhone, setCurrentPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newDob, setNewDob] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [generatedEmailOtp, setGeneratedEmailOtp] = useState(null);
  const [generatedPhoneOtp, setGeneratedPhoneOtp] = useState(null);

  // Helper function to format date from YYYY-MM-DD to DD/MM/YYYY
  const formatDate = (dateStr) => {
    if (!dateStr) return "Chưa có ngày sinh";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  // Simulate sending OTP
  function sendOtp(type) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
    if (type === "email") {
      if (currentEmail !== editData.email) {
        toast.error("Vui lòng nhập đúng email hiện tại!", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }
      setGeneratedEmailOtp(otp);
      toast.info(`Mã OTP gửi tới email: ${otp}`, {
        position: "top-right",
        autoClose: 6000,
      });
    } else {
      if (currentPhone !== editData.phone) {
        toast.error("Vui lòng nhập đúng số điện thoại hiện tại!", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }
      setGeneratedPhoneOtp(otp);
      toast.info(`Mã OTP gửi tới số điện thoại: ${otp}`, {
        position: "top-right",
        autoClose: 6000,
      });
    }
  }

  // Handle OTP verification for email
  function handleEmailOtpSubmit(e) {
    e.preventDefault();
    if (!emailOtp) {
      toast.error("Vui lòng nhập mã OTP!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    if (emailOtp !== generatedEmailOtp) {
      toast.error("Mã OTP sai!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    setEmailVerified(true);
    toast.success("Xác minh email thành công! Vui lòng nhập email mới.", {
      position: "top-right",
      autoClose: 3000,
    });
  }

  // Handle OTP verification for phone
  function handlePhoneOtpSubmit(e) {
    e.preventDefault();
    if (!phoneOtp) {
      toast.error("Vui lòng nhập mã OTP!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    if (phoneOtp !== generatedPhoneOtp) {
      toast.error("Mã OTP sai!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    setPhoneVerified(true);
    toast.success("Xác minh số điện thoại thành công! Vui lòng nhập số điện thoại mới.", {
      position: "top-right",
      autoClose: 3000,
    });
  }

  // Handle new email submission
  function handleEmailSubmit(e) {
    e.preventDefault();
    if (!newEmail) {
      toast.error("Vui lòng nhập email mới!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    handleChange({ target: { name: "email", value: newEmail } });
    setShowEmailForm(false);
    setEmailVerified(false);
    setCurrentEmail("");
    setNewEmail("");
    setEmailOtp("");
    setGeneratedEmailOtp(null);
    toast.success("Email đã được cập nhật!", {
      position: "top-right",
      autoClose: 3000,
    });
  }

  // Handle new phone submission
  function handlePhoneSubmit(e) {
    e.preventDefault();
    if (!newPhone) {
      toast.error("Vui lòng nhập số điện thoại mới!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    handleChange({ target: { name: "phone", value: newPhone } });
    setShowPhoneForm(false);
    setPhoneVerified(false);
    setCurrentPhone("");
    setNewPhone("");
    setPhoneOtp("");
    setGeneratedPhoneOtp(null);
    toast.success("Số điện thoại đã được cập nhật!", {
      position: "top-right",
      autoClose: 3000,
    });
  }

  // Handle new DOB submission
  function handleDobSubmit(e) {
    e.preventDefault();
    if (!newDob) {
      toast.error("Vui lòng chọn ngày sinh mới!", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    handleChange({ target: { name: "dob", value: newDob } });
    setShowDobForm(false);
    setNewDob("");
    toast.success("Ngày sinh đã được cập nhật!", {
      position: "top-right",
      autoClose: 3000,
    });
  }

  // Handle cancel for email form
  function handleEmailCancel() {
    setShowEmailForm(false);
    setEmailVerified(false);
    setCurrentEmail("");
    setNewEmail("");
    setEmailOtp("");
    setGeneratedEmailOtp(null);
    setShowPhoneForm(false);
    setShowDobForm(false);
  }

  // Handle cancel for phone form
  function handlePhoneCancel() {
    setShowPhoneForm(false);
    setPhoneVerified(false);
    setCurrentPhone("");
    setNewPhone("");
    setPhoneOtp("");
    setGeneratedPhoneOtp(null);
    setShowEmailForm(false);
    setShowDobForm(false);
  }

  // Handle cancel for DOB form
  function handleDobCancel() {
    setShowDobForm(false);
    setNewDob("");
    setShowEmailForm(false);
    setShowPhoneForm(false);
  }

  return (
    <div className="max-w-3xl mx-auto py-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Hồ Sơ Của Tôi</h2>
      <p className="text-sm text-gray-500 mb-8">
        Quản lý thông tin hồ sơ để bảo mật tài khoản
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Tên</label>
            <input
              type="text"
              name="name"
              value={editData.name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              placeholder="Nhập tên của bạn"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Email</label>
            {showEmailForm ? (
              <div className="space-y-4">
                {!emailVerified ? (
                  <form onSubmit={handleEmailOtpSubmit} className="space-y-4">
                    <div>
                      <input
                        type="email"
                        value={currentEmail}
                        onChange={(e) => setCurrentEmail(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        placeholder="Nhập email hiện tại"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={emailOtp}
                        onChange={(e) => setEmailOtp(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        placeholder="Nhập mã OTP"
                      />
                    </div>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => sendOtp("email")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                      >
                        Gửi OTP
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                      >
                        Xác minh
                      </button>
                      <button
                        type="button"
                        onClick={handleEmailCancel}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        placeholder="Nhập email mới"
                      />
                    </div>
                    <div className="flex gap-4">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                      >
                        Xác nhận
                      </button>
                      <button
                        type="button"
                        onClick={handleEmailCancel}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-gray-900 font-medium">
                  {editData.email?.replace(/.{2}(.+)(@.+)/, "$1**********$2") || "Chưa có email"}
                </p>
                <button
                  onClick={() => {
                    setShowEmailForm(true);
                    setShowPhoneForm(false);
                    setShowDobForm(false);
                  }}
                  className="text-blue-500 text-sm font-medium hover:underline"
                >
                  Thay Đổi
                </button>
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
            {showPhoneForm ? (
              <div className="space-y-4">
                {!phoneVerified ? (
                  <form onSubmit={handlePhoneOtpSubmit} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        value={currentPhone}
                        onChange={(e) => setCurrentPhone(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        placeholder="Nhập số điện thoại hiện tại"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={phoneOtp}
                        onChange={(e) => setPhoneOtp(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        placeholder="Nhập mã OTP"
                      />
                    </div>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => sendOtp("phone")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                      >
                        Gửi OTP
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                      >
                        Xác minh
                      </button>
                      <button
                        type="button"
                        onClick={handlePhoneCancel}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handlePhoneSubmit} className="space-y-4">
                    <div>
                      <input
                        type="text"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                        placeholder="Nhập số điện thoại mới"
                      />
                    </div>
                    <div className="flex gap-4">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                      >
                        Xác nhận
                      </button>
                      <button
                        type="button"
                        onClick={handlePhoneCancel}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-gray-900 font-medium">
                  {editData.phone?.replace(/.(?=.{2})/g, "*") || "Chưa có số điện thoại"}
                </p>
                <button
                  onClick={() => {
                    setShowPhoneForm(true);
                    setShowEmailForm(false);
                    setShowDobForm(false);
                  }}
                  className="text-blue-500 text-sm font-medium hover:underline"
                >
                  Thay Đổi
                </button>
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Giới tính</label>
            <div className="flex gap-6">
              {["Nam", "Nữ", "Khác"].map((gender) => (
                <label key={gender} className="flex items-center gap-2 text-gray-700">
                  <input
                    type="radio"
                    name="gender"
                    value={gender}
                    checked={editData.gender === gender}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  {gender}
                </label>
              ))}
            </div>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
            {showDobForm ? (
              <form onSubmit={handleDobSubmit} className="space-y-4">
                <div>
                  <input
                    type="date"
                    value={newDob}
                    onChange={(e) => setNewDob(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    max={new Date().toISOString().split("T")[0]} // Prevent future dates
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    Xác nhận
                  </button>
                  <button
                    type="button"
                    onClick={handleDobCancel}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-gray-900 font-medium">
                  {formatDate(editData.dob)}
                </p>
                <button
                  onClick={() => {
                    setShowDobForm(true);
                    setNewDob(editData.dob || ""); // Pre-populate with current DOB
                    setShowEmailForm(false);
                    setShowPhoneForm(false);
                  }}
                  className="text-blue-500 text-sm font-medium hover:underline"
                >
                  Thay Đổi
                </button>
              </div>
            )}
          </div>
          <button
            onClick={handleSaveProfile}
            className="mt-6 px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-md hover:bg-orange-600 transition duration-200"
          >
            Lưu
          </button>
        </div>
        <div className="flex flex-col items-center space-y-4">
          <img
            src={editData.avatar || "https://via.placeholder.com/100"}
            alt="Avatar"
            className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-md"
          />
          <label className="relative cursor-pointer">
            <span className="inline-block px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-md shadow-sm hover:bg-gray-300 transition duration-200">
              Chọn Ảnh
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </label>
          <p className="text-xs text-gray-500 text-center">
            Dung lượng file tối đa 1 MB
            <br />
            Định dạng: .JPEG, .PNG
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;