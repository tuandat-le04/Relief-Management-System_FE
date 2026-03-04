import React from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";

const RescueTeamDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bảng điều khiển Đội cứu hộ</h1>
        <button
          onClick={handleLogout}
          className="inline-flex items-center px-4 py-2 rounded-md bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
        >
          <span className="material-symbols-outlined text-sm mr-1">logout</span>
          Đăng xuất
        </button>
      </div>

      <p>
        Đây là trang dashboard dành cho vai trò RESCUE_TEAM. Bạn có thể thêm các
        chức năng quản lý nhiệm vụ cứu hộ, xem yêu cầu cứu trợ, v.v. tại đây.
      </p>
    </div>
  );
};

export default RescueTeamDashboard;
