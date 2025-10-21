import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { ShopContext } from "../../Context/ShopContext";
import * as apis from "../../apis";
import loginImg from "../../assets/login.png";

const ResetPassword = () => {
  const { navigate } = useContext(ShopContext);
  const [email, setEmail] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const password = watch("password");

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("email");
    if (storedEmail) {
      setEmail(storedEmail);
      document.getElementById("password")?.focus();
    } else {
      toast.error("Không tìm thấy phiên xác thực.");
      navigate("/register");
    }
    reset({ password: "", confirmPassword: "" });
  }, [reset, navigate]);

  const onSubmitHandler = async (data) => {
    setIsSubmitting(true);
    try {
      const { password } = data;
      const response = await apis.apiResetPassword({ email, password });
      if (response.success) {
        toast.success(response.msg || "Đặt lại mật khẩu thành công");
        navigate("/login");
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

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="absolute top-0 left-0 min-h-screen w-full z-50 bg-white flex items-stretch">
      <div className="w-1/2 hidden md:block">
        <img
          src={loginImg}
          alt="Minh họa người dùng đặt lại mật khẩu"
          className="object-cover min-h-screen w-full"
          loading="lazy"
        />
      </div>
      <div className="flex w-full md:w-1/2 items-center justify-center px-2 sm:px-6 md:px-8 py-2 sm:py-8 text-xs sm:text-base overflow-auto">
        <form
          onSubmit={handleSubmit(onSubmitHandler)}
          className="flex flex-col items-center w-full sm:w-[90%] max-w-md m-auto gap-y-3 sm:gap-y-6"
          noValidate
          role="form"
          aria-labelledby="reset-password-heading"
        >
          <div className="w-full mb-4">
            <h3
              id="reset-password-heading"
              className="text-2xl sm:text-3xl font-bold text-center"
            >
              Đặt Lại Mật Khẩu
            </h3>
          </div>
          <div className="w-full">
            <label htmlFor="password" className="text-xs sm:text-base">
              Mật Khẩu Mới
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
                    message: "Mật khẩu phải chứa chữ cái, số và ký tự đặc biệt",
                  },
                })}
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Nhập mật khẩu mới"
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
          <div className="w-full">
            <label htmlFor="confirmPassword" className="text-xs sm:text-base">
              Xác Nhận Mật Khẩu
            </label>
            <div className="relative">
              <input
                {...register("confirmPassword", {
                  required: "Xác nhận mật khẩu là bắt buộc",
                  validate: (value) =>
                    value === password || "Mật khẩu không khớp",
                })}
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                placeholder="Xác nhận mật khẩu"
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 ring-1 ring-slate-900/10 rounded bg-primary mt-1"
                autoComplete="new-password"
                aria-invalid={errors.confirmPassword ? "true" : "false"}
                aria-describedby={
                  errors.confirmPassword ? "confirmPassword-error" : undefined
                }
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                aria-label={
                  showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                }
              >
                {showConfirmPassword ? (
                  <FaEyeSlash className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <FaEye className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p
                id="confirmPassword-error"
                className="text-red-500 mt-1 text-xs sm:text-sm"
              >
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="btn-dark w-full mt-5 py-2 sm:py-3 rounded disabled:opacity-50"
            disabled={isSubmitting}
            aria-label="Đặt lại mật khẩu"
          >
            {isSubmitting ? "Đang đặt lại..." : "Đặt Lại Mật Khẩu"}
          </button>
          <div className="w-full flex flex-col gap-y-3 text-xs sm:text-base">
            <div className="underline">
              <Link to="/login" className="cursor-pointer">
                Quay lại đăng nhập
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
