import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/manager/Sidebar";
import Notification from "../../components/manager/Notification";
import reportService from "../../services/reportService";
import vehicleService from "../../services/vehicleService";
import rescueTeamService from "../../services/rescueTeamService";
import notificationService from "../../services/notificationService";
import {
  getAllWarehouses,
  getWarehouseInventory,
} from "../../services/warehouseService";
import { usePermission } from "../../hooks/usePermission";
import { Permission } from "../../constants/permissions";
import { Role } from "../../constants/roles";
import {
  Warning as WarningIcon,
  LocalShipping as VehicleIcon,
  Group as GroupIcon,
  Inventory2 as BoxIcon,
  Favorite as HeartIcon,
  DirectionsBoat as ShipIcon,
  Refresh as SyncIcon,
  ChevronRight,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MoreVert as MoreIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Notifications as NotificationsIcon,
  Add as AddIcon,
  Emergency as EmergencyIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorOutlineIcon,
  Lock as LockIcon,
} from "@mui/icons-material";

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const toPercent = (part, total) => {
  if (!total) return 0;
  return Math.round((toNumber(part) / toNumber(total)) * 100);
};

const mapVehicleTypeLabel = (typeRaw) => {
  const type = String(typeRaw || "").toLowerCase();
  if (type.includes("cano") || type.includes("boat")) return "Cano";
  if (
    type.includes("truck") ||
    type.includes("xetai") ||
    type.includes("van")
  ) {
    return "Xe tải";
  }
  return "Phương tiện";
};

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { hasPermission, hasRole, userRole, isAuthenticated } = usePermission();

  // Kiểm tra quyền truy cập - chỉ Manager và Admin mới được truy cập
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!hasRole([Role.MANAGER, Role.ADMIN])) {
      navigate("/unauthorized");
      return;
    }
  }, [isAuthenticated, hasRole, navigate]);

  // Kiểm tra các quyền cụ thể cho Manager
  const canManageVehicles = hasPermission(Permission.MANAGE_VEHICLES);
  const canManageInventory = hasPermission(Permission.MANAGE_INVENTORY);
  const canViewReports = hasPermission(Permission.VIEW_RESOURCE_REPORTS);

  const [selectedTimeframe, setSelectedTimeframe] = useState("today");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Loading state khi đang kiểm tra quyền
  if (!isAuthenticated || !hasRole([Role.MANAGER, Role.ADMIN])) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl border border-slate-200">
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

  const [alerts, setAlerts] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const loadDashboardData = async () => {
    setDashboardLoading(true);
    setDashboardError("");

    try {
      const [
        summaryRes,
        vehicleRes,
        teamsRes,
        availableTeamsRes,
        warehousesRes,
        unreadRes,
      ] = await Promise.all([
        reportService.getDashboardSummary(),
        canManageVehicles
          ? vehicleService.getAllVehicles()
          : Promise.resolve({ success: true, data: [] }),
        rescueTeamService.getAllTeams(),
        rescueTeamService.getAvailableTeams(),
        canManageInventory
          ? getAllWarehouses()
          : Promise.resolve({ success: true, data: [] }),
        notificationService.getUnreadCount(),
      ]);

      const summary = summaryRes.success ? summaryRes.data || {} : {};
      const summaryVehicles = summary?.vehicles || {};
      const summaryMissions = summary?.missions || {};
      const summaryRequests = summary?.requests || {};
      const summaryImpact = summary?.impact || {};

      setUnreadCount(unreadRes.success ? toNumber(unreadRes.data) : 0);

      const vehicleList = vehicleRes.success ? vehicleRes.data || [] : [];
      const uiVehicles = vehicleList.map((v) => ({
        id: v.id,
        name: v.name || v.licensePlate || `Phương tiện #${v.id}`,
        type: mapVehicleTypeLabel(v.typeRaw || v.type),
        status: (() => {
          const raw = String(v.statusRaw || "").toUpperCase();
          if (raw === "AVAILABLE" || v.status === "ready") return "ready";
          if (raw === "IN_USE" || v.status === "active") return "active";
          if (raw === "MAINTENANCE" || v.status === "maintenance") {
            return "maintenance";
          }
          return "inactive";
        })(),
        driver: v.driver || "Chưa có lái xe",
        lastUpdate: v.lastUpdate || "Vừa xong",
      }));
      setVehicles(uiVehicles);

      const warehouseList = warehousesRes.success
        ? warehousesRes.data || []
        : [];
      const inventoryPerWarehouse = await Promise.all(
        warehouseList.map(async (w) => {
          try {
            const invRes = await getWarehouseInventory(w.id);
            return {
              warehouse: w,
              items: invRes?.success ? invRes?.data?.items || [] : [],
            };
          } catch (error) {
            return { warehouse: w, items: [] };
          }
        }),
      );

      const flattenedInventory = inventoryPerWarehouse
        .flatMap(({ warehouse, items }) =>
          items.map((item) => ({
            id: `${warehouse.id}-${item.itemId}`,
            name: item.itemName || `Item #${item.itemId}`,
            quantity: toNumber(item.quantity),
            unit: item.unit || "đơn vị",
            status:
              toNumber(item.quantity) < 50
                ? "critical"
                : toNumber(item.quantity) < 100
                  ? "warning"
                  : "good",
            category: item.itemType || "Nhu yếu phẩm",
            warehouse:
              warehouse.name ||
              warehouse.warehouseName ||
              `Kho #${warehouse.id}`,
            restock:
              toNumber(item.quantity) < 50
                ? "Khẩn cấp"
                : toNumber(item.quantity) < 100
                  ? "Trong 3 ngày"
                  : "Không cần",
          })),
        )
        .sort((a, b) => a.quantity - b.quantity)
        .slice(0, 12);

      setInventory(flattenedInventory);

      const lowStockCount = flattenedInventory.filter(
        (item) => item.status === "critical" || item.status === "warning",
      ).length;

      const activeMissions =
        toNumber(summaryMissions.ASSIGNED) +
        toNumber(summaryMissions.IN_PROGRESS);
      const completedMissions = toNumber(summaryMissions.COMPLETED);
      const requestTotal = toNumber(summaryRequests.total);
      const requestCompleted = toNumber(summaryRequests.COMPLETED);

      const teams = teamsRes.success ? teamsRes.data || [] : [];
      const teamTotal = teams.length;
      const teamAvailableCount = availableTeamsRes.success
        ? (availableTeamsRes.data || []).length
        : 0;
      const teamActive = teams.filter((t) => {
        const s = String(t.status || "").toUpperCase();
        return s === "ACTIVE" || s === "BUSY";
      }).length;

      const vehicleTotal = toNumber(summaryVehicles.total);
      const vehicleAvailable = toNumber(summaryVehicles.AVAILABLE);
      const vehicleInUse = toNumber(summaryVehicles.IN_USE);
      const vehicleReadiness = toPercent(vehicleAvailable, vehicleTotal);

      const totalInventoryQty = flattenedInventory.reduce(
        (sum, item) => sum + toNumber(item.quantity),
        0,
      );

      setStats([
        {
          title: "Phương Tiện",
          value: `${vehicleTotal.toLocaleString("vi-VN")}`,
          subtitle: `${vehicleAvailable} sẵn sàng / ${vehicleInUse} đang dùng`,
          trend: vehicleReadiness >= 70 ? "up" : "down",
          percentage: `${vehicleReadiness}% sẵn sàng`,
          icon: <VehicleIcon sx={{ fontSize: 28 }} />,
          iconBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
          chartData: [
            vehicleAvailable,
            vehicleInUse,
            Math.max(0, vehicleTotal - vehicleAvailable - vehicleInUse),
            vehicleTotal,
          ],
        },
        {
          title: "Đội Cứu Hộ",
          value: `${teamTotal.toLocaleString("vi-VN")}`,
          subtitle: `${teamAvailableCount} đội sẵn sàng`,
          trend: activeMissions > 0 ? "up" : "down",
          percentage: `${teamActive} đội đang hoạt động`,
          icon: <GroupIcon sx={{ fontSize: 28 }} />,
          iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
          chartData: [
            teamAvailableCount,
            teamActive,
            Math.max(0, teamTotal - teamActive),
            teamTotal,
          ],
        },
        {
          title: "Vật Tư Thiết Yếu",
          value: `${totalInventoryQty.toLocaleString("vi-VN")}`,
          subtitle: `${flattenedInventory.length} mặt hàng ưu tiên`,
          trend: lowStockCount > 0 ? "down" : "up",
          percentage:
            lowStockCount > 0
              ? `${lowStockCount} mặt hàng cần nhập thêm`
              : "Ổn định",
          icon: <BoxIcon sx={{ fontSize: 28 }} />,
          iconBg: "bg-gradient-to-br from-violet-500 to-purple-700",
          chartData: [
            Math.max(totalInventoryQty - 200, 0),
            Math.max(totalInventoryQty - 120, 0),
            Math.max(totalInventoryQty - 40, 0),
            totalInventoryQty,
          ],
        },
        {
          title: "Người Được Cứu",
          value: `${toNumber(summaryImpact.totalPeopleRescued).toLocaleString("vi-VN")}`,
          subtitle: `${requestCompleted}/${requestTotal} yêu cầu đã xử lý`,
          trend: toNumber(summaryImpact.totalPeopleRescued) > 0 ? "up" : "down",
          percentage: `${toNumber(summaryMissions.CANCELLED)} nhiệm vụ hủy`,
          icon: <HeartIcon sx={{ fontSize: 28 }} />,
          iconBg: "bg-gradient-to-br from-rose-500 to-pink-700",
          chartData: [
            Math.max(toNumber(summaryImpact.totalPeopleRescued) - 30, 0),
            Math.max(toNumber(summaryImpact.totalPeopleRescued) - 20, 0),
            Math.max(toNumber(summaryImpact.totalPeopleRescued) - 10, 0),
            toNumber(summaryImpact.totalPeopleRescued),
          ],
        },
      ]);

      const newAlerts = [];

      if (vehicleTotal > 0 && vehicleReadiness < 50) {
        newAlerts.push({
          id: "a-vehicle-readiness",
          type: "critical",
          title: "Phương tiện sẵn sàng thấp",
          message: `Hiện chỉ ${vehicleReadiness}% phương tiện đang sẵn sàng cho điều phối.`,
          time: "Vừa xong",
        });
      }

      if (lowStockCount > 0) {
        newAlerts.push({
          id: "a-inventory-low",
          type: "warning",
          title: "Cảnh báo tồn kho",
          message: `Có ${lowStockCount} mặt hàng dưới ngưỡng an toàn, cần bổ sung sớm.`,
          time: "Vừa xong",
        });
      }

      if (completedMissions > 0) {
        newAlerts.push({
          id: "a-mission-completed",
          type: "success",
          title: "Nhiệm vụ đã hoàn thành",
          message: `Đã hoàn thành ${completedMissions} nhiệm vụ trong đợt theo dõi hiện tại.`,
          time: "Vừa xong",
        });
      }

      if (toNumber(unreadRes?.data) > 0) {
        newAlerts.push({
          id: "a-notifications-unread",
          type: "info",
          title: "Có thông báo chưa đọc",
          message: `Bạn có ${toNumber(unreadRes.data)} thông báo chưa đọc cần kiểm tra.`,
          time: "Vừa xong",
        });
      }

      if (newAlerts.length === 0) {
        newAlerts.push({
          id: "a-default",
          type: "info",
          title: "Hệ thống ổn định",
          message:
            "Chưa có cảnh báo nghiêm trọng trong chu kỳ đồng bộ gần nhất.",
          time: "Vừa xong",
        });
      }

      setAlerts(newAlerts);
    } catch (error) {
      console.error("Không thể tải dữ liệu dashboard manager:", error);
      setDashboardError(
        "Không thể tải dữ liệu thật cho Dashboard. Vui lòng thử lại.",
      );
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedTimeframe]);

  const getVehicleStatusBadge = (status) => {
    const styles = {
      ready: "bg-cyan-100 text-cyan-700 ring-1 ring-cyan-600/20",
      active: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600/20",
      inactive: "bg-slate-100 text-slate-700 ring-1 ring-slate-600/20",
      maintenance: "bg-amber-100 text-amber-700 ring-1 ring-amber-600/20",
    };
    const labels = {
      ready: "Sẵn sàng",
      active: "Hoạt động",
      inactive: "Không hoạt động",
      maintenance: "Bảo trì",
    };
    return {
      style: styles[status] || styles.inactive,
      label: labels[status] || status,
    };
  };

  const getInventoryStatusBadge = (status) => {
    const styles = {
      good: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-600/20",
      warning: "bg-amber-100 text-amber-700 ring-1 ring-amber-600/20",
      critical: "bg-red-100 text-red-700 ring-1 ring-red-600/20",
    };
    const labels = {
      good: "Tốt",
      warning: "Cảnh báo",
      critical: "Nguy cấp",
    };
    return {
      style: styles[status] || styles.good,
      label: labels[status] || status,
    };
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-[1800px] mx-auto">
          {/* Modern Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500 font-medium">Manager</span>
                  <ChevronRight
                    sx={{ fontSize: 16 }}
                    className="text-slate-400"
                  />
                  <span className="text-slate-900 font-semibold">
                    Dashboard
                  </span>
                </div>
                <h1 className="text-5xl font-bold text-slate-900 tracking-tight">
                  Tổng Quan Chiến Lược
                </h1>
                <p className="text-slate-600 text-base">
                  Quản lý hoạt động cứu trợ và phân bổ nguồn lực theo thời gian
                  thực •
                  <span className="text-slate-900 font-semibold ml-1">
                    {new Date().toLocaleDateString("vi-VN", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Time selector */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl">
                  {["today", "week", "month"].map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTimeframe(time)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        selectedTimeframe === time
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {time === "today"
                        ? "Hôm nay"
                        : time === "week"
                          ? "Tuần này"
                          : "Tháng này"}
                    </button>
                  ))}
                </div>

                {/* Notifications */}
                <button
                  onClick={() => setIsNotificationOpen(true)}
                  className="relative p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl transition-all duration-300 shadow-sm group"
                >
                  <NotificationsIcon
                    sx={{ fontSize: 22 }}
                    className="text-slate-700 group-hover:scale-110 transition-transform"
                  />
                  {unreadCount > 0 && (
                    <>
                      <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    </>
                  )}
                </button>

                {/* Live status */}
                <div className="flex items-center gap-2.5 px-5 py-3 bg-white border border-emerald-200 rounded-2xl shadow-sm shadow-emerald-100">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-sm font-semibold text-emerald-700">
                    Trực tiếp
                  </span>
                </div>

                {/* Refresh button */}
                <button
                  onClick={loadDashboardData}
                  disabled={dashboardLoading}
                  className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 font-semibold group"
                >
                  <SyncIcon
                    sx={{ fontSize: 20 }}
                    className={`${dashboardLoading ? "animate-spin" : "group-hover:rotate-180"} transition-transform duration-700`}
                  />
                  <span>{dashboardLoading ? "Đang tải..." : "Làm mới"}</span>
                </button>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full border-2 border-white shadow-md flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-blue-400 transition-all"
                  >
                    <span className="text-white font-bold text-sm">MN</span>
                  </button>

                  {/* Dropdown Menu */}
                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-20">
                        <div className="px-4 py-3 border-b border-slate-200">
                          <p className="text-sm font-bold text-slate-900">
                            Manager
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            manager@reliefmanagement.vn
                          </p>
                        </div>

                        <div className="py-2">
                          <a
                            href="#"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <span className="text-slate-500">👤</span>
                            Hồ sơ cá nhân
                          </a>
                          <a
                            href="#"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <span className="text-slate-500">⚙️</span>
                            Cài đặt
                          </a>
                          <a
                            href="#"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            <span className="text-slate-500">❓</span>
                            Trợ giúp
                          </a>
                        </div>

                        <div className="border-t border-slate-200 pt-2">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full font-semibold"
                          >
                            <span className="text-red-500">🚪</span>
                            Đăng xuất
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {dashboardError && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between gap-3">
              <span>{dashboardError}</span>
              <button
                onClick={loadDashboardData}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Modern Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl border border-slate-200/60 hover:border-slate-300/60 transition-all duration-500 overflow-hidden"
              >
                {/* Background gradient effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`p-3.5 rounded-2xl ${stat.iconBg} shadow-lg shadow-black/10 text-white transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
                    >
                      {stat.icon}
                    </div>
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${
                        stat.trend === "up"
                          ? "bg-emerald-50 border border-emerald-200"
                          : "bg-red-50 border border-red-200"
                      }`}
                    >
                      {stat.trend === "up" ? (
                        <TrendingUpIcon
                          sx={{ fontSize: 14 }}
                          className="text-emerald-600"
                        />
                      ) : (
                        <TrendingDownIcon
                          sx={{ fontSize: 14 }}
                          className="text-red-600"
                        />
                      )}
                      <span
                        className={`text-xs font-bold ${
                          stat.trend === "up"
                            ? "text-emerald-700"
                            : "text-red-700"
                        }`}
                      >
                        {stat.percentage}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 mb-4">
                    <h3 className="text-4xl font-bold text-slate-900 tracking-tight">
                      {stat.value}
                    </h3>
                    <p className="text-sm font-semibold text-slate-900">
                      {stat.title}
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {stat.subtitle}
                    </p>
                  </div>

                  {/* Mini chart */}
                  <div className="flex items-end gap-1 h-12">
                    {stat.chartData.map((value, idx) => (
                      <div
                        key={idx}
                        className="flex-1 bg-gradient-to-t from-slate-200 to-slate-300 rounded-t-lg group-hover:from-blue-400 group-hover:to-blue-500 transition-all duration-500"
                        style={{
                          height: `${(value / Math.max(...stat.chartData, 1)) * 100}%`,
                          transitionDelay: `${idx * 50}ms`,
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Vehicle Management - Modern Design */}
            {canManageVehicles ? (
              <div className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
                        <VehicleIcon sx={{ fontSize: 24 }} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">
                          Quản Lý Phương Tiện
                        </h2>
                        <p className="text-sm text-slate-600 mt-0.5">
                          Theo dõi và giám sát tất cả xe cứu hộ
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors">
                        <FilterIcon
                          sx={{ fontSize: 20 }}
                          className="text-slate-600"
                        />
                      </button>
                      <button className="p-2.5 hover:bg-slate-100 rounded-xl transition-colors">
                        <MoreIcon
                          sx={{ fontSize: 20 }}
                          className="text-slate-600"
                        />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Phương Tiện
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Trạng Thái
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Lái Xe
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {vehicles.map((vehicle, idx) => {
                        const status = getVehicleStatusBadge(vehicle.status);
                        return (
                          <tr
                            key={vehicle.id}
                            className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${
                              idx === vehicles.length - 1 ? "border-b-0" : ""
                            }`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                  {vehicle.type === "Xe tải" ? (
                                    <VehicleIcon
                                      sx={{ fontSize: 20 }}
                                      className="text-slate-600"
                                    />
                                  ) : vehicle.type === "Cano" ? (
                                    <ShipIcon
                                      sx={{ fontSize: 20 }}
                                      className="text-slate-600"
                                    />
                                  ) : (
                                    <span className="text-sm font-bold text-slate-700">
                                      {vehicle.id}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <div className="text-sm font-bold text-slate-900">
                                    {vehicle.name}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {vehicle.type}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold ${status.style}`}
                              >
                                {status.label}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-slate-900">
                                {vehicle.driver || "Chưa có lái xe"}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden p-12">
                <div className="text-center">
                  <LockIcon
                    sx={{ fontSize: 48 }}
                    className="text-slate-300 mb-4"
                  />
                  <h3 className="text-xl font-bold text-slate-700 mb-2">
                    Không có quyền truy cập
                  </h3>
                  <p className="text-slate-500">
                    Bạn không có quyền quản lý phương tiện.
                  </p>
                </div>
              </div>
            )}

            {/* Inventory Management - Modern Design */}
            {canManageInventory ? (
              <div className="xl:col-span-3 bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
                        <BoxIcon sx={{ fontSize: 24 }} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">
                          Quản Lý Kho Vật Tư
                        </h2>
                        <p className="text-sm text-slate-600 mt-0.5">
                          Mức tồn kho và tình trạng kho hàng
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <SearchIcon
                          sx={{ fontSize: 18 }}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="text"
                          placeholder="Tìm kiếm vật tư..."
                          className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>
                      {canViewReports && (
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-colors">
                          <DownloadIcon sx={{ fontSize: 18 }} />
                          <span>Xuất báo cáo</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Vật Tư
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Danh Mục
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Số Lượng
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Trạng Thái
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Kho
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Nhập Thêm
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.map((item, idx) => {
                        const status = getInventoryStatusBadge(item.status);
                        return (
                          <tr
                            key={item.id}
                            className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${
                              idx === inventory.length - 1 ? "border-b-0" : ""
                            }`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                  <BoxIcon
                                    sx={{ fontSize: 20 }}
                                    className="text-slate-600"
                                  />
                                </div>
                                <div className="text-sm font-bold text-slate-900">
                                  {item.name}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
                                {item.category}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-bold text-slate-900">
                                {item.quantity.toLocaleString()} {item.unit}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold ${status.style}`}
                              >
                                {status.label}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-slate-900">
                                {item.warehouse}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold ${
                                  item.status === "critical"
                                    ? "bg-red-100 text-red-700"
                                    : item.status === "warning"
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                <ScheduleIcon
                                  sx={{ fontSize: 14 }}
                                  className="mr-1"
                                />
                                {item.restock}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="xl:col-span-3 bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden p-12">
                <div className="text-center">
                  <LockIcon
                    sx={{ fontSize: 48 }}
                    className="text-slate-300 mb-4"
                  />
                  <h3 className="text-xl font-bold text-slate-700 mb-2">
                    Không có quyền truy cập
                  </h3>
                  <p className="text-slate-500">
                    Bạn không có quyền quản lý kho vật tư.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification Popup */}
      <Notification
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        alerts={alerts}
      />
    </div>
  );
}
