import api from "./api";
import { getTimeAgo } from "./rescueRequestService";

const normalizeNotifications = (items) => {
  if (!Array.isArray(items)) return [];
  return items
    .map((n) => {
      const createdAt = n?.createdAt ?? null;
      return {
        id: n?.id,
        userId: n?.userId ?? null,
        message: n?.message ?? "",
        isRead: Boolean(n?.isRead),
        createdAt,
        time: createdAt ? getTimeAgo(createdAt) : "",
      };
    })
    .filter((n) => n.id !== undefined && n.id !== null);
};

const notificationService = {
  getNotifications: async () => {
    try {
      // api baseURL already includes /api/v1
      const response = await api.get("/notifications");

      if (response.data?.success) {
        return {
          success: true,
          data: normalizeNotifications(response.data?.data),
        };
      }

      return {
        success: false,
        error: response.data?.message || "Không thể tải thông báo.",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error?.response?.data?.message ||
          error?.message ||
          "Không thể tải thông báo.",
      };
    }
  },

  getUnreadNotifications: async () => {
    try {
      const response = await api.get("/notifications/unread");

      if (response.data?.success) {
        return {
          success: true,
          data: normalizeNotifications(response.data?.data),
        };
      }

      return {
        success: false,
        error: response.data?.message || "Không thể tải thông báo chưa đọc.",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error?.response?.data?.message ||
          error?.message ||
          "Không thể tải thông báo chưa đọc.",
      };
    }
  },

  markAsRead: async (id) => {
    try {
      const response = await api.patch(`/notifications/${id}/read`);
      if (response.data?.success) {
        const updated = response.data?.data ? normalizeNotifications([response.data.data])[0] : null;
        return {
          success: true,
          data: updated,
        };
      }

      return {
        success: false,
        error: response.data?.message || "Không thể đánh dấu đã đọc.",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error?.response?.data?.message ||
          error?.message ||
          "Không thể đánh dấu đã đọc.",
      };
    }
  },
};

export default notificationService;
