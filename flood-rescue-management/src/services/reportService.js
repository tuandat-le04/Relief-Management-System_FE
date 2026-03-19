import api from "./api";

// ===== REPORT API SERVICE =====
// Theo API.md §2.1 — API Dashboard Summary chuyên biệt
// Quyền: ADMIN, MANAGER

const reportService = {
  /**
   * Lấy toàn bộ dữ liệu thống kê cho Dashboard trong 1 lần gọi duy nhất.
   * GET /api/v1/reports/summary
   *
   * Response data:
   *  - requests  : { total, CREATED, IN_PROGRESS, COMPLETED, CANCELLED }
   *  - missions  : { total, PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED }
   *  - vehicles  : { total, AVAILABLE, IN_USE }
   *  - impact    : { totalPeopleRescued }
   */
  getDashboardSummary: async () => {
    try {
      const response = await api.get("/reports/summary");
      if (response.data?.success) {
        const raw = response.data.data || {};

        // Hỗ trợ đồng thời:
        // 1) format nested cũ: { requests, missions, vehicles, impact }
        // 2) format flat mới BE: { totalRequests, requestsCreated, ... }
        const isFlatFormat =
          raw.totalRequests !== undefined || raw.totalMissions !== undefined;

        const normalized = isFlatFormat
          ? {
              requests: {
                total: raw.totalRequests,
                CREATED: raw.requestsCreated,
                IN_PROGRESS: raw.requestsInProgress,
                COMPLETED: raw.requestsCompleted,
                CANCELLED: raw.requestsCancelled,
              },
              missions: {
                total: raw.totalMissions,
                PENDING: raw.missionsPending,
                ASSIGNED: raw.missionsAssigned,
                IN_PROGRESS: raw.missionsInProgress,
                COMPLETED: raw.missionsCompleted,
                CANCELLED: raw.missionsCancelled,
              },
              vehicles: {
                total: raw.totalVehicles,
                AVAILABLE: raw.vehiclesAvailable,
                IN_USE: raw.vehiclesInUse,
                MAINTENANCE: raw.vehiclesMaintenance,
              },
              impact: {
                totalPeopleRescued: raw.totalPeopleRescued,
              },
              raw,
            }
          : {
              ...raw,
              raw,
            };

        return { success: true, data: normalized };
      }
      return {
        success: false,
        error:
          response.data?.message || "Không thể tải dữ liệu tổng quan Dashboard",
      };
    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Không thể tải dữ liệu tổng quan Dashboard",
      };
    }
  },
};

export default reportService;
