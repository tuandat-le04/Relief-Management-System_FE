import React, { Suspense, lazy } from "react";

const CoordinatorDashboard = lazy(() =>
  import("../pages/coordinator/CoordinatorDashboard")
);

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

const CoordinatorRoutes = [
  {
    path: "/coordinator/dashboard",
    element: (
      <Suspense fallback={RouteLoadingFallback}>
        <CoordinatorDashboard />
      </Suspense>
    ),
  },
  // Thêm các routes coordinator khác ở đây
];

export default CoordinatorRoutes;
