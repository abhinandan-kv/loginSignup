import { useUserStore } from "@/CustomHook/useUserStore";

export async function requireAuth() {
  const store = useUserStore.getState();
  if (!store.isAuthenticated()) {
    await store.loadUser();
  }

  if (!store.isAuthenticated()) {
    throw redirect({ to: "/signup" });
  }
}
