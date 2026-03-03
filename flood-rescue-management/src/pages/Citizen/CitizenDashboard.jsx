import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import CitizenMapGoong from "../../components/citizen/CitizenMapGoong";

const CitizenDashboard = () => {
  const navigate = useNavigate();
  const [layers, setLayers] = useState({
    danger: true,
    safe: true,
    relief: false,
  });

  const currentUser = authService.getCurrentUser();
  const displayName =
    currentUser?.fullName || currentUser?.username || currentUser?.name || "Người dùng";
  const avatarUrl =
    currentUser?.avatar ||
    "https://lh3.googleusercontent.com/aida-public/AB6AXuC5tF_1eIvvrD83eWRAoe-3d96B0aXaXs0jqAWxqyswKI8LBiqyVvXHOnhHzw7Lo0qP_mmp2JQP3ThRBAd0GohkAV439UpMYlBTQbLcWRY3WSY9C2s9jILWHGFq-ZDjSsiagrlYlpzMYlzr6tn60wG23atqijkSQSWYuGpd0_vlJ47riljO8rivoPHnrBImgTd_4MZ8AKU-xUIEDckE7iwA8Y3sEa_Fpguo4ZwL_MDTXnAITVBYEaXXfxKQb098GdXmTcTnamZUeU0";

  const toggleLayer = (layer) => {
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display overflow-hidden text-gray-800 dark:text-gray-100">
      {/* Top Alert Banner */}
      <div className="w-full bg-gradient-to-r from-status-green to-emerald-600 py-2 px-4 text-white text-center shadow-md z-[60] relative flex items-center justify-center gap-2">
        <span className="material-symbols-outlined text-sm animate-pulse">
          check_circle
        </span>
        <p className="text-xs md:text-sm font-bold tracking-wide">
          Hệ thống kích hoạt cấp độ 2 — Các đội cứu hộ đang trực tuyến
        </p>
      </div>

      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 dark:bg-gray-900/95 dark:border-gray-800 px-4 md:px-6 py-3 flex items-center justify-between z-50 relative shadow-sm h-16">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="size-9 text-primary bg-primary/10 p-1.5 rounded-lg">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path
                  clipRule="evenodd"
                  d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z"
                  fill="currentColor"
                  fillRule="evenodd"
                />
                <path
                  clipRule="evenodd"
                  d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z"
                  fill="currentColor"
                  fillRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-gray-900 dark:text-white text-base md:text-lg font-black leading-none tracking-tight">
                CỨU TRỢ THIÊN TAI
              </h1>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">
                Cổng thông tin quốc gia
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-600 dark:text-gray-400">
            <Link to="#" className="hover:text-primary transition-colors">
              Tin tức
            </Link>
            <Link to="#" className="hover:text-primary transition-colors">
              Hướng dẫn
            </Link>
            <Link to="#" className="text-primary">
              Bản đồ
            </Link>
          </nav>

          <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <span className="material-symbols-outlined text-[22px]">
                notifications
              </span>
              <span className="absolute top-1.5 right-1.5 size-2.5 bg-sos-red rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></span>
            </button>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 p-1 pl-1 pr-3 rounded-full transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700 group">
                <div className="size-8 bg-gray-200 rounded-full overflow-hidden ring-2 ring-white dark:ring-gray-800 shadow-sm group-hover:ring-primary/20 transition-all">
                  <img
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                    src={avatarUrl}
                  />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    {displayName}
                  </p>
                  <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                    Công dân
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="text-[10px] font-semibold text-red-600 hover:text-red-700 uppercase tracking-wider"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Sidebar */}
          <aside className="w-full lg:w-[360px] bg-white/95 dark:bg-gray-900/95 border-r border-gray-200 dark:border-gray-800 p-4 md:p-5 space-y-4 overflow-y-auto">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                Xin chào
              </p>
              <h2 className="mt-1 text-base font-bold text-gray-900 dark:text-white">
                {displayName}
              </h2>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Theo dõi tình hình cứu hộ và gửi yêu cầu hỗ trợ.
              </p>
            </div>

            {/* Quick actions */}
            <div className="space-y-3">
              <Link
                to="/citizen/rescue-request"
                className="flex items-center justify-between gap-3 rounded-xl bg-sos-red text-white px-4 py-3 shadow-md hover:bg-red-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-xl">sos</span>
                  <div>
                    <p className="text-sm font-bold">Gửi Cứu Hộ SOS</p>
                    <p className="text-[11px] opacity-90">
                      Dùng khi có nguy hiểm khẩn cấp.
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-base">chevron_right</span>
              </Link>

              <Link
                to="/citizen/relief-request"
                className="flex items-center justify-between gap-3 rounded-xl bg-[#218838] text-white px-4 py-3 shadow-md hover:bg-[#19692c] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-xl">volunteer_activism</span>
                  <div>
                    <p className="text-sm font-bold">Yêu cầu nhu yếu phẩm</p>
                    <p className="text-[11px] opacity-90">
                      Lương thực, nước sạch, thuốc men, v.v.
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-base">chevron_right</span>
              </Link>
            </div>

            {/* Map layers */}
            <div className="mt-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                Lớp bản đồ
              </h3>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => toggleLayer("danger")}
                  className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold border transition-colors ${
                    layers.danger
                      ? "bg-red-50 border-red-200 text-red-700"
                      : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-sos-red"></span>
                    Vùng nguy hiểm / ngập
                  </span>
                  <span className="material-symbols-outlined text-sm">
                    {layers.danger ? "visibility" : "visibility_off"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleLayer("safe")}
                  className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold border transition-colors ${
                    layers.safe
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-status-green"></span>
                    Điểm an toàn / tập kết
                  </span>
                  <span className="material-symbols-outlined text-sm">
                    {layers.safe ? "visibility" : "visibility_off"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleLayer("relief")}
                  className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold border transition-colors ${
                    layers.relief
                      ? "bg-amber-50 border-amber-200 text-amber-700"
                      : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full bg-relief-orange"></span>
                    Kho nhu yếu phẩm / phân phát
                  </span>
                  <span className="material-symbols-outlined text-sm">
                    {layers.relief ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>
          </aside>

          {/* Map Area: Goong Map */}
          <div className="flex-1 relative bg-slate-200 overflow-hidden isolate">
            <CitizenMapGoong />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CitizenDashboard;
