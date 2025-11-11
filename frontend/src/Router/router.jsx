import React from "react";
import { RouterProvider, createRouter, createRoute, createRootRoute, redirect, Outlet } from "@tanstack/react-router";
import SignUp from "../Pages/Auth/SignUp";
import SignIn from "../Pages/Auth/SignIn";
import Dashboard from "../Pages/Dashboard/Dashboard";
import { isAuthenticated } from "@/utils/Auth/Auth";
import { useUserStore } from "@/CustomHook/useUserStore";
import { requireAuth } from "@/utils/Router/ProtectedRouteHelpers";

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

export const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  beforeLoad: requireAuth,
  component: Dashboard,
});

const routeTree = rootRoute.addChildren([signUpRoute, otpRoute, dashboardRoute]);

const router = createRouter({ routeTree });

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
