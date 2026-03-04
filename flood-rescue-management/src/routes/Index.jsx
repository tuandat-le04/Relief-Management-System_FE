import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import AdminRoutes from "./AdminRoutes";
import CoordinatorRoutes from "./CoordinatorRoutes";
import ManagerRoutes from "./ManagerRoutes";
import CitizenRoutes from "./CitizenRoutes";
import RescueTeamRoutes from "./RescueTeam";
import Login from "../pages/Login";
import Register from "../pages/Register";
import PublicRoute from "../components/PublicRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ),
  },
  ...AdminRoutes,
  ...CoordinatorRoutes,
  ...ManagerRoutes,
  ...CitizenRoutes,
  ...RescueTeamRoutes,
]);

export default router;
