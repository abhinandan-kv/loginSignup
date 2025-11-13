import axios from "axios";
import { getDecryptedItem, setEncryptedItem } from "../Encryption/EncryptDecrypt";

const baseUrl = import.meta.env.VITE_BASEURL_BACKEND;

console.log(baseUrl);
const axiosInstance = axios.create({
  baseURL: baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getDecryptedItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    // Handle request error here
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

//to ensure the autorefresh accesstokens
axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await getDecryptedItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token found");

        const { data } = await axios.post(`${baseUrl}/user/refresh`, { refreshToken });

        const newAccessToken = data.accessToken;
        await setEncryptedItem("accessToken", newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        console.error("Token refresh failed, logging out", err);
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
