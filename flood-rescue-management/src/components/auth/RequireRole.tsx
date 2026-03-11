import React from "react";
import { Role } from "../../constants/roles";
import { Permission } from "../../constants/permissions";
import { usePermission } from "../../hooks/usePermission";

interface RequireRoleProps {
  roles?: Role[];
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const RequireRole: React.FC<RequireRoleProps> = ({
  roles,
  permissions,
  requireAll = false,
  fallback = null,
  children,
}) => {
  const {
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
  } = usePermission();

  // Kiểm tra role
  if (roles && roles.length > 0 && !hasRole(roles)) {
    return <>{fallback}</>;
  }

  // Kiểm tra permissions
  if (permissions && permissions.length > 0) {
    const hasRequiredPermissions = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);

    if (!hasRequiredPermissions) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};
