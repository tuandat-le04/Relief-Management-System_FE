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
        return { success: true, data: response.data.data };
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
