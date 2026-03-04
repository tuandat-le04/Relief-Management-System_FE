import React from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import ManagerDashboard from "../pages/Manager/ManagerDashboard";
import ManagerVehicle from "../pages/Manager/ManagerVehicle";
import ManagerInventory from "../pages/Manager/ManagerInventory";
import ManagerReports from "../pages/Manager/ManagerReports";

const ManagerRoutes = [
  {
    path: "/manager/dashboard",
    element: (
      <ProtectedRoute allowedRoles={["MANAGER"]}>
        <ManagerDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/manager/vehicles",
    element: (
      <ProtectedRoute allowedRoles={["MANAGER"]}>
        <ManagerVehicle />
      </ProtectedRoute>
    ),
  },
  // Thêm các routes manager khác ở đây
  {
    path: "/manager/inventory",
    element: (
      <ProtectedRoute allowedRoles={["MANAGER"]}>
        <ManagerInventory />
      </ProtectedRoute>
    ),
  },
  {
    path: "/manager/reports",
    element: (
      <ProtectedRoute allowedRoles={["MANAGER"]}>
        <ManagerReports />
      </ProtectedRoute>
    ),
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
