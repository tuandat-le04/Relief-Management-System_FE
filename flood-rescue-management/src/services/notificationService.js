import api from "./api";

const notificationService = {
  // GET /api/v1/notifications/unread
  getUnreadCount: async () => {
    try {
      const response = await api.get("/notifications/unread");
      if (response.data?.success) {
        const payload = response.data?.data;
        const count =
          typeof payload === "number"
            ? payload
            : Number(
                payload?.unreadCount ?? payload?.count ?? payload?.total ?? 0,
              );

        return { success: true, data: Number.isFinite(count) ? count : 0 };
      }
      return {
        success: false,
        error: response.data?.message || "Không thể tải số thông báo chưa đọc",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Không thể tải số thông báo chưa đọc",
      };
    }
  },

  // GET /api/v1/notifications
  getNotifications: async () => {
    try {
      const response = await api.get("/notifications");
      if (response.data?.success) {
        const list = Array.isArray(response.data?.data)
          ? response.data.data
          : response.data?.data
            ? [response.data.data]
            : [];
        return { success: true, data: list };
      }
      return {
        success: false,
        error: response.data?.message || "Không thể tải danh sách thông báo",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Không thể tải danh sách thông báo",
      };
    }
  },
};

export default notificationService;
