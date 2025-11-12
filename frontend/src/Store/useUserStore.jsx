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
  lastActive: Date.now(),
  persistentSession: false,

  setUser: async (data, remember = false) => {
    set({ user: data, lastActive: Date.now(), persistentSession: remember });

    if (remember) {
      await setEncryptedItem("userdata", data);
    } else {
      sessionStorage.setItem("userdata", JSON.stringify(data));
    }

    get().startIdleTimer();
    get().startRefreshLoop();
  },

  loadUser: async () => {
    let stored = await getDecryptedItem("userdata");

    if (!stored) {
      const sessionData = sessionStorage.getItem("userdata");
      if (sessionData) stored = JSON.parse(sessionData);
    }

    if (stored) {
      set({ user: stored });
      get().startIdleTimer();
      get().startRefreshLoop();
      return stored;
    }
    return null;
  },

  logOut: async () => {
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
    const REFRESH_INTERVAL = 10 * 60 * 1000; //10mins
    const user = get().user;
    if (!user) return;

    refreshInterval = setInterval(async () => {
      const now = Date.now();
      const inactiveTime = now - get().lastActive;

      // Stop refreshing if user idle beyond threshold (e.g., 15 mins)
      if (inactiveTime > 15 * 60 * 1000) {
        console.log("User inactive, skipping token refresh");
        clearInterval(refreshInterval);
        return;
      }
      try {
        const newToken = await refreshAccessToken();
        if (newToken) {
          console.log("Token refreshed successfully");
          const updatedUser = { ...user, token: newToken };
          set({ user: updatedUser });
          setEncryptedItem("userdata", updatedUser);
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
