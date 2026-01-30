import React from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import CitizenDashboard from "../pages/Citizen/CitizenDashboard";

const CitizenRoutes = [
  {
    path: "/citizen/dashboard",
    element: (
      <ProtectedRoute allowedRoles={["CITIZEN"]}>
        <CitizenDashboard />
      </ProtectedRoute>
    ),
  },
];

export default CitizenRoutes;
