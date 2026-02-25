import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Role } from "../../constants/roles";
import { Permission } from "../../constants/permissions";
import { usePermission } from "../../hooks/usePermission";

interface ProtectedRouteProps {
  roles?: Role[];
  permissions?: Permission[];
  requireAll?: boolean; // true = cần tất cả permissions, false = cần ít nhất 1
  redirectTo?: string;
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  roles,
  permissions,
  requireAll = false,
  redirectTo = "/403",
  children,
}) => {
  const location = useLocation();
  const {
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    isAuthenticated,
  } = usePermission();

  // Kiểm tra đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Kiểm tra role
  if (roles && roles.length > 0 && !hasRole(roles)) {
    return <Navigate to={redirectTo} replace />;
  }

  // Kiểm tra permissions
  if (permissions && permissions.length > 0) {
    const hasRequiredPermissions = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);

    if (!hasRequiredPermissions) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
};
