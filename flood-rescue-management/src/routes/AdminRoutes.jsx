import React, { Suspense, lazy } from "react";

const AdminDashboard = lazy(() => import("../pages/Admin/AdminDashboard"));
const AdminConfiguration = lazy(() => import("../pages/Admin/AdminConfiguration"));

const RouteLoadingFallback = (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    Loading...
  </div>
);

const AdminRoutes = [
  {
    path: "/admin/dashboard",
    element: (
      <Suspense fallback={RouteLoadingFallback}>
        <AdminDashboard />
      </Suspense>
    ),
  },

  {
    path: "/admin/configuration",
    element: (
      <Suspense fallback={RouteLoadingFallback}>
        <AdminConfiguration />
      </Suspense>
    ),
  },
];

export default AdminRoutes;
