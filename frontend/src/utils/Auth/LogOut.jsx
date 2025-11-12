import axiosInstance from "../AxiosApi/AxiosInstance";

export async function logOut(refreshToken) {
  try {
    const res = await axiosInstance.post("/user/logout", { refreshToken });
    console.log(res);
    if (res) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
  }
}
