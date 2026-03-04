import api from "./api";

// Service for mission assignments for rescue teams
const missionService = {
  // GET /api/v1/missions/assigned-to-me
  getAssignedToMe: async () => {
    try {
      const response = await api.get("/missions/assigned-to-me");

      if (response.data?.success) {
        return {
          success: true,
          data: response.data.data || [],
        };
      }

      return {
        success: false,
        error: response.data?.message || "Không thể lấy danh sách nhiệm vụ",
      };
    } catch (error) {
      console.error("Error fetching missions assigned to me:", error);

      // Thông báo rõ ràng hơn khi bị chặn quyền truy cập
      if (error.response?.status === 403) {
        return {
          success: false,
          error:
            "Bạn không có quyền truy cập danh sách nhiệm vụ này (403). Hãy đăng nhập bằng tài khoản đội cứu hộ hoặc tài khoản có quyền phù hợp.",
        };
      }

      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Không thể lấy danh sách nhiệm vụ",
      };
    }
  },

  // PATCH /api/v1/missions/assignments/{assignmentId}/response
  respondToAssignment: async (assignmentId, decision, reason = "") => {
    try {
      // Chuẩn hoá decision theo format backend: "ACCEPTED" hoặc "DECLINED"
      let normalizedDecision = decision;

      if (decision === "ACCEPT") normalizedDecision = "ACCEPTED";
      if (decision === "DECLINE") normalizedDecision = "DECLINED";

      const payload = {
        decision: normalizedDecision,
        reason,
      };

      const response = await api.patch(
        `/missions/assignments/${assignmentId}/response`,
        payload,
      );

      if (response.data?.success) {
        return {
          success: true,
          message: response.data.message || "Cập nhật phản hồi thành công",
          data: response.data.data,
        };
      }

      return {
        success: false,
        error: response.data?.message || "Không thể cập nhật phản hồi",
      };
    } catch (error) {
      console.error("Error responding to mission assignment:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Không thể cập nhật phản hồi",
      };
    }
  },
};

export default missionService;
