export enum Role {
  CITIZEN = "CITIZEN",
  RESCUE_TEAM = "RESCUE_TEAM",
  RESCUE_COORDINATOR = "RESCUE_COORDINATOR",
  MANAGER = "MANAGER",
  ADMIN = "ADMIN",
}

export const ROLE_HIERARCHY: Record<Role, number> = {
  [Role.CITIZEN]: 1,
  [Role.RESCUE_TEAM]: 2,
  [Role.RESCUE_COORDINATOR]: 3,
  [Role.MANAGER]: 3,
  [Role.ADMIN]: 5,
};

export const ROLE_LABELS: Record<Role, string> = {
  [Role.CITIZEN]: "Người dân",
  [Role.RESCUE_TEAM]: "Đội cứu hộ",
  [Role.RESCUE_COORDINATOR]: "Điều phối viên",
  [Role.MANAGER]: "Quản lý",
  [Role.ADMIN]: "Quản trị viên",
};
