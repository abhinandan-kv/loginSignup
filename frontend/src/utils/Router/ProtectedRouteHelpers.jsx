import { useUserStore } from "@/CustomHook/useUserStore";

export const requireAuth = async () => {
  const store = useUserStore.getState();
  let isAuthenticated = store.isAuthenticatedd();
  if (!isAuthenticated) {
    const loadedUser = await store.loadUser();
    isAuthenticated = !!loadedUser;
  }
  if (!isAuthenticated) {
    throw redirect({ to: "/signin" });
  }
  store.startIdleTimer();
};
