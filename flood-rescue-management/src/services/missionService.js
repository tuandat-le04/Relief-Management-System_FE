import api from "./api";

const missionService = {
  // ── GET /api/v1/missions ─────────────────────────────────────────────────
  // Lấy toàn bộ nhiệm vụ (dành cho Coordinator/Admin)
  getAllMissions: async () => {
    try {
      const response = await api.get("/missions");
      if (response.data?.success) {
        const list = Array.isArray(response.data?.data)
          ? response.data.data
          : [];
        return { success: true, data: list };
      }
      return {
        success: false,
        error: response.data?.message || "Không thể tải danh sách nhiệm vụ",
      };
    } catch (error) {
      console.error("Error fetching all missions:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Không thể tải danh sách nhiệm vụ",
      };
    }
  },

  // ── GET /api/v1/missions/{id} ────────────────────────────────────────────
  getMissionById: async (id) => {
    try {
      const response = await api.get(`/missions/${id}`);
      if (response.data?.success && response.data?.data) {
        return { success: true, data: response.data.data };
      }
      return { success: false, error: "Không tìm thấy nhiệm vụ" };
    } catch (error) {
      console.error(`Error fetching mission ${id}:`, error);
      return {
        success: false,
        error:
          error.response?.data?.message || "Không thể tải thông tin nhiệm vụ",
      };
    }
  },

  // ── POST /api/v1/missions/request/{requestId} ────────────────────────────
  // Tạo nhiệm vụ thủ công từ requestId (nếu approve chưa tự tạo)
  createMissionFromRequest: async (requestId) => {
    try {
      const response = await api.post(`/missions/request/${requestId}`);
      if (response.data?.success) {
        return {
          success: true,
          message: response.data.message || "Tạo nhiệm vụ thành công",
          data: response.data.data,
        };
      }
      return {
        success: false,
        error: response.data?.message || "Tạo nhiệm vụ thất bại",
      };
    } catch (error) {
      console.error("Error creating mission from request:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Không thể tạo nhiệm vụ",
      };
    }
  },

  // ── PATCH /api/v1/missions/{id}/status ───────────────────────────────────
  // status: PENDING | ASSIGNED | IN_PROGRESS | ARRIVED | COMPLETED | CANCELLED
  updateMissionStatus: async (
    id,
    { status, peopleRescued, summary, obstacles },
  ) => {
    try {
      const body = { status };
      if (peopleRescued !== undefined) body.peopleRescued = peopleRescued;
      if (summary !== undefined) body.summary = summary;
      if (obstacles !== undefined) body.obstacles = obstacles;

      const response = await api.patch(`/missions/${id}/status`, body);
      if (response.data?.success) {
        return {
          success: true,
          message:
            response.data.message || "Cập nhật trạng thái nhiệm vụ thành công",
          data: response.data.data,
        };
      }
      return {
        success: false,
        error: response.data?.message || "Cập nhật trạng thái thất bại",
      };
    } catch (error) {
      console.error("Error updating mission status:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Không thể cập nhật trạng thái nhiệm vụ",
      };
    }
  },

  // Lấy danh sách nhiệm vụ được giao cho tôi (Rescue Team đang đăng nhập)
  // GET /api/v1/missions/assigned-to-me
  getAssignedToMe: async () => {
    try {
      const response = await api.get("/missions/assigned-to-me");
      if (response.data?.success) {
        const list = Array.isArray(response.data?.data)
          ? response.data.data
          : [];
        return { success: true, data: list };
      }
      return {
        success: false,
        error: response.data?.message || "Không thể tải nhiệm vụ được giao",
      };
    } catch (error) {
      console.error("Error fetching assigned missions:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Không thể tải nhiệm vụ được giao",
      };
    }
  },

  // Lấy mission theo requestId
  getMissionByRequestId: async (requestId) => {
    try {
      const response = await api.get(`/missions?requestId=${requestId}`);
      if (response.data?.success) {
        const missions = response.data.data;
        // Lấy mission MỚI NHẤT (id lớn nhất) thay vì missions[0] (cũ nhất)
        const mission = Array.isArray(missions)
          ? [...missions].sort((a, b) => b.id - a.id)[0]
          : missions;
        return { success: true, data: mission || null };
      }
      return { success: false, error: "Không tìm thấy nhiệm vụ" };
    } catch (error) {
      console.error("Error fetching mission by requestId:", error);
      return {
        success: false,
        error:
          error.response?.data?.message || "Không thể tải thông tin nhiệm vụ",
      };
    }
  },

  // Kiểm tra tình trạng phương tiện
  // Returns: { success, available: true|false }
  checkVehicleAvailability: async (vehicleId) => {
    try {
      const response = await api.get(
        `/vehicles/check-availability?vehicleId=${vehicleId}`,
      );
      if (response.data?.success) {
        return { success: true, available: response.data.data === true };
      }
      return { success: false, available: false };
    } catch (error) {
      console.error("Error checking vehicle availability:", error);
      return { success: false, available: false };
    }
  },

  // Phân công đội cứu hộ cho nhiệm vụ
  // PUT /api/v1/missions/{missionId}/assign-team
  assignTeam: async (missionId, { rescueTeamId, missionRole, notes }) => {
    try {
      const response = await api.put(`/missions/${missionId}/assign-team`, {
        rescueTeamId,
        missionRole,
        notes,
      });
      if (response.data?.success) {
        return {
          success: true,
          message: response.data.message || "Phân công đội cứu hộ thành công",
          data: response.data.data,
        };
      }
      return {
        success: false,
        error: response.data?.message || "Phân công đội thất bại",
      };
    } catch (error) {
      console.error("Error assigning team:", error);
      return {
        success: false,
        error:
          error.response?.data?.message || "Không thể phân công đội cứu hộ",
      };
    }
  },

  // Gán phương tiện vào nhiệm vụ
  // POST /api/v1/missions/{missionId}/assign-vehicle
  // ⚠ Theo API.md §3.1: Sau khi gán thành công, Backend tự động đổi xe sang IN_USE.
  assignVehicle: async (missionId, vehicleId) => {
    try {
      const response = await api.post(`/missions/${missionId}/assign-vehicle`, {
        vehicleId,
      });
      if (response.data?.success) {
        return {
          success: true,
          message: response.data.message || "Gán phương tiện thành công",
          data: response.data.data,
        };
      }
      return {
        success: false,
        error: response.data?.message || "Gán phương tiện thất bại",
      };
    } catch (error) {
      console.error("Error assigning vehicle:", error);
      return {
        success: false,
        error: error.response?.data?.message || "Không thể gán phương tiện",
      };
    }
  },

  // Phân bổ vật tư vào nhiệm vụ
  // POST /api/v1/missions/{missionId}/assign-supplies
  // ⚠ Theo API.md §3.3: Backend sẽ TRỪ THẲNG tồn kho ngay khi gọi API này.
  //   HTTP 400 nếu vật tư INACTIVE hoặc số lượng vượt tồn kho thực tế.
  assignSupplies: async (missionId, { warehouseItemId, quantity }) => {
    try {
      const response = await api.post(`/missions/${missionId}/assign-supplies`, {
        warehouseItemId,
        quantity,
      });
      if (response.data?.success) {
        return {
          success: true,
          message: response.data.message || "Phân bổ vật tư thành công",
          data: response.data.data,
        };
      }
      return {
        success: false,
        error: response.data?.message || "Phân bổ vật tư thất bại",
      };
    } catch (error) {
      console.error("Error assigning supplies:", error);
      const status = error.response?.status;
      const msg = error.response?.data?.message;
      if (status === 400) {
        return {
          success: false,
          error:
            msg ||
            "Không thể phân bổ: Vật tư không hoạt động (INACTIVE) hoặc số lượng yêu cầu vượt mức tồn kho thực tế.",
        };
      }
      return {
        success: false,
        error: msg || error.message || "Không thể phân bổ vật tư cho nhiệm vụ",
      };
    }
  },
};

export default missionService;
