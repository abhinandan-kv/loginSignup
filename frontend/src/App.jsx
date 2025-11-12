import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import SignUp from "./Pages/Auth/SignUp";
import { toast, Toaster } from "sonner";
import RouterProviderWrapper from "./Router/router";
import { useUserStore } from "./Store/useUserStore";
import { ThemeProvider } from "./Components/Providers/ThemeProvider";

function App() {
  const user = useUserStore((state) => state.user);
  const refreshActivity = useUserStore((state) => state.refreshActivity);

  useEffect(() => {
    if (!user) return;
    const events = ["mousedown", "keydown", "scroll", "click"];
    const resetTimer = () => refreshActivity();

    events.forEach((event) => window.addEventListener(event, resetTimer));

    const handleWarningToast = () => {
      console.log("Warning Toast Shown Once");
      toast("You will be automatically logged out soon!");
    };

    const handleAutoLogOut = () => {
      window.location.href = "/signin";
    };

    window.addEventListener("idleWarning", handleWarningToast);
    window.addEventListener("autoLogout", handleAutoLogOut);

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      window.removeEventListener("idleWarning", handleWarningToast);
      window.removeEventListener("autoLogout", handleAutoLogOut);
    };
  }, [user]);
  return (
    <>
      <ThemeProvider attribute="class" default="system" enableSystem>
        <Toaster />
        {/* Tanstack Router */}
        <RouterProviderWrapper />
      </ThemeProvider>
    </>
  );
}

export default App;
