import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Link, useLocation } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ShopContext } from "../../Context/ShopContext";
import * as apis from "../../apis";
import loginImg from "../../assets/login.png";

const Login = () => {
  const { navigate, login, current, isLoading } = useContext(ShopContext);
  const location = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Xử lý redirect sau khi login thành công
  useEffect(() => {
    if (!isLoading && current) {
      navigate("/");
    }
  }, [isLoading, current, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorMsg = params.get("error");

    if (errorMsg) {
      toast.error(decodeURIComponent(errorMsg));
      params.delete("error");
      const newPath = `${location.pathname}${params.toString() ? "?" + params.toString() : ""}`;
      window.history.replaceState(null, "", newPath);
    }

    document.getElementById("email")?.focus();
    reset({ email: "", password: "" });
  }, [location, reset]);

  const onSubmitHandler = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await apis.apiLoginUser(data);
      if (response.success) {
        toast.success(response.msg);
        await login(response.accessToken); // Đợi login và getUserCurrent
      }
    } catch (error) {
      const errorMessage =
        error?.data?.msg || error?.msg || "Đã xảy ra lỗi. Vui lòng thử lại sau.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_APP_API_URI}/user/google/`;
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="absolute top-0 left-0 min-h-screen w-full z-50 bg-white flex items-stretch">
      <div className="w-1/2 hidden md:block">
        <img
          src={loginImg}
          alt="Minh họa người dùng đăng nhập vào hệ thống"
          className="object-cover min-h-screen w-full"
          loading="lazy"
        />
      </div>
      <div className="flex w-full md:w-1/2 items-center justify-center px-2 sm:px-6 md:px-8 py-4 sm:py-8 text-xs sm:text-base overflow-auto">
        <form
          onSubmit={handleSubmit(onSubmitHandler)}
          className="flex flex-col items-center w-full sm:w-[90%] max-w-md m-auto gap-y-3 sm:gap-y-6"
          noValidate
          role="form"
          aria-labelledby="login-heading"
        >
          <div className="w-full mb-4">
            <h3
              id="login-heading"
              className="text-2xl sm:text-3xl font-bold text-center"
            >
              Đăng nhập
            </h3>
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
              placeholder="Email"
              className="w-full px-3 sm:px-4 py-1.5 sm:py-2 ring-1 ring-slate-900/10 rounded bg-primary mt-1"
              autoComplete="email"
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={errors.email ? "email-error" : undefined}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p id="email-error" className="text-red-500 mt-1 text-xs sm:text-sm">
                {errors.email.message}
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
                autoComplete="off" // Thêm để loại bỏ cảnh báo
                aria-hidden="true"
              />
              <input
                {...register("password", {
                  required: "Mật khẩu là bắt buộc",
                  minLength: {
                    value: 6,
                    message: "Mật khẩu phải có ít nhất 6 ký tự",
                  },
                })}
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Mật khẩu"
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 ring-1 ring-slate-900/10 rounded bg-primary mt-1"
                autoComplete="new-password"
                aria-invalid={errors.password ? "true" : "false"}
                aria-describedby={errors.password ? "password-error" : undefined}
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
              <p id="password-error" className="text-red-500 mt-1 text-xs sm:text-sm">
                {errors.password.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="btn-dark w-full mt-5 py-2 sm:py-3 rounded disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="btn-dark w-full mt-2 py-2 sm:py-3 rounded flex items-center justify-center gap-2 disabled:opacity-50"
            disabled={isSubmitting}
            aria-label="Đăng nhập với Google"
          >
            <FcGoogle className="w-4 h-4 sm:w-5 sm:h-5" /> Đăng nhập với Google
          </button>
          <div className="w-full flex flex-col gap-y-3 text-xs sm:text-base">
            <div>
              <Link to="/forgot-password" className="cursor-pointer hover:text-blue-500">
                Quên mật khẩu?
              </Link>
            </div>
            <div>
              Chưa có tài khoản?{" "}
              <Link to="/register" className="cursor-pointer hover:text-blue-500">
                Tạo tài khoản
              </Link>
            </div>
            <div>
              <Link to="/" className="cursor-pointer hover:text-blue-500">
                Về trang chủ
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;