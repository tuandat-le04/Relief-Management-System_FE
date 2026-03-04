import api from "./api";

// Helper function: Tính thời gian từ createdAt
export const getTimeAgo = (createdAt) => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now - created;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  return `${diffDays} ngày trước`;
};

// Helper function: Map requestType sang category
export const mapRequestTypeToCategory = (requestType, requestSupplies) => {
  if (requestType === "RESCUE") return "emergency";
  if (requestType === "RELIEF") {
    // Phân loại dựa vào requestSupplies nếu có
    if (requestSupplies && requestSupplies.includes("medicine"))
      return "medical";
    if (requestSupplies && requestSupplies.includes("food")) return "food";
    return "supplies";
  }
  return "other";
};

// Helper function: Map priority sang UI priority
export const mapPriorityToUI = (priority) => {
  if (priority === "CRITICAL") return "emergency";
  if (priority === "HIGH") return "urgent";
  return "normal";
};

// Helper function: Transform data từ API sang format UI
export const transformRescueRequest = (item) => ({
  id: item.id,
  userId: item.userId,
  name: item.phone || "Không rõ tên", // Tạm dùng phone vì API không có name
  type:
    item.requestType === "RESCUE"
      ? "Cứu hộ khẩn cấp"
      : item.requestType === "RELIEF"
        ? "Hỗ trợ cứu trợ"
        : "Khác",
  priority: item.priority || "MEDIUM", // Giữ nguyên giá trị gốc từ API
  location: item.description || "Không có địa chỉ", // Tạm dùng description
  time: getTimeAgo(item.createdAt),
  coordinates: [item.longitude || 108.2022, item.latitude || 16.0544], // [lng, lat]
  category: mapRequestTypeToCategory(item.requestType, item.requestSupplies),
  status: item.status,
  phone: item.phone,
  description: item.description,
  requestType: item.requestType, // Giữ nguyên requestType gốc
  requestSupplies: item.requestSupplies,
  requestMedia: item.requestMedia,
  createdAt: item.createdAt,
});

// API Services
const rescueRequestService = {
  // Lấy tất cả rescue requests (bao gồm cả RESCUE và RELIEF)
  getAllRequests: async () => {
    try {
      const response = await api.get("/rescue-requests");

      console.log("=== DEBUG API RESPONSE ===");
      console.log("Response.data:", response.data);
      console.log("========================");

      // Response format: {success: true, message: "...", data: [...]}
      if (response.data?.success && Array.isArray(response.data?.data)) {
        const transformedData = response.data.data
          .map(transformRescueRequest)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort mới nhất đến cũ nhất

        console.log("✅ Transformed Data:", transformedData);

        return {
          success: true,
          data: transformedData,
        };
      }

      // Trường hợp data null hoặc empty
      if (
        response.data?.success &&
        (response.data?.data === null || response.data?.data?.length === 0)
      ) {
        console.log("⚠️ No data available");
        return {
          success: true,
          data: [],
        };
      }

      console.warn("❌ Unexpected response format:", response.data);
      return {
        success: false,
        error: "Không có dữ liệu hoặc format không đúng",
      };
    } catch (error) {
      console.error("❌ Error fetching rescue requests:", error);
      console.error("Error details:", error.response?.data);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Không thể tải dữ liệu yêu cầu cứu hộ",
      };
    }
  },

  // Lấy requests theo loại (RESCUE hoặc RELIEF)
  getRequestsByType: async (requestType) => {
    try {
      const allRequests = await rescueRequestService.getAllRequests();

      if (!allRequests.success) {
        return allRequests;
      }

      const filteredData = allRequests.data.filter(
        (req) =>
          req.type ===
          (requestType === "RESCUE" ? "Cứu hộ khẩn cấp" : "Hỗ trợ cứu trợ"),
      );

      return {
        success: true,
        data: filteredData,
      };
    } catch (error) {
      console.error("Error filtering requests by type:", error);
      return {
        success: false,
        error: "Không thể lọc dữ liệu",
      };
    }
  },

  // Lấy requests cứu hộ (RESCUE)
  getRescueRequests: async () => {
    return await rescueRequestService.getRequestsByType("RESCUE");
  },

  // Lấy requests cứu trợ (RELIEF)
  getReliefRequests: async () => {
    return await rescueRequestService.getRequestsByType("RELIEF");
  },

  // Lấy requests theo status
  getRequestsByStatus: async (status) => {
    try {
      const response = await api.get(`/rescue-requests?status=${status}`);

      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: response.data.data.map(transformRescueRequest),
        };
      }

      return {
        success: false,
        error: "Không có dữ liệu",
      };
    } catch (error) {
      console.error("Error fetching rescue requests by status:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Không thể tải dữ liệu",
      };
    }
  },

  // Lấy các request theo người dùng (dùng endpoint riêng cho citizen)
  getRequestsByUser: async (userId) => {
    try {
      if (!userId) {
        return {
          success: false,
          error: "Không xác định được người dùng",
        };
      }

      const response = await api.get(`/rescue-requests/user/${userId}`);

      if (response.data?.success && Array.isArray(response.data?.data)) {
        return {
          success: true,
          data: response.data.data
            .map(transformRescueRequest)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
        };
      }

      return {
        success: false,
        error: "Không có dữ liệu",
      };
    } catch (error) {
      console.error("Error fetching rescue requests by user:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Không thể tải dữ liệu yêu cầu",
      };
    }
  },

  // Lấy chi tiết request theo ID
  getRequestById: async (id) => {
    try {
      const response = await api.get(`/rescue-requests/${id}`);

      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: transformRescueRequest(response.data.data),
        };
      }

      return {
        success: false,
        error: "Không tìm thấy yêu cầu",
      };
    } catch (error) {
      console.error("Error fetching rescue request by ID:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Không thể tải chi tiết yêu cầu",
      };
    }
  },

  // Cập nhật status của request
  // API nhận Content-Type: text/plain, body là string thuần: "IN_PROGRESS" | "COMPLETED" | ...
  updateRequestStatus: async (id, status) => {
    try {
      const response = await api.put(`/rescue-requests/${id}/status`, status, {
        headers: { "Content-Type": "text/plain" },
      });

      if (response.data?.success) {
        return {
          success: true,
          message: response.data.message || "Cập nhật trạng thái thành công",
          data: response.data.data,
        };
      }

      return {
        success: false,
        error: response.data?.message || "Cập nhật thất bại",
      };
    } catch (error) {
      console.error("Error updating rescue request status:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Không thể cập nhật trạng thái",
      };
    }
  },

  // Phân loại yêu cầu: cập nhật priority và requestType
  classifyRequest: async (id, { priority, requestType }) => {
    try {
      const response = await api.patch(`/rescue-requests/${id}/classify`, {
        priority,
        requestType,
      });

      if (response.data?.success) {
        return {
          success: true,
          message: response.data.message || "Phân loại yêu cầu thành công",
          data: response.data.data,
        };
      }

      return {
        success: false,
        error: response.data?.message || "Phân loại thất bại",
      };
    } catch (error) {
      console.error("Error classifying request:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Không thể phân loại yêu cầu",
      };
    }
  },

  // Gán coordinator cho request
  assignCoordinator: async (requestId, coordinatorId) => {
    try {
      const response = await api.put(`/rescue-requests/${requestId}/assign`, {
        coordinatorId,
      });

      if (response.data.success) {
        return {
          success: true,
          message: "Gán điều phối viên thành công",
        };
      }

      return {
        success: false,
        error: "Gán thất bại",
      };
    } catch (error) {
      console.error("Error assigning coordinator:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Không thể gán điều phối viên",
      };
    }
  },

  // Tiếp nhận (Approve) request
  approveRequest: async (requestId) => {
    try {
      const response = await api.put(`/rescue-requests/${requestId}/approve`);

      console.log("=== APPROVE API RESPONSE ===");
      console.log("Full response:", response);
      console.log("Response.data:", response.data);
      console.log("Response.data.data:", response.data?.data);
      console.log("Status in response:", response.data?.data?.status);
      console.log("===========================");

      if (response.data?.success) {
        return {
          success: true,
          message: response.data.message || "Tiếp nhận yêu cầu thành công",
          data: response.data.data,
        };
      }

      return {
        success: false,
        error: response.data?.message || "Tiếp nhận thất bại",
      };
    } catch (error) {
      console.error("Error approving request:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Không thể tiếp nhận yêu cầu",
      };
    }
  },

  // Từ chối (Cancel) request
  cancelRequest: async (requestId, reason = "") => {
    try {
      const response = await api.put(`/rescue-requests/${requestId}/cancel`);

      console.log("Cancel response:", response.data);

      if (response.data?.success) {
        return {
          success: true,
          message: response.data.message || "Từ chối yêu cầu thành công",
          data: response.data.data,
        };
      }

      return {
        success: false,
        error: response.data?.message || "Từ chối thất bại",
      };
    } catch (error) {
      console.error("Error canceling request:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Không thể từ chối yêu cầu",
      };
    }
  },
};

export default rescueRequestService;
