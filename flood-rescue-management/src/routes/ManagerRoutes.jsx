import React from "react";
// import ProtectedRoute from "../components/ProtectedRoute"; // Tạm thời comment để xem preview
import ManagerTeamManagement from "../pages/Manager/ManagerTeamManagement";
import ManagerVehicle from "../pages/Manager/ManagerVehicle";
import ManagerInventory from "../pages/Manager/ManagerInventory";
import ManagerReports from "../pages/Manager/ManagerReports";

const ManagerRoutes = [
  {
    path: "/manager/teams",
    element: <ManagerTeamManagement />, // Route chính: quản lý đội nhóm
  },
  {
    path: "/manager/dashboard",
    element: <ManagerTeamManagement />, // Alias giữ tương thích đường dẫn cũ
    // element: (
    //   <ProtectedRoute allowedRoles={["manager"]}>
    //     <ManagerTeamManagement />
    //   </ProtectedRoute>
    // ),
  },
  {
    path: "/manager/vehicles",
    element: <ManagerVehicle />,
    // element: (
    //   <ProtectedRoute allowedRoles={["manager"]}>
    //     <ManagerVehicle />
    //   </ProtectedRoute>
    // ),
  },
  // Thêm các routes manager khác ở đây
  {
    path: "/manager/inventory",
    element: <ManagerInventory />,
    //     <ProtectedRoute allowedRoles={["manager"]}>
    //       <InventoryManagement />
    //     </ProtectedRoute>
  },
  {
    path: "/manager/reports",
    element: <ManagerReports />,
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
