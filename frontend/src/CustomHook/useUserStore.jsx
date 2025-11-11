import { isAuthenticated } from "@/utils/Auth/Auth";
import { getDecryptedItem, setEncryptedItem } from "@/utils/Encryption/EncryptDecrypt";
import { create } from "zustand";

let idleTimer = null;

export const useUserStore = create((set, get) => ({
  user: null,
  lastActive: Date.now(),

  setUser: (data) => {
    set({ user: data, lastActive: Date.now() });
    setEncryptedItem("userdata", data);
    get().startIdleTimer();
  },

  loadUser: async () => {
    const stored = await getDecryptedItem("userdata");
    if (stored) {
      set({ user: stored });
      get().startIdleTimer();
      return stored;
    }
    return null;
  },

  logout: () => {
    set({ user: null });
    localStorage.removeItem("userdata");
    localStorage.removeItem('otpData')
    clearTimeout(idleTimer);
  },

  refreshActivity: () => {
    set({ lastActive: Date.now() });
    clearTimeout(idleTimer);
    get().startIdleTimer();
  },

  startIdleTimer: () => {
    clearTimeout(idleTimer);
    const sessionTimer = 20 * 60 * 1000; //20 mins

    const warningTimer = setTimeout(() => {
      // custom event for logout Warning
      window.dispatchEvent(new CustomEvent("idleWarning"));
    }, sessionTimer - 60000); //1mins before sessionTimer
    idleTimer = setTimeout(() => {
      console.log("User idle for 20 mins -> auto logout");
      get().logout();
      // custom event for autoLogout
      window.dispatchEvent(new CustomEvent("autoLogout"));
    }, sessionTimer); 
  },

  isAuthenticatedd: () => !!get().user,
  getUser: () => get().user,
}));
