export const saveAuthToken = (token) => localStorage.setItem("auth_token", token);
export const getAuthToken = () => localStorage.getItem("auth_token");
export const clearAuthToken = () => localStorage.removeItem("auth_token");
export const isAuthenticated = () => !!getAuthToken();

export const LogOut = () => localStorage.removeItem("userdata");
cookieStore.delete("jwt");
