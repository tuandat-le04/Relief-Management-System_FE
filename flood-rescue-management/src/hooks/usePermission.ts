import { useMemo } from "react";
import { Role } from "../constants/roles";
import {
  Permission,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from "../constants/permissions";
import authService from "../services/authService";

interface UsePermissionReturn {
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  hasRole: (roles: Role | Role[]) => boolean;
  userRole: Role | null;
  isAuthenticated: boolean;
}

export const usePermission = (): UsePermissionReturn => {
  const user = authService.getCurrentUser();
  const userRole = user?.role as Role | null;
  const isAuthenticated = !!user;

  const checkPermission = useMemo(
    () => (permission: Permission): boolean => {
      if (!userRole) return false;
      return hasPermission(userRole, permission);
    },
    [userRole]
  );

  const checkAnyPermission = useMemo(
    () => (permissions: Permission[]): boolean => {
      if (!userRole) return false;
      return hasAnyPermission(userRole, permissions);
    },
    [userRole]
  );

  const checkAllPermissions = useMemo(
    () => (permissions: Permission[]): boolean => {
      if (!userRole) return false;
      return hasAllPermissions(userRole, permissions);
    },
    [userRole]
  );

  const checkRole = useMemo(
    () => (roles: Role | Role[]): boolean => {
      if (!userRole) return false;
      const roleArray = Array.isArray(roles) ? roles : [roles];
      return roleArray.includes(userRole);
    },
    [userRole]
  );

  return {
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,
    hasRole: checkRole,
    userRole,
    isAuthenticated,
  };
};
