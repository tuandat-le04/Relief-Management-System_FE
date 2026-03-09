import React, { useState, useEffect } from "react";
import missionService from "../../services/missionService";
import vehicleService from "../../services/vehicleService";

const MISSION_ROLES = [
  { value: "LEAD_TEAM", label: "Đội trưởng (Lead Team)" },
  { value: "SUPPORT_TEAM", label: "Đội hỗ trợ (Support Team)" },
  { value: "MEDICAL_TEAM", label: "Đội y tế (Medical Team)" },
  { value: "LOGISTICS_TEAM", label: "Đội hậu cần (Logistics Team)" },
];

const PRIORITY_CONFIG = {
  CRITICAL: { bg: "bg-red-100", text: "text-red-700", label: "Nguy kịch" },
  HIGH: { bg: "bg-orange-100", text: "text-orange-700", label: "Ưu tiên cao" },
  MEDIUM: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Trung bình" },
  NORMAL: { bg: "bg-blue-100", text: "text-blue-700", label: "Bình thường" },
  LOW: { bg: "bg-slate-100", text: "text-slate-600", label: "Thấp" },
};

const AssignMissionModal = ({ isOpen, onClose, request, onSuccess }) => {
  // Mission
  const [mission, setMission] = useState(null);
  const [loadingMission, setLoadingMission] = useState(false);

  // Team assignment state
  const [teamId, setTeamId] = useState("");
  const [missionRole, setMissionRole] = useState("LEAD_TEAM");
  const [notes, setNotes] = useState("");
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [teamAssigned, setTeamAssigned] = useState(false);
  const [teamError, setTeamError] = useState(null);

  // Vehicle assignment state
  const [vehicleId, setVehicleId] = useState("");
  const [checkingVehicle, setCheckingVehicle] = useState(false);
  const [vehicleAvailable, setVehicleAvailable] = useState(null);
  const [loadingVehicle, setLoadingVehicle] = useState(false);
  const [vehicleAssigned, setVehicleAssigned] = useState(false);
  const [vehicleError, setVehicleError] = useState(null);

  // Danh sách xe AVAILABLE từ API
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [loadingVehicleList, setLoadingVehicleList] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null); // object từ danh sách

  // Reset & load mission khi mở modal
  useEffect(() => {
    if (isOpen && request) {
      resetState();
      loadMission();
      loadAvailableVehicles();
    }
  }, [isOpen, request]);

  const resetState = () => {
    setMission(null);
    setTeamId("");
    setMissionRole("LEAD_TEAM");
    setNotes("");
    setTeamAssigned(false);
    setTeamError(null);
    setVehicleId("");
    setVehicleAvailable(null);
    setVehicleAssigned(false);
    setVehicleError(null);
    setSelectedVehicle(null);
    setAvailableVehicles([]);
  };

  const loadMission = async () => {
    setLoadingMission(true);
    const result = await missionService.getMissionByRequestId(request.id);
    if (result.success && result.data) setMission(result.data);
    setLoadingMission(false);
  };

  // Tải danh sách xe AVAILABLE từ API
  const loadAvailableVehicles = async () => {
    setLoadingVehicleList(true);
    const result = await vehicleService.getVehiclesByStatus("AVAILABLE");
    if (result.success) {
      setAvailableVehicles(result.data);
    }
    setLoadingVehicleList(false);
  };

  // Chọn xe từ danh sách
  const handleSelectVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setVehicleId(String(vehicle.id));
    setVehicleAvailable(true);
    setVehicleError(null);
  };

  // Xác định missionId để gọi API (ưu tiên mission.id, fallback requestId)
  const getMissionId = () => mission?.id ?? request?.id;

  // Phân công đội cứu hộ
  const handleAssignTeam = async () => {
    const tid = parseInt(teamId);
    if (!tid || isNaN(tid)) {
      setTeamError("Vui lòng nhập ID đội cứu hộ hợp lệ");
      return;
    }
    const missionId = getMissionId();
    if (!missionId) {
      setTeamError("Không xác định được nhiệm vụ");
      return;
    }
    setLoadingTeam(true);
    setTeamError(null);
    const result = await missionService.assignTeam(missionId, {
      rescueTeamId: tid,
      missionRole,
      notes,
    });
    setLoadingTeam(false);
    if (result.success) {
      setTeamAssigned(true);
    } else {
      setTeamError(result.error);
    }
  };

  // Gán phương tiện
  const handleAssignVehicle = async () => {
    const vid = parseInt(vehicleId);
    if (!vid || isNaN(vid)) {
      setVehicleError("Vui lòng nhập ID xe hợp lệ");
      return;
    }
    if (vehicleAvailable === null) {
      setVehicleError("Vui lòng kiểm tra tình trạng xe trước");
      return;
    }
    if (vehicleAvailable === false) {
      setVehicleError("Phương tiện đang bận hoặc bảo trì, không thể gán");
      return;
    }
    const missionId = getMissionId();
    if (!missionId) {
      setVehicleError("Không xác định được nhiệm vụ");
      return;
    }
    setLoadingVehicle(true);
    setVehicleError(null);
    const result = await missionService.assignVehicle(missionId, vid);
    setLoadingVehicle(false);
    if (result.success) {
      setVehicleAssigned(true);
    } else {
      setVehicleError(result.error);
    }
  };

  const handleDone = () => {
    if (teamAssigned || vehicleAssigned) {
      onSuccess?.();
    }
    onClose();
  };

  if (!isOpen || !request) return null;

  const pConfig = PRIORITY_CONFIG[request.priority] || PRIORITY_CONFIG.NORMAL;
  const requestTypeLabel =
    request.requestType === "RESCUE"
      ? "Cứu hộ khẩn cấp"
      : request.requestType === "RELIEF"
        ? "Hỗ trợ cứu trợ"
        : "Khác";

  const anyAssigned = teamAssigned || vehicleAssigned;
  const allAssigned = teamAssigned && vehicleAssigned;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-white text-xl">
                  assignment_ind
                </span>
              </div>
              <div>
                <h2 className="text-white font-bold text-base">
                  Phân công nhiệm vụ
                </h2>
                <p className="text-blue-200 text-xs mt-0.5">
                  Yêu cầu #{request.id} · {requestTypeLabel}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-blue-200 hover:text-white transition-colors p-1"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* ── Request Info Banner ── */}
        <div className="px-5 py-2.5 bg-blue-50 border-b border-blue-100 flex items-center gap-2 flex-shrink-0">
          <span className="material-symbols-outlined text-blue-500 text-sm">
            person
          </span>
          <span className="text-sm text-blue-800 font-medium truncate max-w-[120px]">
            {request.name}
          </span>
          <span className="text-slate-300">·</span>
          <span className="material-symbols-outlined text-slate-400 text-sm">
            location_on
          </span>
          <span className="text-sm text-slate-600 truncate flex-1">
            {request.location}
          </span>
          <span
            className={`flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${pConfig.bg} ${pConfig.text}`}
          >
            {pConfig.label}
          </span>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Mission ID chip */}
          <div>
            {loadingMission ? (
              <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-slate-400"></span>
                Đang tra cứu nhiệm vụ...
              </div>
            ) : mission ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-400 text-base">
                  military_tech
                </span>
                <span className="text-sm text-slate-600">
                  Nhiệm vụ{" "}
                  <strong className="text-slate-800">#{mission.id}</strong>
                  {" · "}Trạng thái:{" "}
                  <span className="font-semibold text-blue-600">
                    {mission.status}
                  </span>
                </span>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-base">
                  warning
                </span>
                <span className="text-sm text-amber-700">
                  Không tìm thấy mission. Sẽ dùng request ID{" "}
                  <strong>#{request.id}</strong>.
                </span>
              </div>
            )}
          </div>

          {/* ────────────────────────────────── */}
          {/* PHẦN 1: PHÂN CÔNG ĐỘI CỨU HỘ     */}
          {/* ────────────────────────────────── */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600 text-base">
                    groups
                  </span>
                </div>
                <span className="font-bold text-slate-700 text-sm">
                  Phân công đội cứu hộ
                </span>
              </div>
              {teamAssigned && (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                  <span className="material-symbols-outlined text-sm">
                    check_circle
                  </span>
                  Đã phân công
                </span>
              )}
            </div>

            <div className="p-4 space-y-3">
              {/* Nhập ID đội */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  ID đội cứu hộ <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={teamId}
                  onChange={(e) => {
                    setTeamId(e.target.value);
                    setTeamError(null);
                  }}
                  disabled={teamAssigned}
                  placeholder="Nhập ID đội cứu hộ (VD: 3)"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

              {/* Vai trò */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  Vai trò trong nhiệm vụ
                </label>
                <select
                  value={missionRole}
                  onChange={(e) => setMissionRole(e.target.value)}
                  disabled={teamAssigned}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  {MISSION_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  Ghi chú cho đội
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={teamAssigned}
                  rows={2}
                  placeholder="VD: Ưu tiên trẻ em và người cao tuổi, mang theo xuồng cứu hộ..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                />
              </div>

              {/* Error */}
              {teamError && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">
                    error
                  </span>
                  {teamError}
                </p>
              )}

              {/* Nút phân công */}
              {!teamAssigned && (
                <button
                  onClick={handleAssignTeam}
                  disabled={loadingTeam || !teamId}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                >
                  {loadingTeam ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      Đang phân công...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">
                        groups
                      </span>
                      Phân công đội
                    </>
                  )}
                </button>
              )}

              {teamAssigned && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-500 text-base">
                    check_circle
                  </span>
                  <span className="text-sm text-emerald-700 font-medium">
                    Phân công đội cứu hộ thành công!
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ────────────────────────────────── */}
          {/* PHẦN 2: GÁN PHƯƠNG TIỆN            */}
          {/* ────────────────────────────────── */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-purple-600 text-base">
                    directions_car
                  </span>
                </div>
                <span className="font-bold text-slate-700 text-sm">
                  Gán phương tiện
                </span>
              </div>
              <div className="flex items-center gap-2">
                {!vehicleAssigned && (
                  <button
                    onClick={loadAvailableVehicles}
                    disabled={loadingVehicleList}
                    className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1 disabled:opacity-50"
                    title="Tải lại danh sách"
                  >
                    <span
                      className={`material-symbols-outlined text-sm ${loadingVehicleList ? "animate-spin" : ""}`}
                    >
                      refresh
                    </span>
                    Làm mới
                  </button>
                )}
                {vehicleAssigned && (
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                    <span className="material-symbols-outlined text-sm">
                      check_circle
                    </span>
                    Đã gán
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 space-y-3">
              {!vehicleAssigned && (
                <>
                  {/* Danh sách xe AVAILABLE */}
                  {loadingVehicleList ? (
                    <div className="flex items-center justify-center py-6 gap-2 text-slate-400 text-sm">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></span>
                      Đang tải danh sách xe...
                    </div>
                  ) : availableVehicles.length === 0 ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-3 flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500 text-base">
                        warning
                      </span>
                      <p className="text-xs text-amber-700 font-medium">
                        Hiện không có phương tiện nào sẵn sàng (AVAILABLE).
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      <p className="text-xs text-slate-500 font-semibold mb-1">
                        Chọn phương tiện ({availableVehicles.length} xe sẵn
                        sàng):
                      </p>
                      {availableVehicles.map((v) => {
                        const isSelected = selectedVehicle?.id === v.id;
                        return (
                          <button
                            key={v.id}
                            onClick={() => handleSelectVehicle(v)}
                            className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all text-sm flex items-center gap-3 ${
                              isSelected
                                ? "border-purple-400 bg-purple-50 ring-2 ring-purple-300"
                                : "border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50/40"
                            }`}
                          >
                            <span
                              className={`material-symbols-outlined text-lg flex-shrink-0 ${isSelected ? "text-purple-600" : "text-slate-400"}`}
                            >
                              directions_car
                            </span>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`font-bold truncate ${isSelected ? "text-purple-800" : "text-slate-800"}`}
                              >
                                {v.code}
                                {v.model && (
                                  <span className="ml-1 font-normal text-slate-500 text-xs">
                                    — {v.model}
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {v.typeRaw || v.type} · Sức chứa:{" "}
                                {v.capacityPerson} người
                              </p>
                            </div>
                            <span className="flex-shrink-0 text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                              Sẵn sàng
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Hiển thị xe đang chọn */}
                  {selectedVehicle && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-purple-500 text-base">
                        check_circle
                      </span>
                      <span className="text-xs text-purple-800 font-semibold">
                        Đã chọn: <strong>{selectedVehicle.code}</strong>
                        {selectedVehicle.model
                          ? ` — ${selectedVehicle.model}`
                          : ""}{" "}
                        (ID #{selectedVehicle.id})
                      </span>
                    </div>
                  )}
                </>
              )}

              {/* Error */}
              {vehicleError && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">
                    error
                  </span>
                  {vehicleError}
                </p>
              )}

              {/* Nút gán xe */}
              {!vehicleAssigned && (
                <button
                  onClick={handleAssignVehicle}
                  disabled={loadingVehicle || !selectedVehicle}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                >
                  {loadingVehicle ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      Đang gán xe...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">
                        directions_car
                      </span>
                      {selectedVehicle
                        ? `Gán xe ${selectedVehicle.code}`
                        : "Chọn xe để gán"}
                    </>
                  )}
                </button>
              )}

              {vehicleAssigned && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-500 text-base">
                    check_circle
                  </span>
                  <span className="text-sm text-emerald-700 font-medium">
                    Gán phương tiện thành công!
                    {selectedVehicle && (
                      <span className="ml-1 font-bold">
                        {selectedVehicle.code}
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Tóm tắt hoàn tất */}
          {allAssigned && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-500 text-xl">
                task_alt
              </span>
              <div>
                <p className="text-sm font-bold text-emerald-700">
                  Hoàn tất phân công nhiệm vụ!
                </p>
                <p className="text-xs text-emerald-600 mt-0.5">
                  Đội cứu hộ và phương tiện đã được gán. Đội sẽ nhận thông báo
                  để xác nhận.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            {allAssigned
              ? "✅ Hoàn tất — đội & phương tiện đã được gán"
              : teamAssigned && !vehicleAssigned
                ? "✅ Đã phân công đội · ⏳ Chưa gán phương tiện"
                : !teamAssigned && vehicleAssigned
                  ? "⏳ Chưa phân công đội · ✅ Đã gán phương tiện"
                  : "Chưa thực hiện phân công nào"}
          </p>
          <button
            onClick={handleDone}
            className={`px-5 py-2 text-sm font-bold rounded-lg transition-colors ${
              anyAssigned
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-slate-600 hover:bg-slate-700 text-white"
            }`}
          >
            {anyAssigned ? "Hoàn tất" : "Đóng"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignMissionModal;
