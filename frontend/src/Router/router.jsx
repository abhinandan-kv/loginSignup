import React from "react";
import { RouterProvider, createRouter, createRoute, createRootRoute, redirect, Outlet } from "@tanstack/react-router";
import SignUp from "../Pages/Auth/SignUp";
import SignIn from "../Pages/Auth/SignIn";
import Dashboard from "../Pages/Dashboard/Dashboard";
import { isAuthenticated } from "@/utils/Auth/Auth";
import { useUserStore } from "@/Store/useUserStore";
import { requireAuth } from "@/utils/Router/ProtectedRouteHelpers";
import ForgotPassword from "@/Pages/Auth/ForgotPassword";
import ResetPassword from "@/Pages/Auth/ResetPassword";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const signUpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: SignUp,
});

const otpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signin",
  component: SignIn,
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/forgot-password",
  component: ForgotPassword,
});

const ResetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reset-password",
  validateSearch: (search) => ({
    // this is requried to validate params before sending it to backend
    token: search.token ?? "",
  }),
  component: ResetPassword,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  beforeLoad: requireAuth,
  component: Dashboard,
});

const routeTree = rootRoute.addChildren([signUpRoute, otpRoute, dashboardRoute, forgotPasswordRoute, ResetPasswordRoute]);

const router = createRouter({ routeTree });

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
