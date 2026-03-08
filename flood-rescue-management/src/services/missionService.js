import api from "./api";

const missionService = {
  // Lấy mission theo requestId
  getMissionByRequestId: async (requestId) => {
    try {
      const response = await api.get(`/missions?requestId=${requestId}`);
      if (response.data?.success) {
        const missions = response.data.data;
        const mission = Array.isArray(missions) ? missions[0] : missions;
        return { success: true, data: mission || null };
      }
      return { success: false, error: "Không tìm thấy nhiệm vụ" };
    } catch (error) {
      console.error("Error fetching mission by requestId:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Không thể tải thông tin nhiệm vụ",
      };
    }
  },

  // Kiểm tra tình trạng phương tiện
  // Returns: { success, available: true|false }
  checkVehicleAvailability: async (vehicleId) => {
    try {
      const response = await api.get(
        `/vehicles/check-availability?vehicleId=${vehicleId}`
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
          message:
            response.data.message || "Phân công đội cứu hộ thành công",
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
          error.response?.data?.message ||
          "Không thể phân công đội cứu hộ",
      };
    }
  },

  // Gán phương tiện vào nhiệm vụ
  // POST /api/v1/missions/{missionId}/assign-vehicle
  assignVehicle: async (missionId, vehicleId) => {
    try {
      const response = await api.post(
        `/missions/${missionId}/assign-vehicle`,
        { vehicleId }
      );
      if (response.data?.success) {
        return {
          success: true,
          message:
            response.data.message || "Gán phương tiện thành công",
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
        error:
          error.response?.data?.message || "Không thể gán phương tiện",
      };
    }
  },

  // Cập nhật trạng thái nhiệm vụ
  // PATCH /api/v1/missions/{id}/status
  // Body: { status: "ARRIVED" | "COMPLETED" | ... }
  updateMissionStatus: async (missionId, status) => {
    try {
      const response = await api.patch(`/missions/${missionId}/status`, {
        status,
      });

      if (response.data?.success) {
        return {
          success: true,
          message: response.data.message || "Cập nhật trạng thái nhiệm vụ thành công",
          data: response.data.data,
        };
      }

      return {
        success: false,
        error: response.data?.message || "Cập nhật trạng thái nhiệm vụ thất bại",
      };
    } catch (error) {
      console.error("Error updating mission status:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Không thể cập nhật trạng thái nhiệm vụ",
      };
    }
  },
};

export default missionService;
