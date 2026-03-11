import React from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import CitizenDashboard from "../pages/Citizen/CitizenDashboard";
import CitizenRescueRequest from "../pages/Citizen/CitizenRescueRequest";
import CitizenReliefRequest from "../pages/Citizen/CitizenReliefRequest";

const CitizenRoutes = [
  {
    path: "/citizen/dashboard",
    element: (
      <ProtectedRoute allowedRoles={["CITIZEN"]}>
        <CitizenDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/citizen/rescue-request",
    element: (
      <ProtectedRoute allowedRoles={["CITIZEN"]}>
        <CitizenRescueRequest />
      </ProtectedRoute>
    ),
  },
  {
    path: "/citizen/relief-request",
    element: (
      <ProtectedRoute allowedRoles={["CITIZEN"]}>
        <CitizenReliefRequest />
      </ProtectedRoute>
    ),
  },
];

export default CitizenRoutes;
