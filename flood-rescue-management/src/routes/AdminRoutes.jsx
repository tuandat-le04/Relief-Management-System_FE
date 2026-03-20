import React from "react";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AdminConfiguration from "../pages/Admin/AdminConfiguration";

const AdminRoutes = [
  {
    path: "/admin/dashboard",
    element: <AdminDashboard />,
  },

  {
    path: "/admin/configuration",
    element: <AdminConfiguration />,
  },
];

export default AdminRoutes;
