import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import * as apis from '../apis';

const baseURL = import.meta.env.VITE_APP_API_URI;

const instance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {},
});

instance.interceptors.request.use(async function (config) {
  let localStorageData = localStorage.getItem('TechZone/user')
    ? JSON.parse(localStorage.getItem('TechZone/user'))
    : null;

  const token = localStorageData?.token;

  if (token) {
    const decoded = jwtDecode(token);
    const isExpired = decoded.exp * 1000 < Date.now();

    if (!isExpired) {
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    }

    try {
      const response = await axios.post(`${baseURL}/user/refreshAccessToken`, {}, { withCredentials: true });

      if (response.data?.newAccessToken) {
        localStorageData.token = response.data.newAccessToken;
        localStorage.setItem('TechZone/user', JSON.stringify(localStorageData));
        config.headers.Authorization = `Bearer ${response.data.newAccessToken}`;
      } else {
        throw new Error("newAccessToken not found");
      }
    } catch (error) {
      localStorage.removeItem('TechZone/user');
      await apis.apiLogoutUser();
      return Promise.reject(error);
    }
  }

  return config;
}, function (error) {
  return Promise.reject(error);
});

instance.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error.response?.data || error)
);

export default instance;