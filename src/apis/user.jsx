import axios from "./axios";

export const apiLoginUser = (data) =>
  axios({
    url: `/user/login`,
    method: "post",
    data,
  });

export const apiRegisterUser = (data) =>
  axios({
    url: `/user/register`,
    method: "post",
    data,
  });

export const apiVerifyRegisterOTP = (data) =>
  axios({
    url: `/user/verifyRegisterOtp`,
    method: "post",
    data,
  });

export const apiForgotPassword = (data) =>
  axios({
    url: `/user/sendResetPasswordEmail`,
    method: "post",
    data,
  });

export const apiVerifyResetPasswordOTP = (data) =>
  axios({
    url: `/user/verifyResetPasswordOtp`,
    method: "post",
    data,
  });

export const apiResetPassword = (data) =>
  axios({
    url: `/user/resetPassword`,
    method: "post",
    data,
  });

export const apiGetCurrent = () =>
  axios({
    url: `/user/current`,
    method: "get",
  });

export const apiUpdateUser = (data) =>
  axios({
    url: `/user/current`,
    method: "put",
    data,
  });

export const apiLogoutUser = () =>
  axios({
    url: `/user/logout`,
    method: "post",
  });

export const apiResendRegisterOTP = (data) =>
  axios({
    url: `/user/resendRegisterOtp`,
    method: "post",
    data,
  });

export const apiResendForgotPasswordOTP = (data) =>
  axios({
    url: `/user/resendResetPasswordOtp`,
    method: "post",
    data,
  });

export const apiChangePassword = (data) =>
  axios({
    url: `/user/changePassword`,
    method: "put",
    data,
  });

export const apiRequestEmailChange = (data) =>
  axios({
    url: `/user/requestEmailChange`,
    method: "post",
    data,
  });

export const apiResendEmailChangeOTP = () =>
  axios({
    url: `/user/resendEmailChangeOtp`,
    method: "post",
  });

export const apiVerifyEmailChangeOTP = (data) =>
  axios({
    url: `/user/verifyEmailChangeOtp`,
    method: "post",
    data,
  });

export const apiLoginWithGoogle = (data) =>
  axios({
    url: `/user/loginWithGoogle`,
    method: "post",
    data,
  });