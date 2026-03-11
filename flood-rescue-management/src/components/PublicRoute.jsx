import React from "react";
import { Navigate } from "react-router-dom";
import authService from "../services/authService";

/**
 * Public Route - Redirect nếu đã đăng nhập (cho Login, Register)
 */
const PublicRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  // Nếu đã đăng nhập, redirect về dashboard theo role
  if (isAuthenticated && user) {
    switch (user.role) {
      case "ADMIN":
        return <Navigate to="/admin/dashboard" replace />;
      case "RESCUE_COORDINATOR":
        return <Navigate to="/coordinator/dashboard" replace />;
      case "MANAGER":
        return <Navigate to="/manager/dashboard" replace />;
      case "CITIZEN":
        return <Navigate to="/citizen/dashboard" replace />;
      case "RESCUE_TEAM":
        return <Navigate to="/rescue-team/dashboard" replace />;
    }
  }

  return children;
};

export default PublicRoute;
