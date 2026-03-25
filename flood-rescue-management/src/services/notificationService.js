import api from "./api";
import { getTimeAgo } from "./rescueRequestService";

const localizeStatusTokens = (value) => {
  const text = String(value ?? "");
  if (!text) return "";

  // Normalize common backend enums inside human-readable message strings.
  // Example: "status: IN_PROGRESS" -> "status: Đang thực hiện"
  const replacements = [
    { re: /\bIN[\s_-]?PROGRESS\b/gi, vi: "Đang thực hiện" },
    { re: /\bPENDING\b/gi, vi: "Đang chờ" },
    { re: /\bASSIGNED\b/gi, vi: "Đã phân công" },
    { re: /\bARRIVED\b/gi, vi: "Đã đến nơi" },
    { re: /\bCOMPLETED\b/gi, vi: "Hoàn thành" },
    { re: /\bCANCELLED\b/gi, vi: "Đã hủy" },
    { re: /\bFAILED\b/gi, vi: "Thất bại" },
    { re: /\bDECLINED\b/gi, vi: "Từ chối" },
  ];

  return replacements.reduce((acc, { re, vi }) => acc.replace(re, vi), text);
};

const normalizeNotifications = (items) => {
  if (!Array.isArray(items)) return [];
  return items
    .map((n) => {
      const createdAt = n?.createdAt ?? null;
      const rawMessage = n?.message ?? "";
      return {
        id: n?.id,
        userId: n?.userId ?? null,
        rawMessage,
        message: localizeStatusTokens(rawMessage),
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
        const updated = response.data?.data
          ? normalizeNotifications([response.data.data])[0]
          : null;
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
