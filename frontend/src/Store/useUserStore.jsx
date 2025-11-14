import { isAuthenticated } from "@/utils/Auth/Auth";
import { logOut } from "@/utils/Auth/LogOut";
import { refreshAccessToken } from "@/utils/Auth/refreshToken";
import { getDecryptedItem, setEncryptedItem } from "@/utils/Encryption/EncryptDecrypt";
import { create } from "zustand";

let idleTimer = null;
let warningTimer = null;
let refreshInterval = null;

export const useUserStore = create((set, get) => ({
  user: null,
  roles: [],
  permissions: [],
  lastActive: Date.now(),
  persistentSession: false,

  setUser: async (data, remember = false) => {
    const { user, roles = [], permissions = [] } = data;
    const userData = { ...user, roles, permissions };
    set({ user: userData, roles, permissions, lastActive: Date.now(), persistentSession: remember });

    // await setEncryptedItem("userdata", userData, remember);

    get().startIdleTimer();
    get().startRefreshLoop();
  },

  loadUser: async () => {
    let storedUserData = await getDecryptedItem("userdata");
    let storedUserRole = await getDecryptedItem("role");
    let storedUserPermission = await getDecryptedItem("permission");

    // if (!storedUserData) {
    //   const sessionData = sessionStorage.getItem("userdata");
    //   if (sessionData) storedUserData = JSON.parse(sessionData);
    // }

    if (storedUserData && storedUserRole && storedUserPermission) {
      set({ user: storedUserData, roles: storedUserRole, permissions: storedUserPermission });
      get().startIdleTimer();
      get().startRefreshLoop();
      return { storedUserData, storedUserRole, storedUserPermission };
    }
    return null;
  },

  hasRole: async (role) => {
    get().roles.includes(role);
  },

  hasPermission: (permission) => {
    // console.log("USER STORE permission->", permission);
    const perms = get().permissions || [];
    if (!permission || typeof permission !== "string") return false;

    return perms.some((p) => {
      if (!p || typeof p !== "string") return false;
      return p.trim() === permission.trim();
    });
  },

  logout: async () => {
    set({ user: null });
    try {
      const refreshToken = await getDecryptedItem("refreshToken");
      if (refreshToken) {
        const revokedRefreshToken = await logOut(refreshToken);
        console.log("revoked RefreshToken", revokedRefreshToken);
      }
    } catch (error) {
      console.error(error);
    }

    localStorage.removeItem("userdata");
    localStorage.removeItem("otpData");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    // cookieStore.delete("refreshToken");

    sessionStorage.removeItem("userdata");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");

    clearTimeout(idleTimer);
    clearTimeout(warningTimer);
    clearInterval(refreshInterval);
    return true;
  },

  refreshActivity: () => {
    set({ lastActive: Date.now() });
    clearTimeout(idleTimer);
    clearTimeout(warningTimer);
    get().startIdleTimer();
    get().startRefreshLoop();
  },

  startIdleTimer: () => {
    clearTimeout(idleTimer);
    clearTimeout(warningTimer);
    const sessionTimer = 20 * 60 * 1000; //20 mins
    const warningTime = sessionTimer - 60 * 1000; // 1 min before logout

    warningTimer = setTimeout(() => {
      // custom event for logout Warning
      window.dispatchEvent(new CustomEvent("idleWarning"));
    }, warningTime);

    idleTimer = setTimeout(() => {
      console.log("User idle for 20 mins -> auto logout");
      get().logout();
      // custom event for autoLogout
      window.dispatchEvent(new CustomEvent("autoLogout"));
    }, sessionTimer);
  },

  //refresh token server side
  startRefreshLoop: () => {
    clearInterval(refreshInterval);
    const REFRESH_INTERVAL = 10 * 60 * 1000;
    const user = get().user;
    if (!user) return;

    refreshInterval = setInterval(async () => {
      const now = Date.now();
      const inactiveTime = now - get().lastActive;

      if (inactiveTime > 15 * 60 * 1000) {
        console.log("User inactive, skipping token refresh");
        clearInterval(refreshInterval);
        return;
      }

      try {
        const newToken = await refreshAccessToken();
        if (newToken) {
          console.log("Token refreshed successfully");
          await setEncryptedItem("accessToken", newToken);
        }
      } catch (error) {
        console.warn("Token refresh failed -> logging out");
        get().logout();
      }
    }, REFRESH_INTERVAL);
  },

  isAuthenticatedd: () => !!get().user,
  getUser: () => get().user,
}));
