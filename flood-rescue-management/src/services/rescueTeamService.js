import api from "./api";

// ─── Haversine formula — tính khoảng cách (km) giữa 2 tọa độ ────────────────
export const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // km
};

const rescueTeamService = {
  // ── GET /api/v1/rescue-teams/available ───────────────────────────────────
  // Lấy danh sách đội đang ACTIVE (sẵn sàng nhận nhiệm vụ)
  getAvailableTeams: async () => {
    try {
      const response = await api.get("/rescue-teams/available");
      if (response.data?.success && Array.isArray(response.data?.data)) {
        return { success: true, data: response.data.data };
      }
      return {
        success: false,
        error:
          response.data?.message ||
          "Không thể tải danh sách đội cứu hộ",
      };
    } catch (error) {
      console.error("Error fetching available rescue teams:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Không thể tải danh sách đội cứu hộ",
      };
    }
  },

  // ── GET /api/v1/rescue-teams ─────────────────────────────────────────────
  // Lấy tất cả đội (kể cả BUSY, INACTIVE) — dự phòng nếu cần
  getAllTeams: async () => {
    try {
      const response = await api.get("/rescue-teams");
      if (response.data?.success && Array.isArray(response.data?.data)) {
        return { success: true, data: response.data.data };
      }
      return {
        success: false,
        error:
          response.data?.message ||
          "Không thể tải danh sách đội cứu hộ",
      };
    } catch (error) {
      console.error("Error fetching all rescue teams:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Không thể tải danh sách đội cứu hộ",
      };
    }
  },

  // ── GET /api/v1/team-positions/team/{rescueTeamId} ───────────────────────
  // Lấy vị trí GPS mới nhất của một đội
  // Returns: { success, data: { latitude, longitude } } hoặc { success: false, notFound: true }
  getTeamPosition: async (rescueTeamId) => {
    try {
      const response = await api.get(
        `/team-positions/team/${rescueTeamId}`,
      );
      if (response.data?.success && response.data?.data) {
        return { success: true, data: response.data.data };
      }
      return { success: false, notFound: true };
    } catch (error) {
      // 404 = đội chưa từng cập nhật GPS — không phải lỗi thật
      if (error.response?.status === 404) {
        return { success: false, notFound: true };
      }
      console.error(
        `Error fetching position for team ${rescueTeamId}:`,
        error,
      );
      return { success: false, notFound: true };
    }
  },

  // ── Lấy vị trí GPS cho nhiều đội song song ──────────────────────────────
  // teams: mảng team objects có field `id`
  // Trả về map: { [teamId]: { latitude, longitude } | null }
  getTeamPositions: async (teams) => {
    const entries = await Promise.all(
      teams.map(async (team) => {
        const result = await rescueTeamService.getTeamPosition(team.id);
        if (result.success && result.data) {
          return [team.id, result.data];
        }
        return [team.id, null];
      }),
    );
    return Object.fromEntries(entries);
  },
};

export default rescueTeamService;
