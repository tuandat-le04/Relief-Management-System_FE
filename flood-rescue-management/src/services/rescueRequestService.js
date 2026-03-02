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
  name: item.phone || "Không rõ tên", // Tạm dùng phone vì API không có name
  type: item.requestType === "RESCUE" ? "Cứu hộ khẩn cấp" : "Hỗ trợ cứu trợ",
  priority: mapPriorityToUI(item.priority),
  location: item.description || "Không có địa chỉ", // Tạm dùng description
  time: getTimeAgo(item.createdAt),
  coordinates: [item.longitude || 108.2022, item.latitude || 16.0544], // [lng, lat]
  category: mapRequestTypeToCategory(item.requestType, item.requestSupplies),
  status: item.status,
  phone: item.phone,
  description: item.description,
  requestSupplies: item.requestSupplies,
  requestMedia: item.requestMedia,
  createdAt: item.createdAt,
});

// API Services
const rescueRequestService = {
  // Lấy tất cả rescue requests
  getAllRequests: async () => {
    try {
      const response = await api.get("/rescue-requests");

      console.log("=== DEBUG API RESPONSE ===");
      console.log("Full response:", response);
      console.log("Response.data:", response.data);
      console.log("Response.data type:", typeof response.data);
      console.log("Is Array?:", Array.isArray(response.data));
      console.log("Response.data.success:", response.data?.success);
      console.log("Response.data.data:", response.data?.data);
      console.log("========================");

      // Case 1: {success: true, data: [...]}
      if (response.data?.success && response.data?.data) {
        const transformedData = response.data.data.map(transformRescueRequest);
        console.log("✅ Case 1: Standard format with success field");
        console.log("Transformed Data:", transformedData);

        return {
          success: true,
          data: transformedData,
        };
      }

      // Case 1b: {success: true, data: null} - API trả về thành công nhưng không có data
      if (response.data?.success && response.data?.data === null) {
        console.log(
          "⚠️ Case 1b: Success but data is null (empty database or no matching records)",
        );
        return {
          success: true,
          data: [], // Trả về array rỗng thay vì báo lỗi
        };
      }

      // Case 2: Direct array [{...}, {...}]
      if (Array.isArray(response.data)) {
        console.log("✅ Case 2: Direct array format");
        const transformedData = response.data.map(transformRescueRequest);
        console.log("Transformed Data:", transformedData);
        return {
          success: true,
          data: transformedData,
        };
      }

      // Case 3: Nested data property without success field
      if (response.data?.data && Array.isArray(response.data.data)) {
        console.log("✅ Case 3: Nested data without success field");
        const transformedData = response.data.data.map(transformRescueRequest);
        console.log("Transformed Data:", transformedData);
        return {
          success: true,
          data: transformedData,
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
  updateRequestStatus: async (id, status) => {
    try {
      const response = await api.put(`/rescue-requests/${id}/status`, {
        status,
      });

      if (response.data.success) {
        return {
          success: true,
          message: "Cập nhật trạng thái thành công",
        };
      }

      return {
        success: false,
        error: "Cập nhật thất bại",
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
};

export default rescueRequestService;
