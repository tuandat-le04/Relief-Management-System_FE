import React from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AdminConfiguration from "../pages/Admin/AdminConfiguration";
import AdminReports from "../pages/Admin/AdminReports";

const AdminRoutes = [
  {
    path: "/admin/dashboard",
    element: (
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/configuration",
    element: (
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <AdminConfiguration />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/reports",
    element: (
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <AdminReports />
      </ProtectedRoute>
    ),
  },
];

export default AdminRoutes;
