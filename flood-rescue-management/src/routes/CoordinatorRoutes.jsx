import React from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import CoordinatorDashboard from "../pages/coordinator/CoordinatorDashboard";

const CoordinatorRoutes = [
  {
    path: "/coordinator/dashboard",
    element: (
      <ProtectedRoute allowedRoles={["RESCUE_COORDINATOR"]}>
        <CoordinatorDashboard />
      </ProtectedRoute>
    ),
  },
  // Thêm các routes coordinator khác ở đây
];

export default CoordinatorRoutes;
