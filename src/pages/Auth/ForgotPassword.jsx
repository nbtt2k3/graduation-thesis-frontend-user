import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { ShopContext } from "../../Context/ShopContext";
import * as apis from "../../apis";
import loginImg from "../../assets/login.png";

const ForgotPassword = () => {
  const { navigate } = useContext(ShopContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      email: "",
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.getElementById("email")?.focus();
    reset({ email: "" });
  }, [reset]);

  const onSubmitHandler = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await apis.apiForgotPassword(data);
      if (response.success) {
        sessionStorage.setItem("email", data.email);
        toast.success(response.msg);
        navigate("/verify-forgot-password-otp");
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

  return (
    <div className="absolute top-0 left-0 min-h-screen w-full z-50 bg-white flex items-stretch">
      <div className="w-1/2 hidden md:block">
        <img
          src={loginImg}
          alt="Minh họa người dùng khôi phục mật khẩu"
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
          aria-labelledby="forgot-password-heading"
        >
          <div className="w-full mb-4">
            <h3
              id="forgot-password-heading"
              className="text-2xl sm:text-3xl font-bold text-center"
            >
              Quên Mật Khẩu
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
          <button
            type="submit"
            className="btn-dark w-full mt-5 py-2 sm:py-3 rounded disabled:opacity-50"
            disabled={isSubmitting}
            aria-label="Gửi mã OTP để khôi phục mật khẩu"
          >
            {isSubmitting ? "Đang gửi OTP..." : "Gửi OTP"}
          </button>
          <div className="w-full flex flex-col gap-y-3 text-xs sm:text-base">
            <div>
              <Link to="/login" className="cursor-pointer hover:text-blue-500">
                Quay lại đăng nhập
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
