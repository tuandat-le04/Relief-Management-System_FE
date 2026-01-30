import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();
  return (
    <aside className="w-72 bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 flex flex-col shrink-0 shadow-2xl">
      {/* Header Section */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3 mb-8 p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 rounded-xl shadow-lg shadow-emerald-500/20">
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 16h2v-6h-2v6zm0-8h2V7h-2v3z" />
            </svg>
          </div>
          <div>
            <h1 className="text-gray-800 text-lg font-bold leading-tight tracking-tight">
              ReliefAdmin VN
            </h1>
            <p className="text-gray-600 text-xs font-medium mt-0.5">
              Hệ thống điều phối cứu trợ
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex flex-col gap-1">
          <Link
            to="/admin/dashboard"
            className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:translate-x-1 ${
              location.pathname === "/admin/dashboard"
                ? "bg-gradient-to-r from-emerald-100 via-emerald-50 to-transparent border border-emerald-300 text-emerald-700 shadow-lg shadow-emerald-200/50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-transparent hover:border-gray-200"
            }`}
          >
            <div
              className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300 group-hover:scale-110 ${
                location.pathname === "/admin/dashboard"
                  ? "bg-emerald-200 group-hover:bg-emerald-300"
                  : "bg-gray-200 group-hover:bg-gray-300"
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
            </div>
            <span className="text-sm font-semibold">Quản lý người dùng</span>
          </Link>

          <Link
            to="/admin/configuration"
            className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:translate-x-1 ${
              location.pathname === "/admin/configuration"
                ? "bg-gradient-to-r from-emerald-100 via-emerald-50 to-transparent border border-emerald-300 text-emerald-700 shadow-lg shadow-emerald-200/50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-transparent hover:border-gray-200"
            }`}
          >
            <div
              className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300 group-hover:scale-110 ${
                location.pathname === "/admin/configuration"
                  ? "bg-emerald-200 group-hover:bg-emerald-300"
                  : "bg-gray-200 group-hover:bg-gray-300"
              }`}
            >
              <svg
                className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
              </svg>
            </div>
            <span className="text-sm font-semibold">Cấu hình hệ thống</span>
          </Link>

          <Link
            to="/admin/reports"
            className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:translate-x-1 ${
              location.pathname === "/admin/reports"
                ? "bg-gradient-to-r from-emerald-100 via-emerald-50 to-transparent border border-emerald-300 text-emerald-700 shadow-lg shadow-emerald-200/50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-transparent hover:border-gray-200"
            }`}
          >
            <div
              className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300 group-hover:scale-110 ${
                location.pathname === "/admin/reports"
                  ? "bg-emerald-200 group-hover:bg-emerald-300"
                  : "bg-gray-200 group-hover:bg-gray-300"
              }`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
            </div>
            <span className="text-sm font-semibold">Báo cáo tổng hợp</span>
          </Link>

          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
          </div>
        </nav>
      </div>

      {/* User Profile Section */}
      <div className="mt-auto p-4 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="group flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 cursor-pointer transition-all duration-300 border border-transparent hover:border-gray-200 hover:shadow-lg">
          <div className="relative">
            <div
              className="bg-center bg-no-repeat bg-cover rounded-full w-11 h-11 border-2 border-emerald-300 shadow-lg group-hover:border-emerald-500 transition-all duration-300 group-hover:scale-105"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB3KdN6FBpwEbTMy4gd3fOtxJim3gyInXJABrlB1yjj_H3OTtYXrOAn3RgOs3lb_PxPcVAD9GF4a9i6wVOjGvrKtb2dicDeEJOK2SuL50rGjAeAhpB5MXMXMhtxYWnbvmTTVzWAVbCT9Pj82OYxDhy_jIaekKTjTD17L9bS4ZG-LLuITocX-MArXdkpiI1a7VOuvgkNoOM8xnTQNLl462S9dc96-yvCSPwZvzzQYjOTJWj6rIge_nQTO95XtIbZKayRs5mSJvciGaY")',
              }}
            ></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-lg shadow-green-500/50 animate-pulse"></div>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-gray-800 text-sm font-semibold truncate group-hover:text-emerald-600 transition-colors">
              Trần Minh Đức
            </p>
            <p className="text-gray-600 text-xs truncate font-medium">
              System Operational
            </p>
          </div>
          <svg
            className="w-5 h-5 text-gray-500 group-hover:text-emerald-600 transition-all duration-300 group-hover:translate-x-1"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
          </svg>
        </div>
      </div>
    </aside>
  );
}
