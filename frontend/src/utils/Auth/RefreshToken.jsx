import axiosInstance from "../AxiosApi/AxiosInstance";
import { decryptData } from "../Encryption/EncryptDecrypt";

export async function refreshAccessToken() {
  try {
    const refreshToken = await decryptData("refreshToken");
    if (!refreshToken) return null;

    const response = await axiosInstance.post("/user/refresh", { refreshToken });
    console.log("REFRESH TOKEN RESPONSE-", response);
    const newToken = response.data?.accessToken;

    if (newToken) {
      console.log("Access token refreshed:", newToken);
      return newToken;
    }

    return null;
  } catch (error) {
    console.error("Token refresh failed", error.response?.data || error.message);
    throw error;
  }
}
