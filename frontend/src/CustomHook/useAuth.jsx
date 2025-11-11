import { useNavigate } from "@tanstack/react-router";
import { useUserStore } from "../Store/useUserStore";
import { useEffect } from "react";

export function useAuth() {
  const user = useUserStore((state) => state.user);
  const loadUser = useUserStore((state) => state.loadUser);
  const isAuthenticated = useUserStore.getState.isAuthenticatedd;
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      if (!user) {
        await loadUser();
      }

      const stillNotAuth = !isAuthenticated();
      if (stillNotAuth) {
        navigate({ to: "/login" });
      }
    })();
  }, [user, loadUser, isAuthenticated]);

  return { user, isAuthenticated: isAuthenticated };
}
