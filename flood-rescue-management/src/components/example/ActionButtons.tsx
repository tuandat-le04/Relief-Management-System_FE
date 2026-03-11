import React from "react";
import { RequireRole } from "../auth/RequireRole";
import { Role } from "../../constants/roles";
import { Permission } from "../../constants/permissions";
import { usePermission } from "../../hooks/usePermission";

export const ActionButtons: React.FC = () => {
  const { hasPermission, hasRole } = usePermission();

  return (
    <div className="flex gap-4">
      {/* Button chỉ hiện cho Citizen */}
      <RequireRole roles={[Role.CITIZEN]}>
        <button className="btn btn-primary">Gửi yêu cầu cứu hộ</button>
      </RequireRole>

      {/* Button chỉ hiện cho Coordinator và Admin */}
      <RequireRole roles={[Role.RESCUE_COORDINATOR, Role.ADMIN]}>
        <button className="btn btn-warning">Điều phối đội cứu hộ</button>
      </RequireRole>

      {/* Button dựa trên permission */}
      <RequireRole permissions={[Permission.MANAGE_VEHICLES]}>
        <button className="btn btn-info">Quản lý phương tiện</button>
      </RequireRole>

      {/* Conditional rendering với hook */}
      {hasPermission(Permission.MANAGE_USERS) && (
        <button className="btn btn-danger">Quản lý người dùng</button>
      )}

      {/* Multiple permissions - cần ít nhất 1 */}
      <RequireRole
        permissions={[Permission.VIEW_ALL_REPORTS, Permission.VIEW_RESOURCE_REPORTS]}
        requireAll={false}
      >
        <button className="btn btn-success">Xem báo cáo</button>
      </RequireRole>

      {/* With fallback */}
      <RequireRole
        roles={[Role.ADMIN]}
        fallback={<span className="text-gray-500">Chỉ Admin mới thấy nút này</span>}
      >
        <button className="btn btn-secondary">Cấu hình hệ thống</button>
      </RequireRole>
    </div>
  );
};
