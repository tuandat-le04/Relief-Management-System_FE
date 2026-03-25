import React, { useState, useEffect, useMemo } from "react";
import missionService from "../../services/missionService";
import vehicleService from "../../services/vehicleService";
import rescueTeamService, {
  haversineDistance,
} from "../../services/rescueTeamService";
import {
  getWarehousesForModal,
  getInventoryForModal,
} from "../../services/warehouseService";

// ─── Config ──────────────────────────────────────────────────────────────────
const MISSION_ROLES = [
  { value: "PRIMARY", label: "Đội chính (Primary)" },
  { value: "SUPPORT", label: "Đội hỗ trợ (Support)" },
  { value: "BACKUP", label: "Đội dự phòng (Backup)" },
];

const PRIORITY_CONFIG = {
  CRITICAL: { bg: "bg-red-100", text: "text-red-700", label: "Nguy kịch" },
  HIGH: { bg: "bg-orange-100", text: "text-orange-700", label: "Ưu tiên cao" },
  MEDIUM: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Trung bình" },
  NORMAL: { bg: "bg-blue-100", text: "text-blue-700", label: "Bình thường" },
  LOW: { bg: "bg-slate-100", text: "text-slate-600", label: "Thấp" },
};

const VEHICLE_TYPE_ICON = {
  CANOE: "directions_boat",
  BOAT: "directions_boat",
  TRUCK: "local_shipping",
  VAN: "airport_shuttle",
  DRONE: "flight",
  HELICOPTER: "helicopter",
};

const getVehicleIcon = (type) => {
  if (!type) return "directions_car";
  return VEHICLE_TYPE_ICON[type.toUpperCase()] || "directions_car";
};

// ─── Component chính ─────────────────────────────────────────────────────────
// Luồng xử lý chính:
// 1) Chọn đội cứu hộ (bắt buộc)
// 2) Gán phương tiện (tùy chọn)
// 3) Gán vật tư (tùy chọn)
// Khi submit sẽ chạy tuần tự để dễ khoanh vùng lỗi theo từng bước nghiệp vụ.
const AssignMissionModal = ({ isOpen, onClose, request, onSuccess }) => {
  // ── Mission ──
  const [mission, setMission] = useState(null);
  const [loadingMission, setLoadingMission] = useState(false);

  // ── PHẦN 1: TEAM ──
  const [teams, setTeams] = useState([]);
  const [teamPositions, setTeamPositions] = useState({});
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [teamSearch, setTeamSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [missionRole, setMissionRole] = useState("PRIMARY");
  const [teamNotes, setTeamNotes] = useState("");
  const [teamAssigned, setTeamAssigned] = useState(false);
  const [loadingAssignTeam, setLoadingAssignTeam] = useState(false);
  const [teamError, setTeamError] = useState(null);

  // ── PHẦN 2: PHƯƠNG TIỆN ──
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [vehicleError, setVehicleError] = useState(null);
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleAssigned, setVehicleAssigned] = useState(false);
  const [loadingAssignVehicle, setLoadingAssignVehicle] = useState(false);

  // ── PHẦN 3: VẬT TƯ KHO ──
  const [warehouses, setWarehouses] = useState([]);
  const [warehouseSearch, setWarehouseSearch] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [warehouseError, setWarehouseError] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [inventoryError, setInventoryError] = useState(null);
  const [inventorySearch, setInventorySearch] = useState("");
  const [selectedItems, setSelectedItems] = useState({}); // { [inventoryId]: { inventoryId, itemName, stock, qty } }
  const [suppliesAssigned, setSuppliesAssigned] = useState(false);
  const [loadingAssignSupplies, setLoadingAssignSupplies] = useState(false);
  const [suppliesError, setSuppliesError] = useState(null);

  // ─── Load khi mở modal ──────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && request) {
      resetAll();
      loadMission();
      loadTeams();
      loadVehicles();
      loadWarehouses();
    }
  }, [isOpen, request]);

  const resetAll = () => {
    setMission(null);
    setTeams([]);
    setTeamPositions({});
    setTeamSearch("");
    setSelectedTeam(null);
    setMissionRole("PRIMARY");
    setTeamNotes("");
    setTeamAssigned(false);
    setTeamError(null);
    setVehicles([]);
    setVehicleError(null);
    setVehicleSearch("");
    setSelectedVehicle(null);
    setVehicleAssigned(false);
    setWarehouses([]);
    setWarehouseSearch("");
    setSelectedWarehouse(null);
    setInventory([]);
    setInventorySearch("");
    setInventoryError(null);
    setSelectedItems({});
    setSuppliesAssigned(false);
    setSuppliesError(null);
  };

  const loadMission = async () => {
    setLoadingMission(true);
    const result = await missionService.getMissionByRequestId(request.id);
    if (result.success && result.data) setMission(result.data);
    setLoadingMission(false);
  };

  // ─── Load danh sách đội ──────────────────────────────────────────────────
  const loadTeams = async () => {
    setLoadingTeams(true);
    const result = await rescueTeamService.getAvailableTeams();
    if (result.success) {
      setTeams(result.data);
      // Lấy GPS của tất cả đội song song
      const positions = await rescueTeamService.getTeamPositions(result.data);
      setTeamPositions(positions);
    }
    setLoadingTeams(false);
  };

  // ─── Load danh sách xe AVAILABLE ────────────────────────────────────────
  const loadVehicles = async () => {
    setLoadingVehicles(true);
    setVehicleError(null);
    const result = await vehicleService.getVehiclesByStatus("AVAILABLE");
    if (result.success) {
      setVehicles(result.data);
    } else {
      setVehicleError(result.error);
    }
    setLoadingVehicles(false);
  };
  // ─── Load danh sách kho ────────────────────────────────────────
  const loadWarehouses = async () => {
    setLoadingWarehouses(true);
    setWarehouseError(null);
    const result = await getWarehousesForModal();
    if (result.success) {
      setWarehouses(result.data);
    } else {
      setWarehouseError(result.error);
    }
    setLoadingWarehouses(false);
  };

  // ─── Load inventory khi chọn kho ──────────────────────────────
  const loadInventory = async (warehouseId) => {
    setLoadingInventory(true);
    setInventoryError(null);
    setInventory([]);
    setInventorySearch("");
    setSelectedItems({});
    const result = await getInventoryForModal(warehouseId);
    if (result.success) {
      setInventory(result.data);
    } else {
      setInventoryError(result.error);
    }
    setLoadingInventory(false);
  };
  // ─── Tính khoảng cách từ request đến từng đội ────────────────────────────
  const reqLat = request?.latitude ?? request?.coordinates?.[1];
  const reqLng = request?.longitude ?? request?.coordinates?.[0];

  const teamsWithDistance = useMemo(() => {
    return teams
      .map((team) => {
        const pos = teamPositions[team.id];
        const distance =
          pos && reqLat && reqLng
            ? haversineDistance(reqLat, reqLng, pos.latitude, pos.longitude)
            : null;
        return { ...team, position: pos, distance };
      })
      .sort((a, b) => {
        if (a.distance !== null && b.distance !== null)
          return a.distance - b.distance;
        if (a.distance !== null) return -1;
        if (b.distance !== null) return 1;
        return 0;
      });
  }, [teams, teamPositions, reqLat, reqLng]);

  // ─── Lọc đội theo search ─────────────────────────────────────────────────
  const filteredTeams = useMemo(() => {
    const kw = teamSearch.trim().toLowerCase();
    if (!kw) return teamsWithDistance;
    return teamsWithDistance.filter((t) => t.name?.toLowerCase().includes(kw));
  }, [teamsWithDistance, teamSearch]);
  // ─── Lọc kho theo search ──────────────────────────────────────
  const filteredWarehouses = useMemo(() => {
    const kw = warehouseSearch.trim().toLowerCase();
    if (!kw) return warehouses;
    return warehouses.filter((w) => {
      const byAddress = String(w.address || "")
        .toLowerCase()
        .includes(kw);
      const byName = String(w.name || w.warehouseName || "")
        .toLowerCase()
        .includes(kw);
      const byId = String(w.id || "").includes(kw);
      return byAddress || byName || byId;
    });
  }, [warehouses, warehouseSearch]);

  // ─── Lọc phương tiện theo search ──────────────────────────────
  const filteredVehicles = useMemo(() => {
    const kw = vehicleSearch.trim().toLowerCase();
    if (!kw) return vehicles;
    return vehicles.filter((v) => {
      const plate = String(v.licensePlate || v.code || "").toLowerCase();
      const model = String(v.model || "").toLowerCase();
      const typeRaw = String(v.typeRaw || v.type || "").toLowerCase();
      const id = String(v.id || "");
      return (
        plate.includes(kw) ||
        model.includes(kw) ||
        typeRaw.includes(kw) ||
        id.includes(kw)
      );
    });
  }, [vehicles, vehicleSearch]);

  // ─── Lọc vật tư theo search ───────────────────────────────────
  const filteredInventory = useMemo(() => {
    const kw = inventorySearch.trim().toLowerCase();
    if (!kw) return inventory;
    return inventory.filter((item) => {
      const name = String(item.itemName || "").toLowerCase();
      const type = String(item.itemType || "").toLowerCase();
      const id = String(item.inventoryId || "");
      return name.includes(kw) || type.includes(kw) || id.includes(kw);
    });
  }, [inventory, inventorySearch]);

  // ─── Item selection helpers ────────────────────────────────────
  const setItemQty = (item, qty) => {
    const parsed = parseInt(qty, 10);
    setSelectedItems((prev) => {
      if (!qty || parsed <= 0) {
        const next = { ...prev };
        delete next[item.inventoryId];
        return next;
      }
      return {
        ...prev,
        [item.inventoryId]: {
          inventoryId: item.inventoryId,
          itemName: item.itemName,
          stock: item.quantity,
          qty: Math.min(parsed, item.quantity),
        },
      };
    });
  };

  const selectedItemCount = Object.keys(selectedItems).length;
  // ─── Phân công đội ───────────────────────────────────────────────────────
  // Chỉ dùng mission.id thực sự — KHÔNG fallback sang request.id vì chúng là 2 entity khác nhau
  const getMissionId = () => mission?.id ?? null;

  const handleAssignTeam = async () => {
    if (!selectedTeam) {
      setTeamError("Vui lòng chọn một đội cứu hộ");
      return false;
    }
    const missionId = getMissionId();
    if (!missionId) {
      setTeamError("Không xác định được nhiệm vụ");
      return false;
    }
    setLoadingAssignTeam(true);
    setTeamError(null);
    const result = await missionService.assignTeam(missionId, {
      rescueTeamId: selectedTeam.id,
      missionRole,
      notes: teamNotes || undefined,
    });
    setLoadingAssignTeam(false);
    if (result.success) {
      const refreshedMission = await missionService.getMissionById(missionId);
      if (refreshedMission.success && refreshedMission.data) {
        setMission(refreshedMission.data);
      }

      setTeamAssigned(true);
      return true;
    } else {
      const msg = result.error || "";
      if (
        msg.toLowerCase().includes("busy") ||
        msg.toLowerCase().includes("bận")
      ) {
        setTeamError("Đội cứu hộ đang bận, vui lòng chọn đội khác");
      } else if (
        msg.toLowerCase().includes("inactive") ||
        msg.toLowerCase().includes("ngưng")
      ) {
        setTeamError("Đội cứu hộ đang ngưng hoạt động");
      } else if (
        msg.toLowerCase().includes("not found") ||
        msg.toLowerCase().includes("không tìm thấy")
      ) {
        setTeamError("Không tìm thấy đội cứu hộ");
      } else {
        setTeamError(msg || "Phân công đội thất bại");
      }
      return false;
    }
  };

  // ─── Gán phương tiện ─────────────────────────────────────────────────────
  const handleAssignVehicle = async () => {
    if (!selectedVehicle) return true;
    const missionId = getMissionId();
    if (!missionId) return true;
    setLoadingAssignVehicle(true);
    const result = await missionService.assignVehicle(
      missionId,
      selectedVehicle.id,
    );
    setLoadingAssignVehicle(false);
    if (result.success) {
      setVehicleAssigned(true);
      return true;
    } else {
      const msg = result.error || "";
      if (
        msg.toLowerCase().includes("in_use") ||
        msg.toLowerCase().includes("maintenance")
      ) {
        setVehicleError("Phương tiện này không khả dụng");
      } else if (msg.toLowerCase().includes("not found")) {
        setVehicleError("Không tìm thấy phương tiện");
      } else {
        setVehicleError(msg || "Gán phương tiện thất bại");
      }
      return false;
    }
  };

  // ─── Gán vật tư ─────────────────────────────────────────────────────────
  const handleAssignSupplies = async () => {
    const items = Object.values(selectedItems);
    if (items.length === 0) return true;
    const missionId = getMissionId();
    if (!missionId) return true;
    setLoadingAssignSupplies(true);
    setSuppliesError(null);
    const errors = [];
    for (const item of items) {
      const result = await missionService.assignSupplies(missionId, {
        inventoryId: item.inventoryId,
        quantity: item.qty,
      });
      if (!result.success) {
        const msg = result.error || "";
        if (
          msg.toLowerCase().includes("tồn kho") ||
          msg.toLowerCase().includes("stock") ||
          msg.toLowerCase().includes("quantity")
        ) {
          errors.push(`${item.itemName}: Không đủ tồn kho`);
        } else if (msg.toLowerCase().includes("inactive")) {
          errors.push(`${item.itemName}: Vật phẩm không hoạt động`);
        } else {
          errors.push(`${item.itemName}: ${msg || "Gán thất bại"}`);
        }
      }
    }
    setLoadingAssignSupplies(false);
    if (errors.length > 0) {
      setSuppliesError(errors.join(" | "));
      return false;
    }
    setSuppliesAssigned(true);
    return true;
  };

  // ─── Submit tổng — gọi tuần tự team → vehicle → supplies ────────────────
  // Mục tiêu: nếu bước nào fail thì dừng ngay, user biết chính xác lỗi ở đâu.
  const handleSubmit = async () => {
    if (!selectedTeam) {
      setTeamError("Vui lòng chọn đội cứu hộ trước khi xác nhận");
      return;
    }
    const teamOk = await handleAssignTeam();
    if (!teamOk) return;
    if (selectedVehicle) {
      const vehicleOk = await handleAssignVehicle();
      if (!vehicleOk) return;
    }
    if (Object.keys(selectedItems).length > 0) {
      await handleAssignSupplies();
    }
  };

  const handleDone = () => {
    if (teamAssigned) onSuccess?.();
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

  const isLoading =
    loadingAssignTeam || loadingAssignVehicle || loadingAssignSupplies;
  const isFullyDone = teamAssigned;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
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
          <span className="text-sm text-blue-800 font-medium truncate max-w-[130px]">
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

        {/* ── Body (scroll) ── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Mission chip */}
          <div>
            {loadingMission ? (
              <div className="flex items-center gap-2 text-xs text-slate-400 py-1">
                <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-slate-400" />
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
              <div className="bg-red-50 border border-red-300 rounded-xl px-4 py-2.5 flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500 text-base">
                  error
                </span>
                <span className="text-sm text-red-700">
                  Không tìm thấy nhiệm vụ cho yêu cầu này. Vui lòng thử lại hoặc
                  liên hệ Admin.
                </span>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════ */}
          {/*  PHẦN 1 — CHỌN ĐỘI CỨU HỘ (BẮT BUỘC) */}
          {/* ══════════════════════════════════════ */}
          <Section
            icon="groups"
            iconColor="blue"
            title="Chọn đội cứu hộ"
            required
            done={teamAssigned}
          >
            {teamAssigned ? (
              <SuccessBanner
                message={`Đã phân công: ${selectedTeam?.name} — ${MISSION_ROLES.find((r) => r.value === missionRole)?.label || missionRole}`}
              />
            ) : (
              <>
                {/* Search */}
                <SearchBox
                  value={teamSearch}
                  onChange={setTeamSearch}
                  placeholder="Tìm đội theo tên..."
                  onRefresh={loadTeams}
                  loading={loadingTeams}
                />

                {/* Danh sách đội */}
                {loadingTeams ? (
                  <LoadingRow
                    label="Đang tải danh sách đội cứu hộ..."
                    color="blue"
                  />
                ) : filteredTeams.length === 0 ? (
                  <EmptyRow
                    icon="group_off"
                    message={
                      teamSearch
                        ? `Không tìm thấy đội nào khớp với "${teamSearch}"`
                        : "Hiện không có đội cứu hộ nào sẵn sàng"
                    }
                  />
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {filteredTeams.map((team) => {
                      const isSelected = selectedTeam?.id === team.id;
                      return (
                        <button
                          key={team.id}
                          onClick={() => {
                            setSelectedTeam(team);
                            setTeamError(null);
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all flex items-center gap-3 ${
                            isSelected
                              ? "border-blue-400 bg-blue-50 ring-2 ring-blue-200"
                              : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40"
                          }`}
                        >
                          {/* Avatar */}
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-blue-600" : "bg-slate-100"}`}
                          >
                            <span
                              className={`material-symbols-outlined text-lg ${isSelected ? "text-white" : "text-slate-500"}`}
                            >
                              groups
                            </span>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p
                                className={`font-bold text-sm truncate ${isSelected ? "text-blue-800" : "text-slate-800"}`}
                              >
                                {team.name}
                              </p>
                              <StatusBadge status={team.status} />
                            </div>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-xs text-slate-500 flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">
                                  person
                                </span>
                                {team.quantity ?? "?"} thành viên
                              </span>
                              {team.position ? (
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-xs">
                                    location_on
                                  </span>
                                  {team.distance !== null
                                    ? `${team.distance.toFixed(1)} km`
                                    : `${team.position.latitude.toFixed(4)}, ${team.position.longitude.toFixed(4)}`}
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-xs">
                                    location_off
                                  </span>
                                  Chưa có GPS
                                </span>
                              )}
                            </div>
                          </div>

                          {isSelected && (
                            <span className="material-symbols-outlined text-blue-500 flex-shrink-0">
                              check_circle
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Đội đã chọn — preview */}
                {selectedTeam && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-500 text-base">
                      check_circle
                    </span>
                    <span className="text-xs text-blue-800 font-semibold">
                      Đã chọn: <strong>{selectedTeam.name}</strong> (ID #
                      {selectedTeam.id})
                    </span>
                  </div>
                )}

                {/* Vai trò */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                    Vai trò trong nhiệm vụ
                  </label>
                  <select
                    value={missionRole}
                    onChange={(e) => setMissionRole(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    value={teamNotes}
                    onChange={(e) => setTeamNotes(e.target.value)}
                    rows={2}
                    placeholder="VD: Ưu tiên trẻ em và người cao tuổi, mang theo xuồng cứu hộ..."
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                {teamError && <ErrorMsg message={teamError} />}
              </>
            )}
          </Section>

          {/* ══════════════════════════════════════ */}
          {/*  PHẦN 2 — GÁN PHƯƠNG TIỆN (TÙY CHỌN)  */}
          {/* ══════════════════════════════════════ */}
          <Section
            icon="directions_car"
            iconColor="purple"
            title="Gán phương tiện"
            optional
            done={vehicleAssigned}
            onRefresh={loadVehicles}
            refreshing={loadingVehicles}
          >
            {vehicleAssigned ? (
              <SuccessBanner
                color="purple"
                message={`Đã gán: ${selectedVehicle?.licensePlate || selectedVehicle?.code}${selectedVehicle?.model ? ` — ${selectedVehicle.model}` : ""}`}
              />
            ) : (
              <>
                <SearchBox
                  value={vehicleSearch}
                  onChange={setVehicleSearch}
                  placeholder="Tìm xe theo biển số, model, loại xe..."
                  onRefresh={loadVehicles}
                  loading={loadingVehicles}
                />

                {loadingVehicles ? (
                  <LoadingRow
                    label="Đang tải danh sách phương tiện..."
                    color="purple"
                  />
                ) : vehicles.length === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500 text-base">
                      no_transfer
                    </span>
                    <div>
                      <p className="text-xs text-amber-700 font-bold">
                        Hiện không có phương tiện sẵn sàng
                      </p>
                      <p className="text-xs text-amber-600 mt-0.5">
                        Tất cả xe đang bận hoặc bảo trì. Bạn có thể bỏ qua bước
                        này.
                      </p>
                    </div>
                  </div>
                ) : filteredVehicles.length === 0 ? (
                  <EmptyRow
                    icon="search_off"
                    message={`Không tìm thấy phương tiện nào khớp "${vehicleSearch}"`}
                  />
                ) : (
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    <p className="text-xs text-slate-500 font-semibold">
                      {filteredVehicles.length}/{vehicles.length} phương tiện phù
                      hợp — chọn hoặc bỏ qua:
                    </p>
                    {filteredVehicles.map((v) => {
                      const isSelected = selectedVehicle?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          onClick={() =>
                            setSelectedVehicle(isSelected ? null : v)
                          }
                          className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all flex items-center gap-3 ${
                            isSelected
                              ? "border-purple-400 bg-purple-50 ring-2 ring-purple-200"
                              : "border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50/40"
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-purple-600" : "bg-slate-100"}`}
                          >
                            <span
                              className={`material-symbols-outlined text-lg ${isSelected ? "text-white" : "text-slate-500"}`}
                            >
                              {getVehicleIcon(v.typeRaw)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`font-bold text-sm truncate ${isSelected ? "text-purple-800" : "text-slate-800"}`}
                            >
                              {v.licensePlate || v.code}
                              {v.model && (
                                <span className="ml-1 font-normal text-slate-500 text-xs">
                                  — {v.model}
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-500">
                              {v.typeRaw || v.type} · {v.capacityPerson} người
                            </p>
                          </div>
                          <span
                            className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${isSelected ? "bg-purple-600 text-white" : "bg-emerald-100 text-emerald-700"}`}
                          >
                            {isSelected ? "Đã chọn" : "Sẵn sàng"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {selectedVehicle && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-purple-500 text-base">
                        check_circle
                      </span>
                      <span className="text-xs text-purple-800 font-semibold">
                        Đã chọn:{" "}
                        <strong>
                          {selectedVehicle.licensePlate || selectedVehicle.code}
                        </strong>{" "}
                        (ID #{selectedVehicle.id})
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedVehicle(null)}
                      className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-0.5"
                    >
                      <span className="material-symbols-outlined text-sm">
                        close
                      </span>
                      Bỏ chọn
                    </button>
                  </div>
                )}

                {vehicleError && <ErrorMsg message={vehicleError} />}
              </>
            )}
          </Section>

          {/* ══════════════════════════════════════ */}
          {/*  PHẦN 3 — CHỌN VẬT TƯ KHO (TÙY CHỌN)            */}
          {/* ══════════════════════════════════════ */}
          <Section
            icon="inventory_2"
            iconColor="green"
            title="Vật tư hỗ trợ"
            optional
            done={suppliesAssigned}
            onRefresh={loadWarehouses}
            refreshing={loadingWarehouses}
          >
            {suppliesAssigned ? (
              <SuccessBanner
                color="green"
                message={`Đã gán ${Object.keys(selectedItems).length} loại vật tư`}
              />
            ) : (
              <>
                {/* Search kho */}
                <SearchBox
                  value={warehouseSearch}
                  onChange={setWarehouseSearch}
                  placeholder="Tìm kho theo địa chỉ..."
                  onRefresh={loadWarehouses}
                  loading={loadingWarehouses}
                />

                {/* Danh sách kho */}
                {loadingWarehouses ? (
                  <LoadingRow label="Đang tải danh sách kho..." color="green" />
                ) : warehouseError ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-500 text-base">
                      error
                    </span>
                    <p className="text-xs text-red-700">{warehouseError}</p>
                  </div>
                ) : filteredWarehouses.length === 0 ? (
                  <EmptyRow
                    icon="warehouse"
                    message={
                      warehouseSearch
                        ? `Không tìm thấy kho nào khớp "${warehouseSearch}"`
                        : "Hiện không có kho nào"
                    }
                  />
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    <p className="text-xs text-slate-500 font-semibold">
                      Chọn kho để xem vật tư:
                    </p>
                    {filteredWarehouses.map((w) => {
                      const isSel = selectedWarehouse?.id === w.id;
                      return (
                        <button
                          key={w.id}
                          onClick={() => {
                            if (!isSel) {
                              setSelectedWarehouse(w);
                              loadInventory(w.id);
                            } else {
                              setSelectedWarehouse(null);
                              setInventory([]);
                              setSelectedItems({});
                            }
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl border transition-all flex items-center gap-3 ${
                            isSel
                              ? "border-green-400 bg-green-50 ring-2 ring-green-200"
                              : "border-slate-200 bg-white hover:border-green-300 hover:bg-green-50/40"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isSel ? "bg-green-600" : "bg-slate-100"}`}
                          >
                            <span
                              className={`material-symbols-outlined text-base ${isSel ? "text-white" : "text-slate-500"}`}
                            >
                              warehouse
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`font-semibold text-sm truncate ${isSel ? "text-green-800" : "text-slate-800"}`}
                            >
                              Kho #{w.id}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {w.address || "Chưa có địa chỉ"}
                            </p>
                          </div>
                          {isSel && (
                            <span className="material-symbols-outlined text-green-500 text-base flex-shrink-0">
                              check_circle
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Inventory của kho đã chọn */}
                {selectedWarehouse && (
                  <div className="border border-green-200 rounded-xl overflow-hidden mt-1">
                    <div className="bg-green-50 px-3 py-2 flex items-center justify-between border-b border-green-200">
                      <span className="text-xs font-bold text-green-700">
                        Vật tư trong Kho #{selectedWarehouse.id}
                        {selectedWarehouse.address && (
                          <span className="font-normal ml-1 text-green-600">
                            — {selectedWarehouse.address}
                          </span>
                        )}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedWarehouse(null);
                          setInventory([]);
                          setSelectedItems({});
                        }}
                        className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-0.5"
                      >
                        <span className="material-symbols-outlined text-sm">
                          close
                        </span>
                        Bỏ
                      </button>
                    </div>

                    <div className="p-3 border-b border-slate-100">
                      <SearchBox
                        value={inventorySearch}
                        onChange={setInventorySearch}
                        placeholder="Tìm vật tư theo tên, loại, ID..."
                      />
                    </div>

                    {loadingInventory ? (
                      <div className="px-3 py-4">
                        <LoadingRow label="Đang tải vật tư..." color="green" />
                      </div>
                    ) : inventoryError ? (
                      <div className="p-3">
                        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2">
                          <span className="material-symbols-outlined text-red-500 text-base">
                            error
                          </span>
                          <p className="text-xs text-red-700">
                            {inventoryError}
                          </p>
                        </div>
                      </div>
                    ) : inventory.length === 0 ? (
                      <div className="p-3">
                        <EmptyRow
                          icon="inventory"
                          message="Kho này hiện không có vật tư"
                        />
                      </div>
                    ) : filteredInventory.length === 0 ? (
                      <div className="p-3">
                        <EmptyRow
                          icon="search_off"
                          message={`Không có vật tư nào khớp "${inventorySearch}"`}
                        />
                      </div>
                    ) : (
                      <div className="max-h-52 overflow-y-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                            <tr>
                              <th className="text-left px-3 py-2 font-semibold text-slate-600">
                                Tên vật tư
                              </th>
                              <th className="text-center px-2 py-2 font-semibold text-slate-600">
                                Tồn kho
                              </th>
                              <th className="text-center px-3 py-2 font-semibold text-slate-600">
                                Số lượng
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {filteredInventory.map((item) => {
                              const sel = selectedItems[item.inventoryId];
                              return (
                                <tr
                                  key={item.inventoryId}
                                  className={
                                    sel ? "bg-green-50" : "hover:bg-slate-50"
                                  }
                                >
                                  <td className="px-3 py-2">
                                    <p
                                      className={`font-medium truncate max-w-[140px] ${sel ? "text-green-800" : "text-slate-800"}`}
                                    >
                                      {item.itemName}
                                    </p>
                                  </td>
                                  <td className="px-2 py-2 text-center">
                                    <span className="text-slate-500">
                                      {item.quantity}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2">
                                    <div className="flex items-center gap-1.5 justify-center">
                                      <input
                                        type="number"
                                        min="0"
                                        max={item.quantity}
                                        value={sel?.qty ?? ""}
                                        onChange={(e) =>
                                          setItemQty(item, e.target.value)
                                        }
                                        placeholder="0"
                                        className={`w-16 border rounded px-2 py-1 text-center text-xs focus:outline-none focus:ring-2 focus:ring-green-400 ${
                                          sel
                                            ? "border-green-400 bg-green-50 text-green-800"
                                            : "border-slate-200 bg-white text-slate-700"
                                        }`}
                                      />
                                      {sel && (
                                        <button
                                          onClick={() => setItemQty(item, "0")}
                                          className="text-slate-400 hover:text-red-500"
                                          title="Xóa"
                                        >
                                          <span className="material-symbols-outlined text-sm">
                                            close
                                          </span>
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Tóm tắt đã chọn */}
                {selectedItemCount > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="material-symbols-outlined text-green-500 text-base">
                        inventory_2
                      </span>
                      <span className="text-xs text-green-800 font-semibold truncate">
                        Đã chọn:{" "}
                        {Object.values(selectedItems)
                          .map((i) => `${i.itemName} x${i.qty}`)
                          .join(", ")}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedItems({})}
                      className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-0.5 flex-shrink-0"
                    >
                      <span className="material-symbols-outlined text-sm">
                        delete
                      </span>
                      Xóa tất cả
                    </button>
                  </div>
                )}

                {suppliesError && <ErrorMsg message={suppliesError} />}
              </>
            )}
          </Section>
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          {/* Trạng thái tóm tắt */}
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            {isFullyDone ? (
              <>
                <span className="text-emerald-500 material-symbols-outlined text-sm">
                  task_alt
                </span>
                Phân công hoàn tất
              </>
            ) : !selectedTeam ? (
              <>
                <span className="text-amber-500 material-symbols-outlined text-sm">
                  info
                </span>
                Chưa chọn đội cứu hộ (bắt buộc)
              </>
            ) : (
              <>
                <span className="text-blue-500 material-symbols-outlined text-sm">
                  pending
                </span>
                <span className="truncate">
                  {selectedTeam.name}
                  {selectedVehicle
                    ? ` · ${selectedVehicle.licensePlate || selectedVehicle.code}`
                    : ""}
                  {selectedItemCount > 0
                    ? ` · ${selectedItemCount} loại vật tư`
                    : ""}
                </span>
              </>
            )}
          </p>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Hủy
            </button>

            {isFullyDone ? (
              <button
                onClick={handleDone}
                className="px-5 py-2 text-sm font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-base">
                  check_circle
                </span>
                Hoàn tất
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={
                  !selectedTeam || !mission || loadingMission || isLoading
                }
                className="px-5 py-2 text-sm font-bold rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">
                      assignment_turned_in
                    </span>
                    Xác nhận phân công
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const Section = ({
  icon,
  iconColor = "blue",
  title,
  required,
  optional,
  done,
  children,
  onRefresh,
  refreshing,
}) => {
  const colorMap = {
    blue: { bg: "bg-blue-100", text: "text-blue-600" },
    purple: { bg: "bg-purple-100", text: "text-purple-600" },
    green: { bg: "bg-green-100", text: "text-green-600" },
  };
  const c = colorMap[iconColor] || colorMap.blue;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 ${c.bg} rounded-lg flex items-center justify-center`}
          >
            <span className={`material-symbols-outlined ${c.text} text-base`}>
              {icon}
            </span>
          </div>
          <span className="font-bold text-slate-700 text-sm">{title}</span>
          {required && (
            <span className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">
              Bắt buộc
            </span>
          )}
          {optional && (
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-full">
              Tùy chọn
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onRefresh && !done && (
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 disabled:opacity-50"
              title="Làm mới"
            >
              <span
                className={`material-symbols-outlined text-sm ${refreshing ? "animate-spin" : ""}`}
              >
                refresh
              </span>
              Làm mới
            </button>
          )}
          {done && (
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
              <span className="material-symbols-outlined text-sm">
                check_circle
              </span>
              Đã hoàn thành
            </span>
          )}
        </div>
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  );
};

const SearchBox = ({ value, onChange, placeholder, onRefresh, loading }) => (
  <div className="flex gap-2">
    <div className="relative flex-1">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">
        search
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      )}
    </div>
    {onRefresh && (
      <button
        onClick={onRefresh}
        disabled={loading}
        className="flex items-center gap-1 px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
        title="Làm mới danh sách"
      >
        <span
          className={`material-symbols-outlined text-sm ${loading ? "animate-spin" : ""}`}
        >
          refresh
        </span>
      </button>
    )}
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    ACTIVE: "bg-emerald-100 text-emerald-700",
    BUSY: "bg-orange-100 text-orange-700",
    INACTIVE: "bg-slate-100 text-slate-500",
  };
  const cls = map[status] || "bg-slate-100 text-slate-500";
  const label =
    status === "ACTIVE"
      ? "Sẵn sàng"
      : status === "BUSY"
        ? "Đang bận"
        : "Ngưng HĐ";
  return (
    <span
      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${cls}`}
    >
      {label}
    </span>
  );
};

const LoadingRow = ({ label, color = "blue" }) => (
  <div className="flex items-center justify-center py-6 gap-2 text-slate-400 text-sm">
    <span
      className={`animate-spin rounded-full h-4 w-4 border-b-2 border-${color}-500`}
    />
    {label}
  </div>
);

const EmptyRow = ({ icon, message }) => (
  <div className="flex flex-col items-center justify-center py-6 gap-2 text-slate-400">
    <span className="material-symbols-outlined text-3xl">{icon}</span>
    <p className="text-sm text-center">{message}</p>
  </div>
);

const SuccessBanner = ({ message, color = "emerald" }) => {
  const colorMap = {
    emerald:
      "bg-emerald-50 border-emerald-200 text-emerald-500 text-emerald-700",
    purple: "bg-purple-50 border-purple-200 text-purple-500 text-purple-700",
    green: "bg-green-50 border-green-200 text-green-500 text-green-700",
  };
  const [bg, border, iconColor, textColor] =
    colorMap[color]?.split(" ") || colorMap.emerald.split(" ");
  return (
    <div
      className={`${bg} border ${border} rounded-lg px-3 py-2.5 flex items-center gap-2`}
    >
      <span className={`material-symbols-outlined ${iconColor} text-base`}>
        check_circle
      </span>
      <span className={`text-sm ${textColor} font-medium`}>{message}</span>
    </div>
  );
};

const ErrorMsg = ({ message }) => (
  <p className="text-xs text-red-600 flex items-center gap-1">
    <span className="material-symbols-outlined text-sm">error</span>
    {message}
  </p>
);

export default AssignMissionModal;
