import React from "react";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Trang quản trị hệ thống. Bạn có thể quản lý người dùng, phân quyền và cấu hình hệ thống tại đây.
      </p>
    </div>
  );
};

export default AdminDashboard;
