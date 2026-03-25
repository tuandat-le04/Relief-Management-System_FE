import React, { Suspense, lazy } from "react";
// import ProtectedRoute from "../components/ProtectedRoute"; // Tạm thời comment để xem preview
const ManagerTeamManagement = lazy(() =>
  import("../pages/Manager/ManagerTeamManagement")
);
const ManagerVehicle = lazy(() => import("../pages/Manager/ManagerVehicle"));
const ManagerInventory = lazy(() => import("../pages/Manager/ManagerInventory"));
const ManagerReports = lazy(() => import("../pages/Manager/ManagerReports"));

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

const ManagerRoutes = [
  {
    path: "/manager/teams",
    element: (
      <Suspense fallback={RouteLoadingFallback}>
        <ManagerTeamManagement />
      </Suspense>
    ), // Route chính: quản lý đội nhóm
  },
  {
    path: "/manager/dashboard",
    element: (
      <Suspense fallback={RouteLoadingFallback}>
        <ManagerTeamManagement />
      </Suspense>
    ), // Alias giữ tương thích đường dẫn cũ
    // element: (
    //   <ProtectedRoute allowedRoles={["manager"]}>
    //     <ManagerTeamManagement />
    //   </ProtectedRoute>
    // ),
  },
  {
    path: "/manager/vehicles",
    element: (
      <Suspense fallback={RouteLoadingFallback}>
        <ManagerVehicle />
      </Suspense>
    ),
    // element: (
    //   <ProtectedRoute allowedRoles={["manager"]}>
    //     <ManagerVehicle />
    //   </ProtectedRoute>
    // ),
  },
  // Thêm các routes manager khác ở đây
  {
    path: "/manager/inventory",
    element: (
      <Suspense fallback={RouteLoadingFallback}>
        <ManagerInventory />
      </Suspense>
    ),
    //     <ProtectedRoute allowedRoles={["manager"]}>
    //       <InventoryManagement />
    //     </ProtectedRoute>
  },
  {
    path: "/manager/reports",
    element: (
      <Suspense fallback={RouteLoadingFallback}>
        <ManagerReports />
      </Suspense>
    ),
    // element: (
    //   <ProtectedRoute allowedRoles={["manager"]}>
    //     <ManagerReports />
    //   </ProtectedRoute>
    // ),
  },
  // {
  //   path: "/manager/distribution",
  //   element: (
  //     <ProtectedRoute allowedRoles={["manager"]}>
  //       <DistributionManagement />
  //     </ProtectedRoute>
  //   ),
  // },
];

export default ManagerRoutes;
