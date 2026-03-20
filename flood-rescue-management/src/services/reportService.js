import api from "./api";

// ===== REPORT API SERVICE =====
// Theo API.md §2.1 — API Dashboard Summary chuyên biệt
// Quyền: ADMIN, MANAGER

const pickFirstDefined = (...values) =>
  values.find((v) => v !== undefined && v !== null);

const normalizeDashboardSummary = (raw) => {
  const requests = raw?.requests || {};
  const missions = raw?.missions || {};
  const vehicles = raw?.vehicles || {};
  const impact = raw?.impact || {};

  return {
    requests: {
      total: pickFirstDefined(raw.totalRequests, requests.total),
      CREATED: pickFirstDefined(raw.requestsCreated, requests.CREATED),
      IN_PROGRESS: pickFirstDefined(
        raw.requestsInProgress,
        requests.IN_PROGRESS,
      ),
      COMPLETED: pickFirstDefined(raw.requestsCompleted, requests.COMPLETED),
      CANCELLED: pickFirstDefined(
        raw.requestsCancelled,
        raw.requestsCanceled,
        raw.requestsRejected,
        raw.requestsDeclined,
        requests.CANCELLED,
        requests.CANCELED,
        requests.REJECTED,
        requests.DECLINED,
      ),
    },
    missions: {
      total: pickFirstDefined(raw.totalMissions, missions.total),
      PENDING: pickFirstDefined(raw.missionsPending, missions.PENDING),
      ASSIGNED: pickFirstDefined(raw.missionsAssigned, missions.ASSIGNED),
      IN_PROGRESS: pickFirstDefined(
        raw.missionsInProgress,
        missions.IN_PROGRESS,
      ),
      COMPLETED: pickFirstDefined(raw.missionsCompleted, missions.COMPLETED),
      CANCELLED: pickFirstDefined(
        raw.missionsCancelled,
        raw.missionsCanceled,
        raw.missionsRejected,
        raw.missionsDeclined,
        missions.CANCELLED,
        missions.CANCELED,
        missions.REJECTED,
        missions.DECLINED,
      ),
    },
    vehicles: {
      total: pickFirstDefined(raw.totalVehicles, vehicles.total),
      AVAILABLE: pickFirstDefined(raw.vehiclesAvailable, vehicles.AVAILABLE),
      IN_USE: pickFirstDefined(raw.vehiclesInUse, vehicles.IN_USE),
      MAINTENANCE: pickFirstDefined(
        raw.vehiclesMaintenance,
        vehicles.MAINTENANCE,
      ),
    },
    impact: {
      totalPeopleRescued: pickFirstDefined(
        raw.totalPeopleRescued,
        impact.totalPeopleRescued,
      ),
    },
    raw,
  };
};

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

        const normalized = normalizeDashboardSummary(raw);

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
