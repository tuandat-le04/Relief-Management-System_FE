import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/manager/Sidebar";
import Notification from "../../components/manager/Notification";
import rescueTeamService from "../../services/rescueTeamService";
import notificationService from "../../services/notificationService";
import { usePermission } from "../../hooks/usePermission";
import { Role } from "../../constants/roles";
import {
  Group as GroupIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Work as WorkIcon,
  PauseCircle as PauseCircleIcon,
  Lock as LockIcon,
} from "@mui/icons-material";

const normalizeTeamStatus = (rawStatus) => {
  const status = String(rawStatus || "").toUpperCase();
  if (status === "ACTIVE") return "ACTIVE";
  if (status === "BUSY") return "BUSY";
  return "INACTIVE";
};

const getStatusBadge = (status) => {
  const normalized = normalizeTeamStatus(status);
  if (normalized === "ACTIVE") {
    return {
      label: "Sẵn sàng",
      className: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600/20",
    };
  }
  if (normalized === "BUSY") {
    return {
      label: "Đang làm nhiệm vụ",
      className: "bg-amber-100 text-amber-700 ring-1 ring-amber-600/20",
    };
  }
  return {
    label: "Tạm ngưng",
    className: "bg-slate-100 text-slate-700 ring-1 ring-slate-600/20",
  };
};

const formatCoordinates = (latitude, longitude) => {
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return "Chưa cập nhật";
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
};

const mapTeam = (team) => ({
  id: team.id,
  name: team.name || team.teamName || team.rescueTeamName || `Đội #${team.id}`,
  leader:
    team.leaderName || team.teamLeader || team.captainName || "Chưa cập nhật",
  members: Number(team.quantity ?? team.teamSize ?? team.memberCount ?? 0) || 0,
  status: normalizeTeamStatus(team.status),
  warehouseId: team.warehouseId ?? null,
  latitude: team.latitude,
  longitude: team.longitude,
  phone: team.phone || team.contactPhone || team.leaderPhone || "N/A",
  zone: team.zone || team.area || team.region || "Đang cập nhật",
});

export default function ManagerTeamManagement() {
  const navigate = useNavigate();
  const { hasRole, userRole, isAuthenticated } = usePermission();

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!hasRole([Role.MANAGER, Role.ADMIN])) {
      navigate("/unauthorized");
    }
  }, [isAuthenticated, hasRole, navigate]);

  const loadTeamData = async () => {
    setLoading(true);
    setError("");

    try {
      const [teamsRes, availableTeamsRes, unreadRes] = await Promise.all([
        rescueTeamService.getAllTeams(),
        rescueTeamService.getAvailableTeams(),
        notificationService.getUnreadNotifications(),
      ]);

      if (!teamsRes.success) {
        throw new Error(teamsRes.error || "Không thể tải danh sách đội");
      }

      const mappedTeams = (teamsRes.data || []).map(mapTeam);
      setTeams(mappedTeams);

      const activeCount = mappedTeams.filter(
        (t) => t.status === "ACTIVE",
      ).length;
      const busyCount = mappedTeams.filter((t) => t.status === "BUSY").length;
      const inactiveCount = mappedTeams.filter(
        (t) => t.status === "INACTIVE",
      ).length;
      const availableCount = availableTeamsRes.success
        ? (availableTeamsRes.data || []).length
        : activeCount;

      const unread = unreadRes.success
        ? Array.isArray(unreadRes.data)
          ? unreadRes.data.length
          : Number(unreadRes.data || 0)
        : 0;
      setUnreadCount(unread);

      const nextAlerts = [];
      if (busyCount > 0) {
        nextAlerts.push({
          id: "busy-team",
          type: "info",
          title: "Đội đang hoạt động",
          message: `Hiện có ${busyCount} đội đang thực hiện nhiệm vụ.`,
          time: "Vừa xong",
        });
      }
      if (inactiveCount > 0) {
        nextAlerts.push({
          id: "inactive-team",
          type: "warning",
          title: "Đội tạm ngưng",
          message: `Có ${inactiveCount} đội đang ở trạng thái tạm ngưng.`,
          time: "Vừa xong",
        });
      }
      if (availableCount > 0) {
        nextAlerts.push({
          id: "available-team",
          type: "success",
          title: "Đội sẵn sàng",
          message: `Sẵn sàng điều phối ngay: ${availableCount} đội.`,
          time: "Vừa xong",
        });
      }
      if (unread > 0) {
        nextAlerts.push({
          id: "unread-notification",
          type: "critical",
          title: "Thông báo chưa đọc",
          message: `Bạn có ${unread} thông báo cần xử lý.`,
          time: "Vừa xong",
        });
      }

      if (nextAlerts.length === 0) {
        nextAlerts.push({
          id: "stable",
          type: "info",
          title: "Hệ thống ổn định",
          message: "Chưa có cảnh báo mới cho đội cứu hộ.",
          time: "Vừa xong",
        });
      }

      setAlerts(nextAlerts);
    } catch (e) {
      setError(e.message || "Không thể tải dữ liệu đội cứu hộ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeamData();
  }, []);

  const filteredTeams = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return teams
      .filter((team) => {
        const matchStatus =
          statusFilter === "ALL" || team.status === statusFilter;
        const matchSearch =
          !keyword ||
          team.name.toLowerCase().includes(keyword) ||
          team.leader.toLowerCase().includes(keyword) ||
          String(team.warehouseId ?? "").includes(keyword) ||
          team.zone.toLowerCase().includes(keyword);

        return matchStatus && matchSearch;
      })
      .sort((a, b) =>
        a.name.localeCompare(b.name, "vi", { sensitivity: "base" }),
      );
  }, [teams, search, statusFilter]);

  const stats = useMemo(() => {
    const total = teams.length;
    const active = teams.filter((t) => t.status === "ACTIVE").length;
    const busy = teams.filter((t) => t.status === "BUSY").length;
    const inactive = teams.filter((t) => t.status === "INACTIVE").length;

    return { total, active, busy, inactive };
  }, [teams]);

  if (!isAuthenticated || !hasRole([Role.MANAGER, Role.ADMIN])) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-slate-200 max-w-md">
          <LockIcon sx={{ fontSize: 48 }} className="text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Không có quyền truy cập
          </h2>
          <p className="text-slate-600 mb-4">
            Bạn không có quyền truy cập vào trang này.
          </p>
          <p className="text-sm text-slate-500 mb-4">
            Vai trò của bạn: {userRole || "Chưa xác định"}
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/30 to-indigo-50/30 flex">
      <Sidebar />

      <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <section className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-sky-700 uppercase tracking-wide mb-1">
                Manager
              </p>
              <h1 className="text-3xl font-bold text-slate-900">
                Quản lý đội nhóm
              </h1>
              <p className="text-slate-600 mt-2">
                Theo dõi trạng thái, nhân sự và thông tin liên lạc của các đội
                cứu hộ.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsNotificationOpen(true)}
                className="relative px-4 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
              >
                <NotificationsIcon
                  sx={{ fontSize: 22 }}
                  className="text-slate-700"
                />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs font-bold rounded-full bg-red-500 text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={loadTeamData}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white font-semibold transition-colors"
              >
                <RefreshIcon
                  sx={{ fontSize: 20 }}
                  className={loading ? "animate-spin" : ""}
                />
                {loading ? "Đang tải" : "Làm mới"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
            <StatCard
              icon={<GroupIcon sx={{ fontSize: 22 }} />}
              label="Tổng số đội"
              value={stats.total}
              color="sky"
            />
            <StatCard
              icon={<CheckCircleIcon sx={{ fontSize: 22 }} />}
              label="Đội sẵn sàng"
              value={stats.active}
              color="emerald"
            />
            <StatCard
              icon={<WorkIcon sx={{ fontSize: 22 }} />}
              label="Đang làm nhiệm vụ"
              value={stats.busy}
              color="amber"
            />
            <StatCard
              icon={<PauseCircleIcon sx={{ fontSize: 22 }} />}
              label="Tạm ngưng"
              value={stats.inactive}
              color="slate"
            />
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="md:col-span-2 relative">
              <SearchIcon
                sx={{ fontSize: 19 }}
                className="text-slate-400 absolute top-1/2 -translate-y-1/2 left-3"
              />
              <input
                type="text"
                placeholder="Tìm theo tên đội, đội trưởng hoặc mã kho..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
              />
            </label>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/30"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Sẵn sàng</option>
              <option value="BUSY">Đang làm nhiệm vụ</option>
              <option value="INACTIVE">Tạm ngưng</option>
            </select>
          </div>

          {error && (
            <div className="mt-5 px-4 py-3 rounded-xl bg-red-50 text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead className="bg-slate-100 text-slate-700 text-sm">
                  <tr>
                    <th className="text-left px-5 py-4 font-semibold">
                      Tên đội
                    </th>
                    <th className="text-left px-5 py-4 font-semibold">
                      Đội trưởng
                    </th>
                    <th className="text-left px-5 py-4 font-semibold">
                      Thành viên
                    </th>
                    <th className="text-left px-5 py-4 font-semibold">
                      Kho phụ trách
                    </th>
                    <th className="text-left px-5 py-4 font-semibold">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-10 text-center text-slate-500"
                      >
                        Đang tải dữ liệu đội cứu hộ...
                      </td>
                    </tr>
                  )}

                  {!loading && filteredTeams.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-10 text-center text-slate-500"
                      >
                        Không có đội nào phù hợp với bộ lọc hiện tại.
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    filteredTeams.map((team) => {
                      const badge = getStatusBadge(team.status);
                      return (
                        <tr
                          key={team.id}
                          className="border-t border-slate-100 hover:bg-slate-50/80"
                        >
                          <td className="px-5 py-4 font-semibold text-slate-900">
                            {team.name}
                          </td>
                          <td className="px-5 py-4 text-slate-700">
                            {team.leader}
                          </td>
                          <td className="px-5 py-4 text-slate-700">
                            {team.members}
                          </td>
                          <td className="px-5 py-4 text-slate-700">
                            {team.warehouseId !== null &&
                            team.warehouseId !== undefined
                              ? `Kho #${team.warehouseId}`
                              : "Chưa gán"}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${badge.className}`}
                            >
                              {badge.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      <Notification
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        alerts={alerts}
      />
    </div>
  );
}

function StatCard({ icon, label, value, color = "sky" }) {
  const colorStyles = {
    sky: "bg-sky-100 text-sky-700",
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 p-4 bg-white">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600 font-medium">{label}</p>
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorStyles[color]}`}
        >
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900 mt-3">
        {value.toLocaleString("vi-VN")}
      </p>
    </div>
  );
}
