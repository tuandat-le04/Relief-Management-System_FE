import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import AdminRoutes from "./AdminRoutes";
import CoordinatorRoutes from "./CoordinatorRoutes";
import ManagerRoutes from "./ManagerRoutes";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/admin/dashboard" replace />,
  },
  ...AdminRoutes,
  ...CoordinatorRoutes,
  ...ManagerRoutes,
]);

export default router;
