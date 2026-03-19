import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/manager/Sidebar";
import reportService from "../../services/reportService";
import vehicleService from "../../services/vehicleService";
import rescueTeamService from "../../services/rescueTeamService";
import feedbackService from "../../services/feedbackService";
import {
  getAllWarehouses,
  getWarehouseInventory,
} from "../../services/warehouseService";
import {
  Assessment as AssessmentIcon,
  ShowChart as ShowChartIcon,
  PieChart as PieChartIcon,
  Timer as TimerIcon,
  Inventory2 as InventoryIcon,
  MedicalServices as MedicalIcon,
  GroupAdd as GroupAddIcon,
  PictureAsPdf as PdfIcon,
  TableView as ExcelIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const toPercent = (part, total) => {
  if (!total) return 0;
  const p = Math.round((part / total) * 100);
  return Math.max(0, Math.min(100, p));
};

const resolveStatus = (progress) => {
  if (progress >= 90) return "excellent";
  if (progress >= 70) return "good";
  if (progress >= 40) return "warning";
  return "info";
};

const resolveStatusLabel = (progress) => {
  if (progress >= 90) return "Rất tốt";
  if (progress >= 70) return "Ổn định";
  if (progress >= 40) return "Cần cải thiện";
  return "Đang theo dõi";
};

export default function ManagerReports() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("24h");
  const [summaryData, setSummaryData] = useState(null);
  const [warehouseCount, setWarehouseCount] = useState(0);
  const [inventoryTotal, setInventoryTotal] = useState(0);
  const [teamCount, setTeamCount] = useState(0);
  const [teamAvailableCount, setTeamAvailableCount] = useState(0);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [vehicleMaintenanceCount, setVehicleMaintenanceCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

  const loadReports = async () => {
    setLoading(true);
    setError("");

    const [
      summaryRes,
      vehicleRes,
      teamRes,
      teamAvailableRes,
      warehouseRes,
      feedbackRes,
    ] = await Promise.all([
      reportService.getDashboardSummary(),
      vehicleService.getAllVehicles(),
      rescueTeamService.getAllTeams(),
      rescueTeamService.getAvailableTeams(),
      getAllWarehouses(),
      feedbackService.getAllFeedbacks(),
    ]);

    if (!summaryRes.success) {
      setSummaryData(null);
      setError(summaryRes.error || "Không thể tải dữ liệu báo cáo");
      setLoading(false);
      return;
    }

    setSummaryData(summaryRes.data || {});

    const vehicleList = vehicleRes.success ? vehicleRes.data || [] : [];
    const maintenanceCount = vehicleList.filter((v) => {
      const raw = String(v.statusRaw || v.status || "").toUpperCase();
      return raw === "MAINTENANCE" || v.status === "maintenance";
    }).length;
    setVehicleMaintenanceCount(maintenanceCount);

    const teamList = teamRes.success ? teamRes.data || [] : [];
    const availableTeamList = teamAvailableRes.success
      ? teamAvailableRes.data || []
      : [];
    setTeamCount(teamList.length);
    setTeamAvailableCount(availableTeamList.length);

    const warehouseList = warehouseRes.success ? warehouseRes.data || [] : [];
    setWarehouseCount(warehouseList.length);

    const inventoryList = await Promise.all(
      warehouseList.map(async (w) => {
        try {
          const invRes = await getWarehouseInventory(w.id);
          return invRes?.success ? invRes?.data?.items || [] : [];
        } catch {
          return [];
        }
      }),
    );
    const inventoryQty = inventoryList
      .flat()
      .reduce((sum, item) => sum + toNumber(item.quantity), 0);
    setInventoryTotal(inventoryQty);

    const feedbackList = feedbackRes.success ? feedbackRes.data || [] : [];
    setFeedbackCount(feedbackList.length);
    setLastUpdatedAt(new Date());

    setLoading(false);
  };

  useEffect(() => {
    loadReports();
  }, [selectedTimeframe]);

  const requests = summaryData?.requests || {};
  const missions = summaryData?.missions || {};
  const vehicles = summaryData?.vehicles || {};
  const impact = summaryData?.impact || {};

  const requestTotal = toNumber(requests.total);
  const requestCompleted = toNumber(requests.COMPLETED);

  const missionTotal = toNumber(missions.total);
  const missionCompleted = toNumber(missions.COMPLETED);
  const missionInProgress = toNumber(missions.IN_PROGRESS);
  const missionAssigned = toNumber(missions.ASSIGNED);
  const missionPending = toNumber(missions.PENDING);
  const missionCancelled = toNumber(missions.CANCELLED);

  const vehicleTotal = toNumber(vehicles.total);
  const vehicleAvailable = toNumber(vehicles.AVAILABLE);
  const vehicleInUse = toNumber(vehicles.IN_USE);
  const vehicleMaintenance = toNumber(vehicles.MAINTENANCE);
  const vehicleOther = Math.max(
    0,
    vehicleTotal - vehicleAvailable - vehicleInUse - vehicleMaintenance,
  );

  const totalPeopleRescued = toNumber(impact.totalPeopleRescued);

  const requestCompletionRate = toPercent(requestCompleted, requestTotal);
  const missionCompletionRate = toPercent(missionCompleted, missionTotal);
  const vehicleReadinessRate = toPercent(vehicleAvailable, vehicleTotal);

  const missionStatusData = [
    {
      name: "Pending",
      label: "Chờ xử lý",
      count: missionPending,
      value: toPercent(missionPending, missionTotal),
      color: "bg-slate-500",
    },
    {
      name: "Assigned",
      label: "Đã phân công",
      count: missionAssigned,
      value: toPercent(missionAssigned, missionTotal),
      color: "bg-cyan-600",
    },
    {
      name: "InProgress",
      label: "Đang thực hiện",
      count: missionInProgress,
      value: toPercent(missionInProgress, missionTotal),
      color: "bg-blue-600",
    },
    {
      name: "Completed",
      label: "Hoàn thành",
      count: missionCompleted,
      value: toPercent(missionCompleted, missionTotal),
      color: "bg-emerald-600",
    },
    {
      name: "Cancelled",
      label: "Hủy",
      count: missionCancelled,
      value: toPercent(missionCancelled, missionTotal),
      color: "bg-red-500",
    },
  ];

  const vehicleCompositionData = [
    {
      name: "Sẵn sàng",
      value: toPercent(vehicleAvailable, vehicleTotal),
      color: "#0891b2",
      dotColor: "bg-cyan-600",
      count: vehicleAvailable,
    },
    {
      name: "Đang dùng",
      value: toPercent(vehicleInUse, vehicleTotal),
      color: "#3b82f6",
      dotColor: "bg-blue-500",
      count: vehicleInUse,
    },
    {
      name: "Khác",
      value: toPercent(vehicleOther, vehicleTotal),
      color: "#f97316",
      dotColor: "bg-orange-500",
      count: vehicleOther,
    },
    {
      name: "Bảo trì",
      value: toPercent(vehicleMaintenance, vehicleTotal),
      color: "#ef4444",
      dotColor: "bg-red-500",
      count: vehicleMaintenance,
    },
  ];

  const donutSegments = useMemo(() => {
    const circumference = 2 * Math.PI * 40;
    let offset = 0;

    return vehicleCompositionData.map((item) => {
      const length = (item.value / 100) * circumference;
      const segment = {
        ...item,
        strokeDasharray: `${length} ${circumference}`,
        strokeDashoffset: -offset,
      };
      offset += length;
      return segment;
    });
  }, [vehicleCompositionData]);

  const kpis = [
    {
      id: 1,
      name: "Tỷ lệ xử lý yêu cầu",
      icon: <TimerIcon sx={{ fontSize: 18 }} />,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      target: "≥ 90%",
      actual: `${requestCompletionRate}% (${requestCompleted}/${requestTotal})`,
      progress: requestCompletionRate,
      status: resolveStatus(requestCompletionRate),
      statusLabel: resolveStatusLabel(requestCompletionRate),
    },
    {
      id: 2,
      name: "Tỷ lệ hoàn thành nhiệm vụ",
      icon: <InventoryIcon sx={{ fontSize: 18 }} />,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      target: "≥ 85%",
      actual: `${missionCompletionRate}% (${missionCompleted}/${missionTotal})`,
      progress: missionCompletionRate,
      status: resolveStatus(missionCompletionRate),
      statusLabel: resolveStatusLabel(missionCompletionRate),
    },
    {
      id: 3,
      name: "Người đã được cứu",
      icon: <MedicalIcon sx={{ fontSize: 18 }} />,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      target: "Tăng theo ngày",
      actual: `${totalPeopleRescued} người`,
      progress: Math.min(100, totalPeopleRescued > 0 ? 100 : 0),
      status: totalPeopleRescued > 0 ? "good" : "info",
      statusLabel: totalPeopleRescued > 0 ? "Đã ghi nhận" : "Chưa phát sinh",
    },
    {
      id: 4,
      name: "Phương tiện sẵn sàng",
      icon: <GroupAddIcon sx={{ fontSize: 18 }} />,
      iconBg: "bg-cyan-100",
      iconColor: "text-cyan-600",
      target: "≥ 80%",
      actual: `${vehicleReadinessRate}% (${vehicleAvailable}/${vehicleTotal})`,
      progress: vehicleReadinessRate,
      status: resolveStatus(vehicleReadinessRate),
      statusLabel: resolveStatusLabel(vehicleReadinessRate),
    },
  ];

  const summaryCards = [
    {
      id: "requests",
      label: "Tổng yêu cầu",
      value: requestTotal,
      sub: `${requestCompleted} đã hoàn thành`,
      color: "from-blue-500 to-indigo-600",
    },
    {
      id: "missions",
      label: "Tổng nhiệm vụ",
      value: missionTotal,
      sub: `${missionInProgress + missionAssigned} đang vận hành`,
      color: "from-orange-500 to-amber-600",
    },
    {
      id: "vehicles",
      label: "Phương tiện",
      value: vehicleTotal,
      sub: `${vehicleAvailable} sẵn sàng`,
      color: "from-emerald-500 to-teal-600",
    },
    {
      id: "impact",
      label: "Người được cứu",
      value: totalPeopleRescued,
      sub: "Dữ liệu tích lũy",
      color: "from-rose-500 to-pink-600",
    },
  ];

  const supportCards = [
    {
      id: "warehouse",
      label: "Kho hàng",
      value: warehouseCount,
      sub: `${inventoryTotal.toLocaleString("vi-VN")} đơn vị tồn`,
    },
    {
      id: "teams",
      label: "Đội cứu hộ",
      value: teamCount,
      sub: `${teamAvailableCount} đội sẵn sàng`,
    },
    {
      id: "feedbacks",
      label: "Phản hồi",
      value: feedbackCount,
      sub: "Từ người dân và hiện trường",
    },
    {
      id: "vehicleMaint",
      label: "Xe bảo trì",
      value: vehicleMaintenanceCount,
      sub: "Cần theo dõi kỹ thuật",
    },
  ];

  const getStatusBadge = (status) => {
    const styles = {
      good: "bg-emerald-100 text-emerald-700 border-emerald-200",
      warning: "bg-orange-100 text-orange-700 border-orange-200",
      info: "bg-blue-100 text-blue-700 border-blue-200",
      excellent: "bg-emerald-100 text-emerald-700 border-emerald-200",
    };
    return styles[status] || styles.info;
  };

  const getProgressColor = (status) => {
    const colors = {
      good: "bg-emerald-500",
      warning: "bg-orange-500",
      info: "bg-blue-500",
      excellent: "bg-emerald-500",
    };
    return colors[status] || colors.info;
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-[1800px] mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                  Báo Cáo Hoạt Động Cứu Trợ
                </h1>
                <p className="text-slate-600 text-base">
                  Tổng hợp dữ liệu thật từ API báo cáo hệ thống
                </p>
                <p className="text-xs text-slate-500">
                  {lastUpdatedAt
                    ? `Cập nhật lúc ${lastUpdatedAt.toLocaleTimeString(
                        "vi-VN",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}`
                    : "Chưa có dữ liệu cập nhật"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={loadReports}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-70 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
                >
                  {loading ? "Đang cập nhật..." : "Làm mới dữ liệu"}
                </button>

                {/* Timeframe Filter */}
                <div className="flex items-center gap-1 p-1 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  {[
                    { id: "24h", label: "24h qua" },
                    { id: "7d", label: "7 ngày qua" },
                    { id: "custom", label: "Tùy chỉnh" },
                  ].map((time) => (
                    <button
                      key={time.id}
                      onClick={() => setSelectedTimeframe(time.id)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        selectedTimeframe === time.id
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      {time.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between gap-3">
              <span>{error}</span>
              <button
                onClick={loadReports}
                className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors"
              >
                Tải lại
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {summaryCards.map((card) => (
              <div
                key={card.id}
                className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-slate-600">
                    {card.label}
                  </p>
                  <span
                    className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${card.color}`}
                  ></span>
                </div>
                <p className="text-3xl font-bold text-slate-900 tracking-tight">
                  {card.value.toLocaleString("vi-VN")}
                </p>
                <p className="text-xs text-slate-500 mt-1">{card.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {supportCards.map((card) => (
              <div
                key={card.id}
                className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-5 shadow-sm"
              >
                <p className="text-sm font-semibold text-slate-300">
                  {card.label}
                </p>
                <p className="text-3xl font-bold mt-2 tracking-tight">
                  {card.value.toLocaleString("vi-VN")}
                </p>
                <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* List Chart - Trạng thái nhiệm vụ */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 hover:shadow-lg transition-all duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20">
                    <ShowChartIcon sx={{ fontSize: 20 }} />
                  </div>
                  Phân bổ nhiệm vụ theo trạng thái
                </h3>
                <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <FilterIcon
                    sx={{ fontSize: 20 }}
                    className="text-slate-600"
                  />
                </button>
              </div>

              <div className="space-y-4 h-64 overflow-auto pr-1">
                {missionStatusData.map((item) => (
                  <div key={item.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-slate-700">
                        {item.label}
                      </span>
                      <span className="text-slate-600">
                        {item.count} nhiệm vụ ({item.value}%)
                      </span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`${item.color} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${item.value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pie Chart - Cơ cấu phương tiện */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 hover:shadow-lg transition-all duration-300">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20">
                    <PieChartIcon sx={{ fontSize: 20 }} />
                  </div>
                  Cơ cấu trạng thái phương tiện
                </h3>
              </div>

              <div className="flex flex-col items-center justify-center pt-4">
                {/* Donut Chart */}
                <div className="relative h-44 w-44 rounded-full mb-6 shadow-xl">
                  <svg
                    className="w-full h-full -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="16"
                    />
                    {donutSegments.map((item) => (
                      <circle
                        key={item.name}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={item.color}
                        strokeWidth="16"
                        strokeDasharray={item.strokeDasharray}
                        strokeDashoffset={item.strokeDashoffset}
                      />
                    ))}
                  </svg>

                  {/* Center content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-slate-900">
                      {vehicleTotal}
                    </span>
                    <span className="text-xs text-slate-600 uppercase tracking-wider font-semibold">
                      Phương tiện
                    </span>
                  </div>
                </div>

                {/* Legend */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 w-full">
                  {vehicleCompositionData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span
                        className={`w-3 h-3 rounded-full ${item.dotColor}`}
                      ></span>
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-600">
                          {item.name}
                        </span>
                        <span className="text-sm font-bold text-slate-900">
                          {item.value}% ({item.count})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* KPIs Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/20">
                    <AssessmentIcon sx={{ fontSize: 24 }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xl">
                      Tổng Hợp KPIs Hoạt Động
                    </h3>
                    <p className="text-sm text-slate-600 mt-0.5">
                      Cập nhật: 15 phút trước
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-sm font-semibold border border-slate-200">
                    <PdfIcon sx={{ fontSize: 18 }} />
                    Xuất PDF
                  </button>
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white transition-all text-sm font-semibold shadow-lg shadow-emerald-500/30">
                    <ExcelIcon sx={{ fontSize: 18 }} />
                    Xuất Excel
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Chỉ số KPI
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Mục tiêu
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Thực đạt
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Tiến độ
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {kpis.map((kpi) => (
                    <tr
                      key={kpi.id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-10 w-10 rounded-xl ${kpi.iconBg} ${kpi.iconColor} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}
                          >
                            {kpi.icon}
                          </div>
                          <span className="text-slate-900 font-semibold">
                            {kpi.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {kpi.target}
                      </td>
                      <td className="px-6 py-4 text-slate-900 font-bold">
                        {kpi.actual}
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-32">
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`${getProgressColor(kpi.status)} h-full rounded-full transition-all duration-500`}
                              style={{ width: `${kpi.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold border ${getStatusBadge(kpi.status)}`}
                        >
                          {kpi.statusLabel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 px-6 py-4 bg-slate-50/30 text-center">
              <p className="text-xs text-slate-600">
                © 2024 ReliefOps System. Báo cáo được tạo tự động lúc{" "}
                {new Date().toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
