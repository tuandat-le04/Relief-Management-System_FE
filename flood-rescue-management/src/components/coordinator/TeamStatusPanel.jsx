import React, { useState, useEffect, useCallback } from "react";
import rescueTeamService from "../../services/rescueTeamService";
import vehicleService from "../../services/vehicleService";
import missionService from "../../services/missionService";

// ─── Icon theo loại xe ───────────────────────────────────────────────────────
const getVehicleIcon = (type) => {
  if (!type) return "directions_car";
  const t = type.toUpperCase();
  if (t.includes("CANOE") || t.includes("XUỒNG") || t.includes("BOAT"))
    return "directions_boat";
  if (t.includes("TRUCK") || t.includes("XE TẢI")) return "local_shipping";
  if (t.includes("DRONE")) return "flight";
  if (t.includes("HELICOPTER") || t.includes("TRỰC THĂNG")) return "helicopter";
  return "directions_car";
};

// ─── Helper: lấy rescueTeamId từ mission object (thử nhiều field khác nhau) ───
const extractTeamIdFromMission = (mission) => {
  // Thử các field name backend có thể trả về
  return (
    mission.rescueTeamId ??
    mission.teamId ??
    mission.team?.id ??
    mission.teamAssignment?.rescueTeamId ??
    mission.assignedTeamId ??
    null
  );
};

// ─── TeamStatusPanel ──────────────────────────────────────────────────────────
const TeamStatusPanel = ({ isOpen, onClose }) => {
  const [teams, setTeams] = useState([]);
  const [inUseVehicles, setInUseVehicles] = useState([]);
  const [missions, setMissions] = useState([]);
  // Map: teamId → mission (được build sau khi load xong)
  const [teamMissionMap, setTeamMissionMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // ── Load data ──────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    const [teamsResult, vehiclesResult, missionsResult] = await Promise.all([
      rescueTeamService.getAllTeams(),
      vehicleService.getVehiclesByStatus("IN_USE"),
      missionService.getAllMissions(),
    ]);

    const rawTeams   = teamsResult.success    ? teamsResult.data    : [];
    const rawVehicles = vehiclesResult.success ? vehiclesResult.data : [];
    const rawMissions = missionsResult.success ? missionsResult.data : [];

    // ── Xây dựng teamMissionMap bằng 2 chiến lược ─────────────────────────
    const map = {};

    // Chiến lược 1: qua vehicle.currentTeamId + vehicle.currentMissionId (api2.md)
    rawVehicles.forEach((v) => {
      const tid = v.currentTeamId;
      const mid = v.currentMissionId;
      if (tid && mid && !map[tid]) {
        const mission = rawMissions.find((m) => m.id === mid);
        if (mission) {
          map[tid] = mission;
        }
      }
    });

    // Chiến lược 2: đọc trực tiếp rescueTeamId (hoặc field tương đương) từ mission
    rawMissions.forEach((m) => {
      const tid = extractTeamIdFromMission(m);
      if (tid && !map[tid]) {
        // Chỉ lấy mission đang active
        const activeStatuses = ["ASSIGNED", "IN_PROGRESS", "ARRIVED"];
        if (activeStatuses.includes(m.status)) {
          map[tid] = m;
        }
      }
    });

    setTeams(rawTeams);
    setInUseVehicles(rawVehicles);
    setMissions(rawMissions);
    setTeamMissionMap(map);
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, loadData]);

  // ── Cross-reference: team → vehicles ─────────────────────────────────────
  // Chiến lược A: vehicle.currentTeamId (api2.md §2)
  // Chiến lược B: vehicle.currentMissionId khớp với mission của team
  const getVehiclesForTeam = (teamId) => {
    // Ưu tiên currentTeamId (api2.md)
    const byTeamId = inUseVehicles.filter((v) => v.currentTeamId === teamId);
    if (byTeamId.length > 0) return byTeamId;

    // Fallback: tìm qua missionId của team
    const teamMission = teamMissionMap[teamId];
    if (!teamMission) return [];
    return inUseVehicles.filter((v) => v.currentMissionId === teamMission.id);
  };

  const getMissionForTeam = (teamId) => teamMissionMap[teamId] ?? null;

  // ── Kiểm tra backend có trả currentTeamId không ──────────────────────────
  const backendSupportsTeamId = inUseVehicles.some((v) => v.currentTeamId != null);

  // ── Xây dựng danh sách "nhiệm vụ đang chạy" từ vehicle → mission ─────────
  // (luôn hoạt động vì vehicle có currentMissionId)
  const activeMissionCards = inUseVehicles.reduce((acc, vehicle) => {
    const missionId = vehicle.currentMissionId;
    if (!missionId) return acc;
    if (acc.find((c) => c.missionId === missionId)) {
      // Cùng mission → gộp xe vào
      acc.find((c) => c.missionId === missionId).vehicles.push(vehicle);
    } else {
      const mission = missions.find((m) => m.id === missionId) || null;
      acc.push({ missionId, mission, vehicles: [vehicle] });
    }
    return acc;
  }, []);

  // Chia nhóm teams
  const busyTeams = teams.filter((t) => t.status === "BUSY");
  const activeTeams = teams.filter((t) => t.status === "ACTIVE");
  const inactiveTeams = teams.filter((t) => t.status === "INACTIVE");

  const formatTime = (date) => {
    if (!date) return "";
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
          onClick={onClose}
        />
      )}

      {/* Panel slide từ phải */}
      <div
        className={`fixed top-0 right-0 h-full z-50 w-[420px] max-w-[95vw] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ── Panel Header ── */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-5 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xl">
                  groups
                </span>
              </div>
              <div>
                <h2 className="text-white font-bold text-base leading-tight">
                  Theo dõi đội cứu hộ
                </h2>
                <p className="text-slate-300 text-xs mt-0.5">
                  {lastUpdated
                    ? `Cập nhật lúc ${formatTime(lastUpdated)}`
                    : "Đang tải..."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadData}
                disabled={loading}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                title="Làm mới dữ liệu"
              >
                <span
                  className={`material-symbols-outlined text-xl ${loading ? "animate-spin" : ""}`}
                >
                  refresh
                </span>
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
          </div>

          {/* Summary badges */}
          {!loading && (
            <div className="flex items-center gap-2 mt-3">
              <SummaryBadge
                count={busyTeams.length}
                label="Đang làm việc"
                color="red"
                icon="emergency"
              />
              <SummaryBadge
                count={activeTeams.length}
                label="Sẵn sàng"
                color="green"
                icon="check_circle"
              />
              <SummaryBadge
                count={inUseVehicles.length}
                label="Xe đang dùng"
                color="orange"
                icon="directions_car"
              />
            </div>
          )}
        </div>

        {/* ── Panel Body ── */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400">
              <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400" />
              <p className="text-sm">Đang tải dữ liệu...</p>
            </div>
          ) : (
            <div className="p-4 space-y-5">

              {/* ── Cảnh báo backend thiếu currentTeamId ── */}
              {!backendSupportsTeamId && inUseVehicles.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-3 flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-amber-500 text-base flex-shrink-0 mt-0.5">info</span>
                  <div>
                    <p className="text-xs font-bold text-amber-800">Backend chưa trả về liên kết Team ↔ Xe</p>
                    <p className="text-[10px] text-amber-700 mt-0.5 leading-relaxed">
                      Field <code className="bg-amber-100 px-1 rounded">currentTeamId</code> trên vehicle đang là <code className="bg-amber-100 px-1 rounded">null</code>.
                      Đội BUSY và nhiệm vụ hiển thị tách biệt đến khi backend cập nhật.
                    </p>
                  </div>
                </div>
              )}

              {/* ── Section: Nhiệm vụ & xe đang hoạt động (luôn hiển thị nếu có) ── */}
              {activeMissionCards.length > 0 && (
                <Section
                  title="Nhiệm vụ đang thực hiện"
                  count={activeMissionCards.length}
                  color="orange"
                  emptyText=""
                >
                  {activeMissionCards.map(({ missionId, mission, vehicles }) => (
                    <ActiveMissionCard
                      key={missionId}
                      missionId={missionId}
                      mission={mission}
                      vehicles={vehicles}
                    />
                  ))}
                </Section>
              )}

              {/* ── Section: Đội đang bận ── */}
              <Section
                title="Đội đang bận"
                count={busyTeams.length}
                color="red"
                emptyText="Không có đội nào đang làm nhiệm vụ"
                emptyIcon="sentiment_satisfied"
              >
                {busyTeams.map((team) => {
                  const teamVehicles = getVehiclesForTeam(team.id);
                  const mission = getMissionForTeam(team.id);
                  return (
                    <TeamCard
                      key={team.id}
                      team={team}
                      vehicles={teamVehicles}
                      mission={mission}
                      variant="busy"
                      backendSupportsTeamId={backendSupportsTeamId}
                    />
                  );
                })}
              </Section>

              {/* ── Section: Sẵn sàng ── */}
              <Section
                title="Đội sẵn sàng"
                count={activeTeams.length}
                color="green"
                emptyText="Không có đội nào đang sẵn sàng"
                emptyIcon="group_off"
              >
                {activeTeams.map((team) => (
                  <TeamCard key={team.id} team={team} vehicles={[]} mission={null} variant="active" backendSupportsTeamId={backendSupportsTeamId} />
                ))}
              </Section>

              {/* ── Section: Ngưng hoạt động (ẩn nếu không có) ── */}
              {inactiveTeams.length > 0 && (
                <Section
                  title="Ngưng hoạt động"
                  count={inactiveTeams.length}
                  color="slate"
                  emptyText=""
                >
                  {inactiveTeams.map((team) => (
                    <TeamCard key={team.id} team={team} vehicles={[]} mission={null} variant="inactive" backendSupportsTeamId={backendSupportsTeamId} />
                  ))}
                </Section>
              )}

            </div>
          )}
        </div>

        {/* ── Panel Footer ── */}
        <div className="flex-shrink-0 px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Tổng: {teams.length} đội · {inUseVehicles.length} xe đang sử dụng
          </p>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-sm ${loading ? "animate-spin" : ""}`}>
              refresh
            </span>
            Làm mới
          </button>
        </div>
      </div>
    </>
  );
};

// ─── ActiveMissionCard — hiển thị mission + xe (không cần team link) ─────────
const ActiveMissionCard = ({ missionId, mission, vehicles }) => (
  <div className="border border-orange-200 bg-orange-50/30 rounded-xl overflow-hidden">
    {/* Mission header */}
    <div className="bg-orange-50 px-3 py-2.5 border-b border-orange-200 flex items-center gap-2.5">
      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <span className="material-symbols-outlined text-orange-600 text-base">military_tech</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-bold text-sm text-slate-800">Nhiệm vụ #{missionId}</p>
          {mission?.missionType && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
              {mission.missionType === "RESCUE" ? "Cứu hộ" : mission.missionType === "RELIEF" ? "Cứu trợ" : mission.missionType}
            </span>
          )}
          {mission?.status && <MissionStatusBadge status={mission.status} />}
        </div>
        {mission?.requestId && (
          <p className="text-[10px] text-slate-500 mt-0.5">Yêu cầu #{mission.requestId}</p>
        )}
      </div>
    </div>

    {/* Vehicles */}
    <div className="px-3 py-2.5 space-y-1.5">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        {vehicles.length} phương tiện đang thực hiện
      </p>
      {vehicles.map((v) => (
        <div key={v.id} className="flex items-center gap-2.5 bg-white rounded-lg border border-purple-200 px-2.5 py-2">
          <span className="material-symbols-outlined text-purple-500 text-base flex-shrink-0">
            {getVehicleIcon(v.typeRaw || v.type)}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate">
              {v.licensePlate || v.code}
              {v.model && <span className="font-normal text-slate-500 ml-1">— {v.model}</span>}
            </p>
            <p className="text-[10px] text-slate-500">
              {v.typeRaw || v.type} · {v.capacityPerson} người
            </p>
          </div>
          <span className="flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
            Đang dùng
          </span>
        </div>
      ))}
    </div>
  </div>
);

// ─── TeamCard ─────────────────────────────────────────────────────────────────
const TeamCard = ({ team, vehicles, mission, variant, backendSupportsTeamId }) => {
  const variantConfig = {
    busy: {
      border: "border-red-200",
      bg: "bg-red-50/40",
      dot: "bg-red-500",
      dotAnim: "animate-pulse",
      badge: "bg-red-100 text-red-700",
      badgeLabel: "Đang làm việc",
      headerBg: "bg-red-50",
    },
    active: {
      border: "border-emerald-200",
      bg: "bg-emerald-50/30",
      dot: "bg-emerald-500",
      dotAnim: "",
      badge: "bg-emerald-100 text-emerald-700",
      badgeLabel: "Sẵn sàng",
      headerBg: "bg-emerald-50",
    },
    inactive: {
      border: "border-slate-200",
      bg: "bg-slate-50",
      dot: "bg-slate-400",
      dotAnim: "",
      badge: "bg-slate-100 text-slate-500",
      badgeLabel: "Ngưng HĐ",
      headerBg: "bg-slate-50",
    },
  };

  const cfg = variantConfig[variant] || variantConfig.inactive;

  return (
    <div className={`border ${cfg.border} ${cfg.bg} rounded-xl overflow-hidden`}>
      {/* Team header */}
      <div className={`${cfg.headerBg} px-3 py-2.5 flex items-center gap-2.5 border-b ${cfg.border}`}>
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center border border-slate-200">
            <span className="material-symbols-outlined text-slate-600 text-base">groups</span>
          </div>
          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 ${cfg.dot} ${cfg.dotAnim} rounded-full border-2 border-white`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-sm text-slate-800 truncate">{team.name}</p>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${cfg.badge}`}>
              {cfg.badgeLabel}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            ID #{team.id} · {team.quantity ?? "?"} thành viên
          </p>
        </div>
      </div>

      {/* Mission info — chỉ khi backend đã hỗ trợ currentTeamId */}
      {variant === "busy" && (
        <div className="px-3 py-2.5 space-y-2">
          {backendSupportsTeamId ? (
            <>
              {/* Mission chip */}
              {mission ? (
                <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 px-2.5 py-2">
                  <span className="material-symbols-outlined text-blue-500 text-sm flex-shrink-0">military_tech</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800">Nhiệm vụ #{mission.id}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[10px] text-slate-500">Yêu cầu #{mission.requestId ?? "—"}</span>
                      {mission.missionType && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          {mission.missionType === "RESCUE" ? "Cứu hộ" : mission.missionType === "RELIEF" ? "Cứu trợ" : mission.missionType}
                        </span>
                      )}
                      {mission.status && <MissionStatusBadge status={mission.status} />}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-slate-50 rounded-lg border border-slate-200 px-2.5 py-2">
                  <span className="material-symbols-outlined text-slate-400 text-sm">pending</span>
                  <p className="text-xs text-slate-500">Chưa tìm được nhiệm vụ</p>
                </div>
              )}

              {/* Vehicles */}
              {vehicles.length > 0 ? (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-0.5">Phương tiện</p>
                  {vehicles.map((v) => (
                    <VehicleRow key={v.id} vehicle={v} />
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-slate-50 rounded-lg border border-slate-200 px-2.5 py-2">
                  <span className="material-symbols-outlined text-slate-400 text-sm">no_transfer</span>
                  <p className="text-xs text-slate-500">Chưa có phương tiện được gán</p>
                </div>
              )}
            </>
          ) : (
            /* Khi backend chưa hỗ trợ currentTeamId — hiện gợi ý xem section bên trên */
            <div className="flex items-center gap-2 bg-slate-50 rounded-lg border border-slate-200 px-2.5 py-2">
              <span className="material-symbols-outlined text-slate-400 text-sm">info</span>
              <p className="text-xs text-slate-500">
                Xem chi tiết nhiệm vụ tại mục{" "}
                <span className="font-semibold text-orange-600">Nhiệm vụ đang thực hiện</span> bên trên
              </p>
            </div>
          )}
        </div>
      )}

      {/* Available team */}
      {variant === "active" && (
        <div className="px-3 py-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>
          <p className="text-xs text-slate-500">Đội đang chờ nhận nhiệm vụ mới</p>
        </div>
      )}

      {/* Inactive team */}
      {variant === "inactive" && (
        <div className="px-3 py-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-400 text-sm">pause_circle</span>
          <p className="text-xs text-slate-400">Đội tạm ngưng hoạt động</p>
        </div>
      )}
    </div>
  );
};

// ─── Section wrapper ─────────────────────────────────────────────────────────
const Section = ({ title, count, color, children, emptyText, emptyIcon }) => {
  const [collapsed, setCollapsed] = useState(false);

  const colorMap = {
    red: { badge: "bg-red-100 text-red-700", dot: "bg-red-500" },
    green: { badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
    orange: { badge: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
    slate: { badge: "bg-slate-100 text-slate-500", dot: "bg-slate-400" },
  };
  const cfg = colorMap[color] || colorMap.slate;
  const items = React.Children.toArray(children);

  return (
    <div>
      {/* Section title */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center gap-2 mb-2 group"
      >
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
        <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex-1 text-left group-hover:text-slate-800 transition-colors">
          {title}
        </span>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cfg.badge}`}>
          {count}
        </span>
        <span className={`material-symbols-outlined text-slate-400 text-sm transition-transform ${collapsed ? "-rotate-90" : ""}`}>
          expand_more
        </span>
      </button>

      {!collapsed && (
        <div className="space-y-2.5">
          {items.length > 0 ? (
            items
          ) : (
            <div className="flex flex-col items-center justify-center py-5 gap-2 text-slate-300">
              {emptyIcon && (
                <span className="material-symbols-outlined text-3xl">{emptyIcon}</span>
              )}
              <p className="text-xs text-center">{emptyText}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const SummaryBadge = ({ count, label, color, icon }) => {
  const colorMap = {
    red: "bg-red-500/20 text-red-200",
    green: "bg-emerald-500/20 text-emerald-200",
    orange: "bg-orange-500/20 text-orange-200",
  };
  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${colorMap[color]}`}>
      <span className="material-symbols-outlined text-sm">{icon}</span>
      <span className="text-xs font-bold">{count}</span>
      <span className="text-xs hidden sm:inline">{label}</span>
    </div>
  );
};

const MissionStatusBadge = ({ status }) => {
  const map = {
    ASSIGNED: "bg-blue-100 text-blue-700",
    IN_PROGRESS: "bg-orange-100 text-orange-700",
    ARRIVED: "bg-teal-100 text-teal-700",
    COMPLETED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-red-100 text-red-700",
    PENDING: "bg-slate-100 text-slate-600",
  };
  const labelMap = {
    ASSIGNED: "Đã phân công",
    IN_PROGRESS: "Đang xử lý",
    ARRIVED: "Đã đến nơi",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
    PENDING: "Chờ xử lý",
  };
  const cls = map[status] || "bg-slate-100 text-slate-500";
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${cls}`}>
      {labelMap[status] || status}
    </span>
  );
};

export default TeamStatusPanel;
