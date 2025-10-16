import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { ShopContext } from "../../Context/ShopContext";
import * as apis from "../../apis";
import loginImg from "../../assets/login.png";

const VerifyRegisterOTP = () => {
  const { navigate } = useContext(ShopContext);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      otp: "",
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    document.getElementById("otp")?.focus();
    reset({ otp: "" });
  }, [reset]);

  const onSubmitHandler = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await apis.apiVerifyRegisterOTP(data);
      if (response.success) {
        toast.success(response.msg || "Xác minh OTP thành công");
        navigate("/login");
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.msg ||
        error?.msg ||
        "Đã xảy ra lỗi. Vui lòng thử lại sau.";
      toast.error(errorMessage);
      console.error("Lỗi xác minh OTP:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      const response = await apis.apiResendRegisterOTP();
      if (response.success) {
        toast.success(response.msg || "Đã gửi lại mã OTP");
      }
    } catch (error) {
      const errorMessage =
        error?.data?.msg ||
        error?.msg ||
        "Đã xảy ra lỗi. Vui lòng thử lại sau.";
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToRegister = () => {
    navigate("/register");
  };

  return (
    <div className="absolute top-0 left-0 min-h-screen w-full z-50 bg-white flex items-stretch">
      <div className="w-1/2 hidden md:block">
        <img
          src={loginImg}
          alt="Minh họa người dùng xác minh OTP đăng ký"
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
          aria-labelledby="verify-otp-heading"
        >
          <div className="w-full mb-4">
            <h3
              id="verify-otp-heading"
              className="text-2xl sm:text-3xl font-bold text-center"
            >
              Xác Minh Đăng Ký
            </h3>
          </div>
          <div className="w-full">
            <label htmlFor="otp" className="text-xs sm:text-base">
              Mã OTP
            </label>
            <input
              {...register("otp", {
                required: "Mã OTP là bắt buộc",
                pattern: {
                  value: /^[0-9]{6}$/,
                  message: "Mã OTP phải là 6 chữ số",
                },
              })}
              type="tel"
              id="otp"
              placeholder="Nhập mã OTP"
              className="w-full px-3 sm:px-4 py-1.5 sm:py-2 ring-1 ring-slate-900/10 rounded bg-primary mt-1"
              autoComplete="off"
              aria-invalid={errors.otp ? "true" : "false"}
              aria-describedby={errors.otp ? "otp-error" : undefined}
              disabled={isSubmitting || isResending}
            />
            {errors.otp && (
              <p
                id="otp-error"
                className="text-red-500 mt-1 text-xs sm:text-sm"
              >
                {errors.otp.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="btn-dark w-full mt-5 py-2 sm:py-3 rounded disabled:opacity-50"
            disabled={isSubmitting || isResending}
            aria-label="Xác minh mã OTP"
          >
            {isSubmitting ? "Đang xác minh..." : "Xác Minh OTP"}
          </button>
          <div className="w-full flex flex-col gap-y-3 text-xs sm:text-base">
            <button
              type="button"
              onClick={handleResendOTP}
              className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
              disabled={isSubmitting || isResending}
              aria-label="Gửi lại mã OTP"
            >
              {isResending ? "Đang gửi lại..." : "Gửi lại mã OTP"}
            </button>
            <button
              type="button"
              onClick={handleBackToRegister}
              className="cursor-pointer hover:text-blue-500"
              disabled={isSubmitting || isResending}
              aria-label="Quay lại đăng ký"
            >
              Quay lại đăng ký
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyRegisterOTP;
