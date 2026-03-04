import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import missionService from "../../services/missionService";
import geocodingService from "../../services/geocodingService";

const RescueTeamDashboard = () => {
  const navigate = useNavigate();

  const [missions, setMissions] = useState([]);
  const [loadingMissions, setLoadingMissions] = useState(false);
  const [missionsError, setMissionsError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  
  const reverseGeocodeWithGoong = async (latitude, longitude) => {
    try {
      const apiKey = import.meta.env.VITE_GOONG_GEOLOCATION_KEY;
      if (!apiKey) {
        console.warn("Thiếu VITE_GOONG_GEOLOCATION_KEY trong file .env");
        return null;
      }
  
      const url = `https://rsapi.goong.io/geocode?latlng=${latitude},${longitude}&api_key=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
  
      const address = data?.results?.[0]?.formatted_address;
      return address || null;
    } catch (error) {
      console.error("Reverse geocode error", error);
      return null;
    }
  };

  const loadMissions = async () => {
    setLoadingMissions(true);
    setMissionsError("");
    const result = await missionService.getAssignedToMe();

    if (result.success) {
      const rawMissions = result.data || [];

      // Tự động reverse geocoding cho các mission chỉ có toạ độ
      const missionsWithAddress = await Promise.all(
        rawMissions.map(async (mission) => {
          const hasTextLocation =
            mission.location ||
            mission.address ||
            mission.request?.address ||
            mission.request?.description;

          if (hasTextLocation) {
            return mission;
          }

          const lat = mission.request?.latitude;
          const lng = mission.request?.longitude;

          const resolvedAddress = await geocodingService.reverseGeocode(
            lat,
            lng,
          );

          if (resolvedAddress) {
            // Gắn thêm field location để UI dùng chung
            return {
              ...mission,
              location: resolvedAddress,
            };
          }

          return mission;
        }),
      );

      setMissions(missionsWithAddress);
    } else {
      setMissionsError(result.error || "Không thể tải danh sách nhiệm vụ");
    }

    setLoadingMissions(false);
  };

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user || null);
    loadMissions();
  }, []);

  const handleRespondMission = async (assignmentId, decision) => {
    let reason = "";

    // Khi DECLINE nhiệm vụ, cho phép nhập lý do (optional)
    if (decision === "DECLINE") {
      // Đơn giản dùng prompt để nhập lý do, có thể thay bằng modal đẹp hơn
      const input = window.prompt("Nhập lý do từ chối (tuỳ chọn):", "");
      reason = input ?? "";
    }

    const result = await missionService.respondToAssignment(
      assignmentId,
      decision,
      reason,
    );

    if (!result.success) {
      window.alert(result.error || "Không thể cập nhật phản hồi nhiệm vụ");
      return;
    }

    // Sau khi ACCEPT/DECLINE, reload danh sách nhiệm vụ
    await loadMissions();
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const displayName =
    (currentUser &&
      (currentUser.fullName ||
        currentUser.name ||
        currentUser.username ||
        currentUser.email ||
        currentUser.phoneNumber)) ||
    "Thành viên đội cứu hộ";

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
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">TEAM ALPHA-1</p>
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
              className="px-4 py-2 rounded-md bg-white dark:bg-gray-700 shadow-sm text-primary text-sm font-bold"
            >
              Nhiệm vụ
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-md text-[#6b7680] dark:text-gray-400 text-sm font-bold hover:text-primary transition-colors"
            >
              Bản đồ
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
          <div className="flex items-center gap-2 max-w-[200px]">
            <div className="flex flex-col items-end mr-1 max-w-[140px]">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-100 truncate w-full" title={displayName}>
                {displayName}
              </span>
              <span className="text-[10px] text-gray-400 dark:text-gray-400 uppercase font-bold tracking-wide">
                Thành viên đội cứu hộ
              </span>
            </div>
            <div
              className="h-11 w-11 rounded-full bg-cover bg-center border-2 border-white shadow-md ring-2 ring-primary/20"
              data-alt="Ảnh đại diện đội trưởng đội cứu hộ"
              title={displayName}
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDuyHJht1Ui_YnTJY1DSTJcepL41z4IZMSumUIurIVYz9lef0hO7-k_3uGKOnurRxgL8dyP3uXt8LLnxj0am06PnWSIY2rEbTIWwBVHMyaX-Ubx2HcV_jmPv0vWeY7QjH7wnnbSuvmdF3a96wV66E8_Xkkm4SJzfiy5u8pZsR7Jg1GT1YRXxBBTCjsOtcNX1pL-AlsMP3II1iJxEO0E1UYqEpwzWTj6UZeSCvlEbrTbzEdxkZ8BFHsX9mCnN-_TbKVl9lw6NXuuRBM")',
              }}
            ></div>
          </div>
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
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-primary text-white shadow-lg shadow-primary/25 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined">assignment</span>
                  <p className="text-sm font-bold">Nhiệm vụ</p>
                </div>
                <span className="bg-white/20 px-2.5 py-0.5 rounded text-xs font-bold">1</span>
              </button>
              <button
                type="button"
                onClick={() => navigate("/rescue-team/members")}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
              >
                <span className="material-symbols-outlined">groups</span>
                <p className="text-sm font-bold">Thành viên</p>
              </button>
              <button
                type="button"
                onClick={() => navigate("/rescue-team/history")}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
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
                    <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Nhiệm Vụ Hiện Tại</h2>
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                      <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase">Đang xử lý</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 font-medium">Bạn đang phụ trách 01 nhiệm vụ duy nhất.</p>
                </div>
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-black/10">
                  {loadingMissions && (
                    <p className="text-sm text-gray-500">Đang tải danh sách nhiệm vụ...</p>
                  )}

                  {!loadingMissions && missionsError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium p-3 rounded-xl mb-4">
                      {missionsError}
                    </div>
                  )}

                  {!loadingMissions && !missionsError && missions.length === 0 && (
                    <div className="mt-2 text-center px-4">
                      <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-2">my_location</span>
                      <p className="text-xs text-gray-400 font-medium italic">
                        Hiện tại chưa có nhiệm vụ nào được phân phối cho đội của bạn.
                      </p>
                    </div>
                  )}

                  {!loadingMissions && missions.length > 0 && (
                    <div className="space-y-4">
                      {missions.map((mission) => {
                        const assignmentId = mission.id || mission.assignmentId;
                        const rawStatus = mission.decision || mission.status || "PENDING";
                        const normalizedStatus =
                          rawStatus === "ACCEPT"
                            ? "ACCEPTED"
                            : rawStatus === "DECLINE"
                              ? "DECLINED"
                              : rawStatus;
                        const isPending = rawStatus === "PENDING";

                        // Ưu tiên địa chỉ đã reverse geocoding từ toạ độ
                        const locationText =
                          mission.resolvedAddress ||
                          mission.location ||
                          mission.address ||
                          mission.request?.address ||
                          mission.request?.description ||
                          (mission.request?.latitude && mission.request?.longitude
                            ? `${mission.request.latitude}, ${mission.request.longitude}`
                            : "Không có địa chỉ cụ thể");

                        return (
                          <div
                            key={assignmentId}
                            className="bg-white dark:bg-[#2d3139] border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-primary/50 transition-colors"
                          >
                            <div className="absolute -right-6 -top-6 text-gray-100 dark:text-gray-700 pointer-events-none transform rotate-12">
                              <span className="material-symbols-outlined text-[80px] opacity-30">emergency</span>
                            </div>
                            <div className="relative z-10">
                              <div className="flex justify-between items-start mb-2">
                                <span className="bg-urgency-high/10 text-urgency-high px-3 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider border border-urgency-high/20">
                                  {mission.priority || "Ưu tiên"}
                                </span>
                                <span className="text-[11px] font-bold text-gray-400">
                                  #{mission.code || assignmentId}
                                </span>
                              </div>
                              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1 leading-tight">
                                {mission.title || mission.name || mission.missionName || "Nhiệm vụ cứu hộ"}
                              </h3>
                              <p className="text-xs font-bold text-urgency-critical mb-3 flex items-center gap-1">
                                <span className="material-symbols-outlined text-base">warning</span>
                                {mission.summary || mission.description || "Nhiệm vụ mới được phân phối"}
                              </p>
                              <div className="space-y-2 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                                <div className="flex items-start gap-2">
                                  <span className="material-symbols-outlined text-primary mt-0.5 text-base">location_on</span>
                                  <div>
                                    <p className="text-[11px] font-bold text-gray-500 uppercase mb-0.5">Địa điểm</p>
                                    <p className="text-xs font-bold text-gray-900 dark:text-white leading-snug">
                                      {locationText}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500">
                                  <span className="material-symbols-outlined text-xs">schedule</span>
                                  <span>{mission.assignedAt || mission.createdAt || "Vừa được phân công"}</span>
                                </span>
                                <div className="flex gap-2">
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[11px] font-black uppercase border ${
                                      normalizedStatus === "ACCEPTED"
                                        ? "bg-green-50 border-green-500 text-green-600"
                                        : normalizedStatus === "DECLINED"
                                          ? "bg-red-50 border-red-500 text-red-600"
                                          : "bg-yellow-50 border-yellow-500 text-yellow-600"
                                    }`}
                                  >
                                    {normalizedStatus}
                                  </span>
                                </div>
                              </div>
                                    {isPending && assignmentId && (
                                <div className="mt-4 flex gap-3">
                                  <button
                                    type="button"
                                          onClick={() => handleRespondMission(assignmentId, "ACCEPT")}
                                    className="flex-1 h-9 text-xs font-black rounded-lg bg-success-green text-white flex items-center justify-center gap-1 shadow-sm hover:bg-emerald-600 transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                    CHẤP NHẬN
                                  </button>
                                  <button
                                    type="button"
                                          onClick={() => handleRespondMission(assignmentId, "DECLINE")}
                                    className="flex-1 h-9 text-xs font-black rounded-lg bg-red-50 text-red-600 border border-red-300 flex items-center justify-center gap-1 hover:bg-red-100 transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-sm">cancel</span>
                                    TỪ CHỐI
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div className="xl:col-span-8 overflow-y-auto bg-gray-50 dark:bg-black/20 h-full">
                <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
                  <div className="bg-white dark:bg-[#1c1e22] rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 flex flex-wrap items-center justify-between text-white gap-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-urgency-high p-2 rounded text-white shadow-lg">
                          <span className="material-symbols-outlined block">priority_high</span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Nhiệm vụ trọng tâm</p>
                          <h2 className="text-lg font-black leading-none">CỨU HỘ KHẨN CẤP #RE-9921</h2>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        <span className="text-sm font-bold">Cập nhật: 2 phút trước</span>
                      </div>
                    </div>
                    <div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div>
                          <p className="text-gray-500 text-xs font-bold uppercase mb-1">Nạn nhân</p>
                          <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight">Nguyễn Văn An</h2>
                          <a
                            className="inline-flex items-center gap-3 text-3xl lg:text-4xl text-primary font-black mt-2 hover:text-blue-600 transition-colors"
                            href="tel:0901234567"
                          >
                            <span className="material-symbols-outlined text-4xl filled">call</span>
                            090 123 4567
                          </a>
                        </div>
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-8 border-yellow-400 p-5 rounded-r-xl">
                          <p className="text-yellow-700 dark:text-yellow-500 text-xs font-black uppercase mb-2 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">info</span>
                            Tình trạng &amp; Ghi chú đặc biệt
                          </p>
                          <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white leading-snug">
                            Cụ ông 82 tuổi, đi lại khó khăn. <br />
                            <span className="bg-yellow-200 dark:bg-yellow-700 px-1">Đang ở tầng 2</span>, nước dâng cao tầng trệt.
                          </p>
                          <div className="mt-3 flex gap-2 flex-wrap">
                            <span className="bg-white dark:bg-gray-800 px-3 py-1 rounded border border-yellow-200 dark:border-gray-600 text-sm font-bold text-gray-700 dark:text-gray-300">
                              Cao huyết áp
                            </span>
                            <span className="bg-white dark:bg-gray-800 px-3 py-1 rounded border border-yellow-200 dark:border-gray-600 text-sm font-bold text-gray-700 dark:text-gray-300">
                              Cần cáng cứu thương
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs font-bold uppercase mb-2">Địa chỉ chính xác</p>
                          <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                            <span className="material-symbols-outlined text-red-500 mt-1 text-2xl">pin_drop</span>
                            <div>
                              <p className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                                123 Đường Lê Lợi, Phường Bến Thành, Quận 1, TP. HCM
                              </p>
                              <p className="text-sm font-medium text-gray-500 mt-1">Cách vị trí hiện tại: 1.2 km</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col h-full min-h-[400px] bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden border-2 border-white dark:border-gray-600 shadow-lg relative group">
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{
                            backgroundImage:
                              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCqsK5_7Vc18hUsLgo-3VX5DbLnuwZPf9azv3cTD2FliDfLyxFfdnrBjjWEsOLALQ4YJEpBxzs25_s3Y7-QJO951TAMsKosAyc77QSXYawg1XwcFSXjoI-mLbefxByCLxQ--UL5hB9zS7tetR6EnUki2QhIznRDFm39OTme-ajQZeJ2t-lRsUTGMI3A8wR28iescpGhCi0xvNxcopHFs5lDxbDWooKArxdxrGDyuDLiY-F2x6Rco_J6VoKvES0R-r43ymIAUyiYKZk")',
                            filter: "brightness(0.9)",
                          }}
                        ></div>
                        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
                          <div className="bg-white/90 backdrop-blur dark:bg-gray-900/90 px-3 py-2 rounded-lg shadow-md pointer-events-auto">
                            <p className="text-xs font-bold text-gray-500 uppercase">GPS Đội cứu hộ</p>
                            <div className="flex items-center gap-1 text-green-600 font-bold">
                              <span className="material-symbols-outlined text-sm">my_location</span>
                              <span>Đang cập nhật...</span>
                            </div>
                          </div>
                          <div className="bg-white/90 backdrop-blur dark:bg-gray-900/90 p-2 rounded-lg shadow-md pointer-events-auto cursor-pointer hover:bg-white dark:hover:bg-gray-800">
                            <span className="material-symbols-outlined text-gray-700 dark:text-gray-300">layers</span>
                          </div>
                        </div>
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                          <svg className="absolute w-full h-full" style={{ zIndex: 1 }}>
                            <path
                              d="M100,300 Q250,150 400,200"
                              fill="none"
                              stroke="#3b82f6"
                              strokeDasharray="10,5"
                              strokeLinecap="round"
                              strokeWidth="4"
                            ></path>
                            <circle
                              cx="100"
                              cy="300"
                              r="8"
                              fill="#3b82f6"
                              stroke="white"
                              strokeWidth="2"
                            ></circle>
                            <circle
                              className="animate-ping"
                              cx="400"
                              cy="200"
                              r="8"
                              fill="#dc2626"
                              stroke="white"
                              strokeWidth="2"
                            ></circle>
                            <circle
                              cx="400"
                              cy="200"
                              r="8"
                              fill="#dc2626"
                              stroke="white"
                              strokeWidth="2"
                            ></circle>
                          </svg>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                          <button className="w-full bg-blue-600 hover:bg-blue-500 text-white h-14 rounded-xl flex items-center justify-center gap-2 text-lg font-black shadow-xl transition-all transform active:scale-[0.98] border-2 border-blue-400/50">
                            <span className="material-symbols-outlined text-3xl">turn_right</span>
                            BẮT ĐẦU DẪN ĐƯỜNG
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 p-6 lg:p-8">
                      <h3 className="text-center text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mb-6">Tiến độ thực hiện</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <button className="group relative flex items-center justify-center gap-3 p-4 rounded-xl bg-white dark:bg-gray-700 border-2 border-transparent text-gray-400 hover:border-blue-200 hover:text-blue-500 transition-all opacity-50">
                          <span className="material-symbols-outlined text-3xl">local_shipping</span>
                          <div className="text-left">
                            <span className="block text-xs font-bold uppercase">Bước 1</span>
                            <span className="block text-lg font-black">Đang di chuyển</span>
                          </div>
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-green-500">check_circle</span>
                        </button>
                        <button className="group relative flex items-center justify-center gap-3 p-4 rounded-xl bg-white dark:bg-gray-700 border-2 border-transparent text-gray-400 hover:border-orange-200 hover:text-orange-500 transition-all opacity-50">
                          <span className="material-symbols-outlined text-3xl">where_to_vote</span>
                          <div className="text-left">
                            <span className="block text-xs font-bold uppercase">Bước 2</span>
                            <span className="block text-lg font-black">Đã đến nơi</span>
                          </div>
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-green-500">check_circle</span>
                        </button>
                        <button className="group relative flex items-center justify-center gap-3 p-4 rounded-xl bg-success-green text-white shadow-lg shadow-green-500/30 transform scale-105 ring-4 ring-green-500/20 transition-all z-10">
                          <span className="material-symbols-outlined text-3xl">task_alt</span>
                          <div className="text-left">
                            <span className="block text-xs font-bold uppercase opacity-80">Bước 3</span>
                            <span className="block text-lg font-black">Hoàn thành</span>
                          </div>
                        </button>
                      </div>
                      <div className="bg-white dark:bg-[#2d3139] border border-gray-200 dark:border-gray-600 rounded-2xl p-6 lg:p-8 animate-[fadeIn_0.5s_ease-out]" id="report-section">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                          <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg text-success-green">
                            <span className="material-symbols-outlined text-2xl">summarize</span>
                          </div>
                          <h3 className="text-xl font-black text-gray-900 dark:text-white">Báo cáo kết quả cứu hộ</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                          <div className="space-y-6">
                            <div>
                              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Số người đã cứu</label>
                              <div className="flex items-center gap-4">
                                <button className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-xl font-bold text-gray-600">
                                  -
                                </button>
                                <input
                                  className="w-20 h-12 text-center text-2xl font-bold bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-primary focus:ring-0"
                                  type="number"
                                  defaultValue={1}
                                />
                                <button className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-xl font-bold text-gray-600">
                                  +
                                </button>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Tình trạng sức khỏe</label>
                              <div className="flex gap-2">
                                <button className="flex-1 py-3 px-2 rounded-xl bg-green-50 dark:bg-green-900/20 text-success-green border-2 border-green-500 font-bold text-sm shadow-sm">
                                  Ổn định
                                </button>
                                <button className="flex-1 py-3 px-2 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-500 font-bold text-sm hover:border-yellow-400 hover:text-yellow-600">
                                  Bị thương nhẹ
                                </button>
                                <button className="flex-1 py-3 px-2 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-500 font-bold text-sm hover:border-red-500 hover:text-red-500">
                                  Nguy kịch
                                </button>
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Ghi chú nhanh</label>
                            <textarea
                              className="w-full h-32 p-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium focus:border-primary focus:ring-0 resize-none"
                              placeholder="Nhập ghi chú về tình trạng nạn nhân, vật tư tiêu hao..."
                            ></textarea>
                          </div>
                        </div>
                        <button className="w-full bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 dark:text-black text-white h-14 rounded-xl text-lg font-black shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.99]">
                          <span className="material-symbols-outlined">send</span>
                          GỬI BÁO CÁO &amp; KẾT THÚC
                        </button>
                      </div>
                    </div>
                  </div>
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

export default RescueTeamDashboard;
