import React, { useState } from "react";
import { Link } from "react-router-dom";

const CitizenDashboard = () => {
  const [layers, setLayers] = useState({
    danger: true,
    safe: true,
    relief: false,
  });

  const toggleLayer = (layer) => {
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
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

            <button className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 p-1 pl-1 pr-3 rounded-full transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700 group">
              <div className="size-8 bg-gray-200 rounded-full overflow-hidden ring-2 ring-white dark:ring-gray-800 shadow-sm group-hover:ring-primary/20 transition-all">
                <img
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5tF_1eIvvrD83eWRAoe-3d96B0aXaXs0jqAWxqyswKI8LBiqyVvXHOnhHzw7Lo0qP_mmp2JQP3ThRBAd0GohkAV439UpMYlBTQbLcWRY3WSY9C2s9jILWHGFq-ZDjSsiagrlYlpzMYlzr6tn60wG23atqijkSQSWYuGpd0_vlJ47riljO8rivoPHnrBImgTd_4MZ8AKU-xUIEDckE7iwA8Y3sEa_Fpguo4ZwL_MDTXnAITVBYEaXXfxKQb098GdXmTcTnamZUeU0"
                />
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-xs font-bold text-gray-900 dark:text-gray-100 leading-tight">
                  Đặng Minh
                </p>
                <p className="text-[10px] text-gray-500 font-medium">
                  Tình nguyện viên
                </p>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-[380px] lg:w-[420px] z-20 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col shadow-2xl relative">
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-5 space-y-6">
              {/* Action Buttons */}
              <div className="grid gap-4">
                <button
                  className="w-full group relative overflow-hidden rounded-2xl text-white shadow-lg shadow-red-900/20 hover:shadow-xl hover:shadow-red-900/30 transition-all hover:-translate-y-1"
                  style={{ backgroundColor: "#D32F2F" }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_2s_infinite]"></div>
                  <div className="p-5 flex items-center gap-4 relative z-10">
                    <div className="flex-shrink-0 bg-white/20 h-14 w-14 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-inner border border-white/10">
                      <span className="material-symbols-outlined text-[32px] animate-pulse">
                        emergency_share
                      </span>
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <span className="block text-lg font-black uppercase tracking-tight leading-tight">
                        Gửi Cứu Hộ SOS
                      </span>
                      <span className="block text-xs font-medium text-red-100 mt-1 opacity-90">
                        Chia sẻ vị trí khẩn cấp ngay
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-white/70 group-hover:translate-x-1 transition-transform">
                      chevron_right
                    </span>
                  </div>
                </button>

                <button
                  className="w-full group relative overflow-hidden rounded-2xl text-white shadow-lg shadow-orange-900/20 hover:shadow-xl hover:shadow-orange-900/30 transition-all hover:-translate-y-1"
                  style={{ backgroundColor: "#F57C00" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="p-5 flex items-center gap-4 relative z-10">
                    <div className="flex-shrink-0 bg-white/20 h-14 w-14 rounded-xl flex items-center justify-center backdrop-blur-sm shadow-inner border border-white/10">
                      <span className="material-symbols-outlined text-[32px]">
                        inventory_2
                      </span>
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <span className="block text-lg font-black uppercase tracking-tight leading-tight">
                        Yêu Cầu Nhu Yếu Phẩm
                      </span>
                      <span className="block text-xs font-medium text-orange-100 mt-1 opacity-90">
                        Lương thực, thuốc men, áo phao
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-white/70 group-hover:translate-x-1 transition-transform">
                      chevron_right
                    </span>
                  </div>
                </button>
              </div>

              {/* Area Status */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">
                    Tình hình khu vực
                  </h3>
                  <button className="text-xs text-primary font-bold hover:underline">
                    Chi tiết
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-center group cursor-pointer hover:border-red-200 transition-colors">
                    <span className="material-symbols-outlined text-sos-red text-2xl mb-1 group-hover:scale-110 transition-transform">
                      warning
                    </span>
                    <span className="block text-2xl font-black text-gray-800 dark:text-gray-100">
                      12
                    </span>
                    <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase">
                      Điểm ngập sâu
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 text-center group cursor-pointer hover:border-blue-200 transition-colors">
                    <span className="material-symbols-outlined text-primary text-2xl mb-1 group-hover:scale-110 transition-transform">
                      groups
                    </span>
                    <span className="block text-2xl font-black text-gray-800 dark:text-gray-100">
                      08
                    </span>
                    <span className="text-[10px] font-bold text-primary uppercase">
                      Đội cứu hộ
                    </span>
                  </div>
                </div>
              </div>

              {/* Map Layers */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">
                  Lớp bản đồ
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-200 dark:border-gray-700 space-y-2">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <span className="size-2 rounded-full bg-sos-red shadow-[0_0_8px_rgba(211,47,47,0.5)]"></span>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Cảnh báo nguy hiểm
                      </span>
                    </div>
                    <div
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        layers.danger ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
                      }`}
                      onClick={() => toggleLayer("danger")}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          layers.danger ? "translate-x-4" : "translate-x-1"
                        }`}
                      ></span>
                    </div>
                  </label>

                  <div className="h-px bg-gray-200 dark:bg-gray-700"></div>

                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <span className="size-2 rounded-full bg-status-green shadow-[0_0_8px_rgba(46,125,50,0.5)]"></span>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Điểm an toàn / Y tế
                      </span>
                    </div>
                    <div
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        layers.safe ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
                      }`}
                      onClick={() => toggleLayer("safe")}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          layers.safe ? "translate-x-4" : "translate-x-1"
                        }`}
                      ></span>
                    </div>
                  </label>

                  <div className="h-px bg-gray-200 dark:bg-gray-700"></div>

                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <span className="size-2 rounded-full bg-relief-orange shadow-[0_0_8px_rgba(245,124,0,0.5)]"></span>
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Điểm phân phát nhu yếu phẩm
                      </span>
                    </div>
                    <div
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        layers.relief ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
                      }`}
                      onClick={() => toggleLayer("relief")}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          layers.relief ? "translate-x-4" : "translate-x-1"
                        }`}
                      ></span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center gap-3 opacity-75 hover:opacity-100 transition-opacity cursor-help">
              <img
                alt="Vietnam Flag"
                className="h-8 w-auto rounded shadow-sm"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDbwsd5COc0qb5bDiOm1Jyfu7PSjstjNGocCoN5mjC6zAXiGQA7UdbExicM2lsRjdCZd3irz98ny4kvNbZevIb5WKJhvuTpbV06HlRhzRnHy6eEZMx3O8NtH-rXvT9D0U4GKdoWEwv2QPnebYk9kB38-QRX4v9rAWCGkcLoXAiHwHgO8N9xqIJrGTmPnbLWBJMv1bwxkv3yjJ8O0zUDnKPNx57RzJAI8WZw5Wp4mDnvX087sb8JdhjcGJ0hKn7q6r4fcwz09oJ9GIc"
              />
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Dữ liệu thời gian thực
                </p>
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Cập nhật: 2 phút trước
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative flex flex-col bg-slate-200 overflow-hidden isolate">
          {/* Map Base */}
          <div
            className="absolute inset-0 z-0 transition-transform duration-[2s] hover:scale-[1.01]"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCSMU__1goqEb5IefkHjv2LR-gq3VwDm1Viz7GBnyEfVxys7wRix6v0erXtycJkPzAOtQaJiMZZgYcqe48JdAIf338xRalh8-woqIfBXJl1K5YRPA8fJl7e9RzHjq1up9gGHUPF7nfSSp81L_el1xwqVQ6HopD97Jax1DmFJg7yJuFrG0Zoz9ydausaJ-PwxqgAIhdBFzffP2-mQ_aSOQiudFLk5HJd_0KzSDRo0NJ1409q7nrhFWAvLwhBOUBaC5qt1C45q_EROVg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "saturate(1.1) contrast(1.1)",
            }}
          />

          {/* Map Overlay Effects */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-blue-900/10 mix-blend-multiply"></div>
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  height="10"
                  id="diagonalHatch"
                  patternTransform="rotate(45 0 0)"
                  patternUnits="userSpaceOnUse"
                  width="10"
                >
                  <line
                    style={{ stroke: "rgba(211, 47, 47, 0.5)", strokeWidth: 1 }}
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="10"
                  />
                </pattern>
              </defs>
              <path
                className="opacity-60"
                d="M-50,600 Q300,500 500,600 T900,550 T1400,650 V1000 H-50 Z"
                fill="url(#diagonalHatch)"
                stroke="rgba(211, 47, 47, 0.6)"
                strokeWidth="2"
              />
              <circle
                cx="75%"
                cy="30%"
                fill="rgba(46, 125, 50, 0.05)"
                r="120"
                stroke="rgba(46, 125, 50, 0.4)"
                strokeDasharray="5,5"
                strokeWidth="2"
              />
            </svg>
          </div>

          {/* Map Markers - SOS */}
          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="absolute top-[65%] left-[40%] pointer-events-auto cursor-pointer group">
              <div className="relative flex flex-col items-center">
                <div className="absolute -inset-4 bg-sos-red/40 rounded-full animate-radar"></div>
                <div className="relative z-10 bg-sos-red text-white p-2.5 rounded-full shadow-lg border-2 border-white dark:border-gray-800 transition-transform hover:scale-110">
                  <span className="material-symbols-outlined text-xl">sos</span>
                </div>
                <div className="absolute bottom-full mb-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 whitespace-nowrap">
                  SOS: Nước dâng cao 2m
                  <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 border-l-4 border-r-4 border-t-6 border-transparent border-t-white dark:border-t-gray-800"></div>
                </div>
              </div>
            </div>

            {/* Safe Point Marker */}
            <div className="absolute top-[28%] left-[72%] pointer-events-auto cursor-pointer group">
              <div className="relative flex flex-col items-center">
                <div className="bg-status-green text-white p-2 rounded-full shadow-lg border-2 border-white dark:border-gray-800 transition-transform hover:scale-110">
                  <span className="material-symbols-outlined text-xl">gpp_good</span>
                </div>
                <div className="absolute top-full mt-2 bg-white dark:bg-gray-800 text-status-green text-xs font-bold px-2 py-1 rounded shadow-md whitespace-nowrap">
                  Điểm tập kết an toàn
                </div>
              </div>
            </div>

            {/* Rescue Team Marker */}
            <div className="absolute top-[55%] left-[55%] pointer-events-auto cursor-pointer group animate-float">
              <div className="relative flex flex-col items-center">
                <div className="bg-primary text-white p-2 rounded-full shadow-lg border-2 border-white dark:border-gray-800 transform -rotate-6">
                  <span className="material-symbols-outlined text-xl">sailing</span>
                </div>
                <div className="mt-1 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-primary shadow-sm border border-white/50">
                  Đội Cứu Hộ 01
                </div>
              </div>
            </div>

            {/* Relief Supply Marker */}
            <div className="absolute top-[35%] left-[25%] pointer-events-auto cursor-pointer group">
              <div className="relative flex flex-col items-center">
                <div className="bg-relief-orange text-white p-1.5 rounded-lg shadow-lg border-2 border-white dark:border-gray-800 transition-transform hover:scale-110">
                  <span className="material-symbols-outlined text-lg">package_2</span>
                </div>
                <div className="absolute top-full mt-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                  Kho lương thực
                </div>
              </div>
            </div>

            {/* User Location Marker */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group">
              <div className="relative flex flex-col items-center justify-center">
                <div className="size-24 bg-blue-500/10 rounded-full absolute animate-ping"></div>
                <div className="size-4 bg-blue-600 rounded-full border-2 border-white shadow-xl relative z-10"></div>
                <div className="absolute -top-10 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md whitespace-nowrap">
                  Vị trí của bạn
                </div>
              </div>
            </div>
          </div>

          {/* Map Controls - Top Right */}
          <div className="absolute top-6 right-6 z-30 flex flex-col gap-3">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur p-1 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex gap-1">
              <button className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-bold text-gray-800 dark:text-gray-200 shadow-sm">
                Vệ tinh
              </button>
              <button className="px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 rounded text-xs font-medium text-gray-500 dark:text-gray-400 transition-colors">
                Địa hình
              </button>
            </div>

            <div className="flex flex-col gap-2 self-end">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
                <button className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors border-b border-gray-100 dark:border-gray-700">
                  <span className="material-symbols-outlined text-[20px]">add</span>
                </button>
                <button className="p-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">remove</span>
                </button>
              </div>
              <button className="bg-white/90 dark:bg-gray-800/90 backdrop-blur p-2.5 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-primary transition-colors">
                <span className="material-symbols-outlined text-[20px]">my_location</span>
              </button>
            </div>
          </div>

          {/* Bottom Right Controls */}
          <div className="absolute bottom-6 right-6 z-30 flex items-center gap-3">
            <button className="bg-white dark:bg-gray-800 size-12 rounded-full shadow-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 transition-transform hover:scale-105 active:scale-95 group">
              <span className="material-symbols-outlined text-gray-600 dark:text-gray-300 group-hover:rotate-45 transition-transform duration-500">
                settings
              </span>
            </button>
            <button className="bg-white dark:bg-gray-800 h-12 px-5 rounded-full shadow-2xl border border-gray-200 dark:border-gray-700 flex items-center gap-2 hover:bg-gray-50 transition-all hover:scale-105 active:scale-95 font-bold text-gray-800 dark:text-gray-100 group">
              <div className="bg-primary/10 p-1.5 rounded-full group-hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  support_agent
                </span>
              </div>
              <span>Trợ giúp 24/7</span>
            </button>
          </div>

          {/* Map Legend - Bottom Left */}
          <div className="absolute bottom-6 left-6 z-20 hidden lg:block">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 min-w-[200px]">
              <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
                Chú giải bản đồ
              </h4>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-4 bg-red-100/50 border border-red-500/50 rounded-sm"></div>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Vùng ngập lụt
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="size-3 bg-status-green rounded-full shadow-sm ring-2 ring-white dark:ring-gray-800"></span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Điểm an toàn
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="size-3 bg-primary rounded-full shadow-sm ring-2 ring-white dark:ring-gray-800"></span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Lực lượng cứu hộ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CitizenDashboard;
