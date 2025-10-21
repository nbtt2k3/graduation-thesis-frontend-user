import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ShopContext } from "../../Context/ShopContext";
import * as apis from "../../apis";
import loginImg from "../../assets/login.png";

const Register = () => {
  const { navigate } = useContext(ShopContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      gender: "",
      dateOfBirth: "",
      password: "",
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Auto-focus first input and clear form
    document.getElementById("firstName")?.focus();
    reset({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      gender: "",
      dateOfBirth: "",
      password: "",
    });
  }, [reset]);

  const onSubmitHandler = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await apis.apiRegisterUser(data);
      if (response.success) {
        sessionStorage.setItem("email", data.email);
        toast.success(response.msg);
        navigate("/verify-register-otp");
      }
    } catch (error) {
      const errorMessage =
        error?.data?.msg ||
        error?.msg ||
        "Đã xảy ra lỗi. Vui lòng thử lại sau.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="absolute top-0 left-0 min-h-full w-full z-50 bg-white">
      <div className="min-h-full w-full bg-white flex">
        <div className="w-1/2 hidden md:block">
          <img
            src={loginImg}
            alt="Minh họa người dùng đăng ký tài khoản"
            className="object-cover min-h-full w-full"
            loading="lazy"
          />
        </div>
        <div className="flex w-full md:w-1/2 items-center justify-center px-2 sm:px-6 md:px-8 py-2 sm:py-8 text-xs sm:text-base min-h-full overflow-auto">
          <form
            onSubmit={handleSubmit(onSubmitHandler)}
            className="flex flex-col items-center w-full sm:w-[90%] max-w-md m-auto gap-y-3 sm:gap-y-6"
            noValidate
            role="form"
            aria-labelledby="register-heading"
          >
            <div className="w-full mb-4">
              <h3
                id="register-heading"
                className="text-2xl sm:text-3xl font-bold text-center"
              >
                Đăng Ký
              </h3>
            </div>
            <div className="w-full">
              <label htmlFor="firstName" className="text-xs sm:text-base">
                Tên
              </label>
              <input
                {...register("firstName", { required: "Tên là bắt buộc" })}
                type="text"
                id="firstName"
                placeholder="Nhập tên"
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 ring-1 ring-slate-900/10 rounded bg-primary mt-1"
                autoComplete="given-name"
                aria-invalid={errors.firstName ? "true" : "false"}
                aria-describedby={
                  errors.firstName ? "firstName-error" : undefined
                }
                disabled={isSubmitting}
              />
              {errors.firstName && (
                <p
                  id="firstName-error"
                  className="text-red-500 mt-1 text-xs sm:text-sm"
                >
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className="w-full">
              <label htmlFor="lastName" className="text-xs sm:text-base">
                Họ
              </label>
              <input
                {...register("lastName", { required: "Họ là bắt buộc" })}
                type="text"
                id="lastName"
                placeholder="Nhập họ"
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 ring-1 ring-slate-900/10 rounded bg-primary mt-1"
                autoComplete="family-name"
                aria-invalid={errors.lastName ? "true" : "false"}
                aria-describedby={
                  errors.lastName ? "lastName-error" : undefined
                }
                disabled={isSubmitting}
              />
              {errors.lastName && (
                <p
                  id="lastName-error"
                  className="text-red-500 mt-1 text-xs sm:text-sm"
                >
                  {errors.lastName.message}
                </p>
              )}
            </div>
            <div className="w-full">
              <label htmlFor="email" className="text-xs sm:text-base">
                Email
              </label>
              <input
                {...register("email", {
                  required: "Email là bắt buộc",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Định dạng email không hợp lệ",
                  },
                })}
                type="email"
                id="email"
                placeholder="Nhập email"
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 ring-1 ring-slate-900/10 rounded bg-primary mt-1"
                autoComplete="email"
                aria-invalid={errors.email ? "true" : "false"}
                aria-describedby={errors.email ? "email-error" : undefined}
                disabled={isSubmitting}
              />
              {errors.email && (
                <p
                  id="email-error"
                  className="text-red-500 mt-1 text-xs sm:text-sm"
                >
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="w-full">
              <label htmlFor="phone" className="text-xs sm:text-base">
                Số điện thoại
              </label>
              <input
                {...register("phone", {
                  required: "Số điện thoại là bắt buộc",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Số điện thoại phải có 10 chữ số",
                  },
                })}
                type="tel"
                id="phone"
                placeholder="Nhập số điện thoại"
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 ring-1 ring-slate-900/10 rounded bg-primary mt-1"
                autoComplete="tel"
                aria-invalid={errors.phone ? "true" : "false"}
                aria-describedby={errors.phone ? "phone-error" : undefined}
                disabled={isSubmitting}
              />
              {errors.phone && (
                <p
                  id="phone-error"
                  className="text-red-500 mt-1 text-xs sm:text-sm"
                >
                  {errors.phone.message}
                </p>
              )}
            </div>
            <div className="w-full">
              <label htmlFor="gender" className="text-xs sm:text-base">
                Giới tính
              </label>
              <select
                {...register("gender", { required: "Giới tính là bắt buộc" })}
                id="gender"
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 ring-1 ring-slate-900/10 rounded bg-primary mt-1"
                aria-invalid={errors.gender ? "true" : "false"}
                aria-describedby={errors.gender ? "gender-error" : undefined}
                disabled={isSubmitting}
              >
                <option value="" disabled>
                  Chọn giới tính
                </option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
              {errors.gender && (
                <p
                  id="gender-error"
                  className="text-red-500 mt-1 text-xs sm:text-sm"
                >
                  {errors.gender.message}
                </p>
              )}
            </div>
            <div className="w-full">
              <label htmlFor="dateOfBirth" className="text-xs sm:text-base">
                Ngày sinh
              </label>
              <input
                {...register("dateOfBirth", {
                  required: "Ngày sinh là bắt buộc",
                  validate: (value) => {
                    const today = new Date();
                    const dob = new Date(value);
                    return (
                      dob <= today || "Ngày sinh không được trong tương lai"
                    );
                  },
                })}
                type="date"
                id="dateOfBirth"
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 ring-1 ring-slate-900/10 rounded bg-primary mt-1"
                autoComplete="bday"
                aria-invalid={errors.dateOfBirth ? "true" : "false"}
                aria-describedby={
                  errors.dateOfBirth ? "dateOfBirth-error" : undefined
                }
                disabled={isSubmitting}
              />
              {errors.dateOfBirth && (
                <p
                  id="dateOfBirth-error"
                  className="text-red-500 mt-1 text-xs sm:text-sm"
                >
                  {errors.dateOfBirth.message}
                </p>
              )}
            </div>
            <div className="w-full">
              <label htmlFor="password" className="text-xs sm:text-base">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type="password"
                  style={{ display: "none" }}
                  aria-hidden="true"
                />
                <input
                  {...register("password", {
                    required: "Mật khẩu là bắt buộc",
                    minLength: {
                      value: 6,
                      message: "Mật khẩu phải có ít nhất 6 ký tự",
                    },
                    pattern: {
                      value:
                        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/,
                      message:
                        "Mật khẩu phải chứa chữ cái, số và ký tự đặc biệt",
                    },
                  })}
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Nhập mật khẩu"
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2 ring-1 ring-slate-900/10 rounded bg-primary mt-1"
                  autoComplete="new-password"
                  aria-invalid={errors.password ? "true" : "false"}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? (
                    <FaEyeSlash className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <FaEye className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p
                  id="password-error"
                  className="text-red-500 mt-1 text-xs sm:text-sm"
                >
                  {errors.password.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="btn-dark w-full mt-5 py-2 sm:py-3 rounded disabled:opacity-50"
              disabled={isSubmitting}
              aria-label="Đăng ký tài khoản"
            >
              {isSubmitting ? "Đang đăng ký..." : "Đăng Ký"}
            </button>
            <div className="w-full flex flex-col gap-y-3 text-xs sm:text-base">
              <div>
                Đã có tài khoản?{" "}
                <Link
                  to="/login"
                  className="cursor-pointer hover:text-blue-500"
                >
                  Đăng nhập
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
