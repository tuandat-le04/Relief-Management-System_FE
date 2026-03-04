import React from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";

const TeamMembers = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-solid border-[#e5e7eb] dark:border-[#374151] bg-white dark:bg-background-dark px-6 py-3 lg:px-10 shadow-sm">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg text-white shadow-lg shadow-primary/30">
              <span className="material-symbols-outlined block text-2xl">emergency</span>
            </div>
            <div>
              <h2 className="text-[#131416] dark:text-white text-xl font-black leading-tight tracking-tight uppercase">Cứu Hộ VN</h2>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Team Alpha-1</p>
            </div>
          </div>
          <div className="hidden md:flex items-center bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full px-4 py-1.5">
            <span className="w-2 h-2 rounded-full bg-success-green animate-pulse mr-2"></span>
            <span className="text-success-green text-xs font-bold uppercase">Hệ thống trực tuyến</span>
          </div>
        </div>
        <div className="flex items-center gap-4 lg:gap-6">
          <nav className="hidden lg:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => navigate("/rescue-team/dashboard")}
              className="px-4 py-2 rounded-md text-[#6b7680] dark:text-gray-400 text-sm font-bold hover:text-primary transition-colors"
            >
              Nhiệm vụ
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-md bg-white dark:bg-gray-700 shadow-sm text-primary text-sm font-bold"
            >
              Thành viên
            </button>
          </nav>
          <button className="flex items-center justify-center rounded-lg h-11 px-6 bg-red-600 hover:bg-red-700 text-white text-sm font-black shadow-lg shadow-red-600/30 transition-all active:scale-95 border-2 border-red-500">
            <span className="material-symbols-outlined mr-2">campaign</span>
            <span>SOS</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="hidden sm:inline-flex items-center justify-center rounded-lg h-11 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-100 text-sm font-bold border border-gray-300 dark:border-gray-600 transition-colors"
          >
            <span className="material-symbols-outlined mr-1 text-base">logout</span>
            <span>Đăng xuất</span>
          </button>
          <div
            className="h-11 w-11 rounded-full bg-cover bg-center border-2 border-white shadow-md ring-2 ring-primary/20"
            data-alt="Ảnh đại diện đội trưởng đội cứu hộ"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDuyHJht1Ui_YnTJY1DSTJcepL41z4IZMSumUIurIVYz9lef0hO7-k_3uGKOnurRxgL8dyP3uXt8LLnxj0am06PnWSIY2rEbTIWwBVHMyaX-Ubx2HcV_jmPv0vWeY7QjH7wnnbSuvmdF3a96wV66E8_Xkkm4SJzfiy5u8pZsR7Jg1GT1YRXxBBTCjsOtcNX1pL-AlsMP3II1iJxEO0E1UYqEpwzWTj6UZeSCvlEbrTbzEdxkZ8BFHsX9mCnN-_TbKVl9lw6NXuuRBM")',
            }}
          ></div>
        </div>
      </header>
      <main className="bg-background-light dark:bg-background-dark font-display text-[#131416] dark:text-white min-h-screen">
        <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row h-[calc(100vh-73px)] overflow-hidden">
          <aside className="hidden lg:flex flex-col w-72 border-r border-[#e5e7eb] dark:border-[#374151] bg-white dark:bg-[#1c1e22] p-4 gap-6 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
            <div className="px-2">
              <h1 className="text-[#131416] dark:text-white text-xl font-black mb-1">Đội Cứu Hộ 01</h1>
              <p className="text-sm text-gray-500 font-medium">Khu vực: Quận 1 - Bình Thạnh</p>
            </div>
            <nav className="flex flex-col gap-2 flex-1">
              <button
                type="button"
                onClick={() => navigate("/rescue-team/dashboard")}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined">assignment</span>
                  <p className="text-sm font-bold">Nhiệm vụ</p>
                </div>
                <span className="bg-gray-200 dark:bg-gray-700 px-2.5 py-0.5 rounded text-xs font-bold text-gray-600 dark:text-gray-300">1</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary text-white shadow-lg shadow-primary/25 cursor-pointer text-left"
              >
                <span className="material-symbols-outlined">groups</span>
                <p className="text-sm font-bold">Thành viên</p>
              </button>
              <button
                type="button"
                onClick={() => navigate("/rescue-team/history")}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer text-left"
              >
                <span className="material-symbols-outlined">history</span>
                <p className="text-sm font-bold">Lịch sử</p>
              </button>
            </nav>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary">cloud</span>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Thời tiết hiện tại</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Mưa lớn, Ngập cục bộ</p>
                  <p className="text-xs text-primary font-bold mt-1">26°C - Gió ĐN 15km/h</p>
                </div>
              </div>
            </div>
          </aside>
          <section className="flex-1 flex flex-col h-full bg-[#f6f7f8] dark:bg-background-dark overflow-hidden relative">
            <div className="h-full grid grid-cols-1 xl:grid-cols-12 overflow-hidden">
              <div className="xl:col-span-4 flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1e22] h-full overflow-hidden shadow-xl z-10">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1e22]">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Tổng Quan Nhân Sự</h2>
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                      </span>
                      <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase">Trực tuyến</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 font-medium">Thông tin lực lượng đội Alpha-1.</p>
                </div>
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-black/10">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white dark:bg-[#2d3139] border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-1">Tổng thành viên</p>
                      <p className="text-4xl font-black text-gray-900 dark:text-white">12</p>
                      <span className="absolute bottom-4 right-4 material-symbols-outlined text-4xl text-gray-100 dark:text-gray-700">groups</span>
                    </div>
                    <div className="bg-white dark:bg-[#2d3139] border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                      <p className="text-xs font-bold text-success-green uppercase mb-1">Sẵn sàng</p>
                      <p className="text-4xl font-black text-success-green">08</p>
                      <span className="absolute bottom-4 right-4 material-symbols-outlined text-4xl text-green-50 dark:text-green-900/30">verified</span>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-[#2d3139] border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm mb-6 border-l-4 border-l-urgency-high">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-xs font-bold text-urgency-high uppercase">Đang làm nhiệm vụ</p>
                      <span className="material-symbols-outlined text-urgency-high animate-pulse">emergency</span>
                    </div>
                    <p className="text-3xl font-black text-gray-900 dark:text-white mb-1">04</p>
                    <p className="text-sm font-bold text-gray-500">
                      Đang xử lý: <span className="text-primary hover:underline cursor-pointer">#RE-9921</span>
                    </p>
                  </div>
                  <div className="mt-6">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Phân bổ chuyên môn</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white dark:bg-[#2d3139] rounded-xl border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500">
                            <span className="material-symbols-outlined text-xl">medical_services</span>
                          </div>
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Sơ cấp cứu / Y tế</span>
                        </div>
                        <span className="font-black text-gray-900 dark:text-white">4</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white dark:bg-[#2d3139] rounded-xl border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500">
                            <span className="material-symbols-outlined text-xl">water</span>
                          </div>
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Cứu hộ đường thủy</span>
                        </div>
                        <span className="font-black text-gray-900 dark:text-white">5</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white dark:bg-[#2d3139] rounded-xl border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-500">
                            <span className="material-symbols-outlined text-xl">engineering</span>
                          </div>
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Kỹ thuật / Cơ khí</span>
                        </div>
                        <span className="font-black text-gray-900 dark:text-white">3</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="xl:col-span-8 overflow-y-auto bg-gray-50 dark:bg-black/20 h-full">
                <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">Danh Sách Thành Viên</h2>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-primary transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">filter_list</span> Lọc
                      </button>
                      <button className="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-lg shadow-primary/30">
                        <span className="material-symbols-outlined text-lg">add</span> Thêm mới
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-[#1c1e22] rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row items-start md:items-center gap-5 hover:border-primary/50 transition-all group">
                      <div className="relative">
                        <div
                          className="w-14 h-14 rounded-full bg-gray-200 bg-cover bg-center border-2 border-white dark:border-gray-600 shadow-md"
                          style={{
                            backgroundImage:
                              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDuyHJht1Ui_YnTJY1DSTJcepL41z4IZMSumUIurIVYz9lef0hO7-k_3uGKOnurRxgL8dyP3uXt8LLnxj0am06PnWSIY2rEbTIWwBVHMyaX-Ubx2HcV_jmPv0vWeY7QjH7wnnbSuvmdF3a96wV66E8_Xkkm4SJzfiy5u8pZsR7Jg1GT1YRXxBBTCjsOtcNX1pL-AlsMP3II1iJxEO0E1UYqEpwzWTj6UZeSCvlEbrTbzEdxkZ8BFHsX9mCnN-_TbKVl9lw6NXuuRBM')",
                          }}
                        ></div>
                        <span className="absolute -bottom-1 -right-1 bg-urgency-high w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[10px] text-white font-bold">priority_high</span>
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">Lê Văn Nam</h3>
                          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border border-primary/20">
                            Đội trưởng
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold">
                            <span className="material-symbols-outlined text-sm">campaign</span> Chỉ huy
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold">
                            <span className="material-symbols-outlined text-sm">rowing</span> Cứu nạn
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 w-full md:w-auto mt-2 md:mt-0">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/50 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase shadow-sm">
                          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                          Đang thực hiện nhiệm vụ #RE-9921
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold">Cập nhật: 5 phút trước</p>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-[#1c1e22] rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row items-start md:items-center gap-5 hover:border-primary/50 transition-all group">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-black text-xl border-2 border-white dark:border-gray-600 shadow-md">
                          NB
                        </div>
                        <span className="absolute -bottom-1 -right-1 bg-urgency-high w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[10px] text-white font-bold">priority_high</span>
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">Nguyễn Văn B</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold">
                            <span className="material-symbols-outlined text-sm">water</span> Cứu hộ đường thủy
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold">
                            <span className="material-symbols-outlined text-sm">medical_services</span> Sơ cấp cứu
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 w-full md:w-auto mt-2 md:mt-0">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/50 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase shadow-sm">
                          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                          Đang thực hiện nhiệm vụ #RE-9921
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold">Cập nhật: 12 phút trước</p>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-[#1c1e22] rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row items-start md:items-center gap-5 hover:border-primary/50 transition-all group">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-black text-xl border-2 border-white dark:border-gray-600 shadow-md">
                          TC
                        </div>
                        <span className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[10px] text-white font-bold">check</span>
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">Trần Thị C</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold">
                            <span className="material-symbols-outlined text-sm">psychology</span> Tư vấn tâm lý
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold">
                            <span className="material-symbols-outlined text-sm">inventory_2</span> Hậu cần
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 w-full md:w-auto mt-2 md:mt-0">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50 text-success-green text-xs font-bold uppercase shadow-sm">
                          <span className="w-2 h-2 rounded-full bg-success-green"></span>
                          Sẵn sàng
                        </div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-[#1c1e22] rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row items-start md:items-center gap-5 hover:border-primary/50 transition-all group">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-black text-xl border-2 border-white dark:border-gray-600 shadow-md">
                          LD
                        </div>
                        <span className="absolute -bottom-1 -right-1 bg-urgency-high w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[10px] text-white font-bold">priority_high</span>
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">Lê Văn D</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold">
                            <span className="material-symbols-outlined text-sm">directions_car</span> Lái xe chuyên dụng
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold">
                            <span className="material-symbols-outlined text-sm">build</span> Kỹ thuật
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 w-full md:w-auto mt-2 md:mt-0">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/50 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase shadow-sm">
                          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                          Đang thực hiện nhiệm vụ #RE-9921
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold">Cập nhật: 15 phút trước</p>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-[#1c1e22] rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row items-start md:items-center gap-5 hover:border-primary/50 transition-all group">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-black text-xl border-2 border-white dark:border-gray-600 shadow-md">
                          HK
                        </div>
                        <span className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[10px] text-white font-bold">check</span>
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">Hoàng Văn K</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold">
                            <span className="material-symbols-outlined text-sm">satellite_alt</span> Viễn thông
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold">
                            <span className="material-symbols-outlined text-sm">map</span> Trinh sát
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 w-full md:w-auto mt-2 md:mt-0">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50 text-success-green text-xs font-bold uppercase shadow-sm">
                          <span className="w-2 h-2 rounded-full bg-success-green"></span>
                          Sẵn sàng
                        </div>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-[#1c1e22] rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row items-start md:items-center gap-5 hover:border-primary/50 transition-all group">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-black text-xl border-2 border-white dark:border-gray-600 shadow-md">
                          ...
                        </div>
                        <span className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                          <span className="material-symbols-outlined text-[10px] text-white font-bold">check</span>
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">Nguyễn Thành P</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold">
                            <span className="material-symbols-outlined text-sm">support</span> Tình nguyện viên
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 w-full md:w-auto mt-2 md:mt-0">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50 text-success-green text-xs font-bold uppercase shadow-sm">
                          <span className="w-2 h-2 rounded-full bg-success-green"></span>
                          Sẵn sàng
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="w-full py-4 text-center text-sm font-bold text-gray-500 hover:text-primary transition-colors">
                    Xem tất cả 12 thành viên
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
        <button className="lg:hidden fixed bottom-6 right-6 w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white shadow-2xl z-50 ring-4 ring-red-600/30">
          <span className="material-symbols-outlined text-4xl">emergency_share</span>
        </button>
      </main>
    </>
  );
};

export default TeamMembers;
