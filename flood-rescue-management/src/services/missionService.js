import api from "./api";

const MISSIONS_CACHE_TTL_MS = 60 * 1000;
const MISSIONS_REQUEST_TIMEOUT_MS = 25000;
let missionsCache = {
  data: [],
  fetchedAt: 0,
};

const extractMissionRequestId = (mission) =>
  mission?.requestId ?? mission?.requestID ?? mission?.request?.id ?? null;

const isTerminalMissionStatus = (status) =>
  status === "COMPLETED" || status === "CANCELLED";

const missionService = {
  // ── GET /api/v1/missions/active-teams ────────────────────────────────────
  // API chính cho màn theo dõi coordinator: team + mission + vehicles + supplies
  getActiveTeamMissions: async () => {
    try {
      const response = await api.get("/missions/active-teams");
      if (response.data?.success) {
        const list = Array.isArray(response.data?.data)
          ? response.data.data
          : [];
        return { success: true, data: list };
      }
      return {
        success: false,
        error:
          response.data?.message ||
          "Không thể tải danh sách đội đang hoạt động",
      };
    } catch (error) {
      console.error("Error fetching active team missions:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Không thể tải danh sách đội đang hoạt động",
      };
    }
  },

  // ── GET /api/v1/missions ─────────────────────────────────────────────────
  // Lấy toàn bộ nhiệm vụ (dành cho Coordinator/Admin)
  getAllMissions: async ({ force = false } = {}) => {
    try {
      const now = Date.now();
      const hasFreshCache =
        !force &&
        Array.isArray(missionsCache.data) &&
        missionsCache.data.length > 0 &&
        now - missionsCache.fetchedAt < MISSIONS_CACHE_TTL_MS;

      if (hasFreshCache) {
        return { success: true, data: missionsCache.data, cached: true };
      }

      const response = await api.get("/missions", {
        timeout: MISSIONS_REQUEST_TIMEOUT_MS,
      });
      if (response.data?.success) {
        const list = Array.isArray(response.data?.data)
          ? response.data.data
          : [];
        missionsCache = { data: list, fetchedAt: Date.now() };
        return { success: true, data: list };
      }
      return {
        success: false,
        error: response.data?.message || "Không thể tải danh sách nhiệm vụ",
      };
    } catch (error) {
      const isTimeout =
        error?.code === "ECONNABORTED" ||
        String(error?.message || "")
          .toLowerCase()
          .includes("timeout");

      if (Array.isArray(missionsCache.data) && missionsCache.data.length > 0) {
        console.warn(
          "getAllMissions timeout/error, fallback to cached missions.",
        );
        return {
          success: true,
          data: missionsCache.data,
          cached: true,
          stale: true,
        };
      }

      if (isTimeout) {
        console.warn("getAllMissions timeout with no cache.");
      } else {
        console.error("Error fetching all missions:", error);
      }

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
      if (peopleRescued !== undefined) {
        body.peopleRescued = peopleRescued;
        // Fallback alias cho backend dùng naming khác
        body.rescuedCount = peopleRescued;
      }
      if (summary !== undefined) {
        body.summary = summary;
        // Fallback alias cho backend dùng naming khác
        body.description = summary;
        body.reportSummary = summary;
        body.report = summary;
      }
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
        const payload = response.data?.data;
        const list = Array.isArray(payload)
          ? payload
          : payload
            ? [payload]
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
      const targetRequestId = Number(requestId);

      // Một số backend có thể bỏ qua query `requestId`, nên luôn filter lại ở FE.
      // Ưu tiên gọi endpoint query trước để giảm payload.
      const response = await api.get(`/missions?requestId=${requestId}`);

      if (response.data?.success) {
        let missions = Array.isArray(response.data?.data)
          ? response.data.data
          : response.data?.data
            ? [response.data.data]
            : [];

        missions = missions.filter((m) => {
          const mReqId = Number(extractMissionRequestId(m));
          return Number.isFinite(targetRequestId)
            ? mReqId === targetRequestId
            : String(extractMissionRequestId(m)) === String(requestId);
        });

        if (missions.length === 0) {
          const allRes = await missionService.getAllMissions();
          if (allRes.success) {
            missions = allRes.data.filter((m) => {
              const mReqId = Number(extractMissionRequestId(m));
              return Number.isFinite(targetRequestId)
                ? mReqId === targetRequestId
                : String(extractMissionRequestId(m)) === String(requestId);
            });
          }
        }

        // Ưu tiên mission chưa kết thúc, sau đó chọn mission mới nhất.
        const sorted = [...missions].sort((a, b) => {
          const aTime = new Date(a?.updatedAt || a?.createdAt || 0).getTime();
          const bTime = new Date(b?.updatedAt || b?.createdAt || 0).getTime();
          if (aTime !== bTime) return bTime - aTime;
          return (b?.id || 0) - (a?.id || 0);
        });

        const mission =
          sorted.find((m) => !isTerminalMissionStatus(m?.status)) ||
          sorted[0] ||
          null;

        return { success: true, data: mission };
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

  // Gán vật tư vào nhiệm vụ — gọi 1 lần cho mỗi item
  // POST /api/v1/missions/{missionId}/supplies
  // Body: { inventoryId, quantity }
  // ⚠ Backend sẽ TRỪ THẲNG tồn kho. HTTP 400 nếu INACTIVE hoặc vượt tồn kho.
  assignSupplies: async (missionId, { inventoryId, quantity }) => {
    try {
      const response = await api.post(`/missions/${missionId}/supplies`, {
        inventoryId,
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
