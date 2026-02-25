import { Role } from "./roles";

export enum Permission {
  // Citizen permissions
  CREATE_RESCUE_REQUEST = "CREATE_RESCUE_REQUEST",
  VIEW_OWN_REQUESTS = "VIEW_OWN_REQUESTS",
  CONFIRM_RECEIVED = "CONFIRM_RECEIVED",

  // Rescue Team permissions
  VIEW_ASSIGNED_TASKS = "VIEW_ASSIGNED_TASKS",
  UPDATE_TASK_STATUS = "UPDATE_TASK_STATUS",
  REPORT_RESCUE_RESULT = "REPORT_RESCUE_RESULT",

  // Rescue Coordinator permissions
  VERIFY_RESCUE_REQUESTS = "VERIFY_RESCUE_REQUESTS",
  PRIORITIZE_REQUESTS = "PRIORITIZE_REQUESTS",
  ASSIGN_RESCUE_TEAMS = "ASSIGN_RESCUE_TEAMS",
  COORDINATE_RESOURCES = "COORDINATE_RESOURCES",
  VIEW_ALL_REQUESTS = "VIEW_ALL_REQUESTS",

  // Manager permissions
  MANAGE_VEHICLES = "MANAGE_VEHICLES",
  MANAGE_INVENTORY = "MANAGE_INVENTORY",
  TRACK_DISTRIBUTIONS = "TRACK_DISTRIBUTIONS",
  VIEW_RESOURCE_REPORTS = "VIEW_RESOURCE_REPORTS",

  // Admin permissions
  MANAGE_USERS = "MANAGE_USERS",
  MANAGE_ROLES = "MANAGE_ROLES",
  SYSTEM_CONFIG = "SYSTEM_CONFIG",
  VIEW_ALL_REPORTS = "VIEW_ALL_REPORTS",
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.CITIZEN]: [
    Permission.CREATE_RESCUE_REQUEST,
    Permission.VIEW_OWN_REQUESTS,
    Permission.CONFIRM_RECEIVED,
  ],

  [Role.RESCUE_TEAM]: [
    Permission.VIEW_ASSIGNED_TASKS,
    Permission.UPDATE_TASK_STATUS,
    Permission.REPORT_RESCUE_RESULT,
  ],

  [Role.RESCUE_COORDINATOR]: [
    Permission.VERIFY_RESCUE_REQUESTS,
    Permission.PRIORITIZE_REQUESTS,
    Permission.ASSIGN_RESCUE_TEAMS,
    Permission.COORDINATE_RESOURCES,
    Permission.VIEW_ALL_REQUESTS,
  ],

  [Role.MANAGER]: [
    Permission.MANAGE_VEHICLES,
    Permission.MANAGE_INVENTORY,
    Permission.TRACK_DISTRIBUTIONS,
    Permission.VIEW_RESOURCE_REPORTS,
  ],

  [Role.ADMIN]: Object.values(Permission), // Admin có tất cả quyền
};

// Helper function to check if role has permission
export const hasPermission = (role: Role, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
};

// Helper function to check if role has any of permissions
export const hasAnyPermission = (
  role: Role,
  permissions: Permission[]
): boolean => {
  return permissions.some((permission) => hasPermission(role, permission));
};

// Helper function to check if role has all permissions
export const hasAllPermissions = (
  role: Role,
  permissions: Permission[]
): boolean => {
  return permissions.every((permission) => hasPermission(role, permission));
};
