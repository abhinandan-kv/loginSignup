import axiosInstance from "../AxiosApi/AxiosInstance";
import { decryptData } from "../Encryption/EncryptDecrypt";

export async function refreshAccessToken() {
  try {
    const stored = await decryptData("userdata");
    if (!stored?.refreshToken) return null;

    const response = await axiosInstance.post("/user/refresh", { refreshToken: stored.refreshToken });

    const newToken = response.data?.accessToken;
    return newToken;
  } catch (error) {
    console.error("Token refresh failed", error.response?.data || error.message);
    throw error;
  }
}
