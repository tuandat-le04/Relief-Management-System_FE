import api from "./api";

// ─── Helper: Map API status → UI label ───────────────────────────────────────
export const mapVehicleStatusToUI = (apiStatus) => {
  switch (apiStatus) {
    case "AVAILABLE":
      return "ready";
    case "IN_USE":
      return "active";
    case "MAINTENANCE":
      return "maintenance";
    default:
      return "ready";
  }
};

// ─── Helper: Map UI status → API status ─────────────────────────────────────
export const mapUIStatusToAPI = (uiStatus) => {
  switch (uiStatus) {
    case "ready":
      return "AVAILABLE";
    case "active":
      return "IN_USE";
    case "maintenance":
      return "MAINTENANCE";
    default:
      return uiStatus; // passthrough nếu đã là API enum
  }
};

// ─── Helper: Map vehicle type string → UI category ───────────────────────────
export const mapVehicleType = (type) => {
  if (!type) return "other";
  const t = type.toUpperCase();
  if (t === "BOAT" || t === "CANO" || t === "SPEEDBOAT") return "cano";
  if (t === "TRUCK" || t === "VAN" || t === "CAR") return "xetai";
  if (t === "DRONE" || t === "UAV") return "drone";
  if (t === "HELICOPTER" || t === "AIRCRAFT") return "tructhang";
  return type.toLowerCase();
};

// ─── Helper: Transform dữ liệu từ API → format UI ─────────────────────────────
export const transformVehicle = (item) => ({
  id: item.vehicleId ?? item.id,
  code: item.licensePlate || `VH-${item.vehicleId ?? item.id}`,
  name: `${item.type || "Phương tiện"} ${item.licensePlate || ""}`.trim(),
  type: mapVehicleType(item.type),
  typeRaw: item.type, // giữ giá trị gốc để gọi API
  model: item.model || "",
  licensePlate: item.licensePlate || "",
  capacityPerson: item.capacityPerson ?? 0,
  depotId: item.depotId ?? null,
  status: mapVehicleStatusToUI(item.status),
  statusRaw: item.status, // AVAILABLE | IN_USE | MAINTENANCE
  // Các trường không có trong API — giữ giá trị mặc định
  team: item.teamName || "Chưa phân công",
  location: item.location || "Chưa cập nhật",
  fuel: item.fuelLevel ?? 100,
  driver: item.driverName || "Chưa có lái xe",
  lastUpdate: item.updatedAt
    ? new Date(item.updatedAt).toLocaleString("vi-VN")
    : "Vừa xong",
});

// ─────────────────────────────────────────────────────────────────────────────
//  vehicleService
// ─────────────────────────────────────────────────────────────────────────────
const vehicleService = {
  // ── GET /api/v1/vehicles ─────────────────────────────────────────────────
  getAllVehicles: async () => {
    try {
      const response = await api.get("/vehicles");
      if (response.data?.success && Array.isArray(response.data?.data)) {
        return {
          success: true,
          data: response.data.data.map(transformVehicle),
        };
      }
      if (response.data?.success && !response.data?.data) {
        return { success: true, data: [] };
      }
      return {
        success: false,
        error: response.data?.message || "Không thể tải danh sách phương tiện",
      };
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Không thể tải danh sách phương tiện",
      };
    }
  },

  // ── GET /api/v1/vehicles/{id} ─────────────────────────────────────────────
  getVehicleById: async (id) => {
    try {
      const response = await api.get(`/vehicles/${id}`);
      if (response.data?.success && response.data?.data) {
        return { success: true, data: transformVehicle(response.data.data) };
      }
      return { success: false, error: "Không tìm thấy phương tiện" };
    } catch (error) {
      console.error(`Error fetching vehicle ${id}:`, error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          "Không thể tải thông tin phương tiện",
      };
    }
  },

  // ── POST /api/v1/vehicles ─────────────────────────────────────────────────
  // Body: { depotId?, type, model?, licensePlate, capacityPerson, status }
  createVehicle: async ({
    depotId,
    type,
    model,
    licensePlate,
    capacityPerson,
    status,
  }) => {
    try {
      const body = {
        type,
        licensePlate,
        capacityPerson,
        status: status || "AVAILABLE",
      };
      if (depotId) body.depotId = depotId;
      if (model) body.model = model;

      const response = await api.post("/vehicles", body);
      if (response.data?.success) {
        return {
          success: true,
          message: response.data.message || "Tạo phương tiện thành công",
          data: response.data.data
            ? transformVehicle(response.data.data)
            : null,
        };
      }
      return {
        success: false,
        error: response.data?.message || "Tạo phương tiện thất bại",
      };
    } catch (error) {
      console.error("Error creating vehicle:", error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Không thể tạo phương tiện",
      };
    }
  },

  // ── PUT /api/v1/vehicles/{id} ─────────────────────────────────────────────
  // ⚠ Không cho phép chỉnh sửa khi status = IN_USE
  updateVehicle: async (
    id,
    { depotId, type, model, licensePlate, capacityPerson, status },
  ) => {
    try {
      const body = { type, licensePlate, capacityPerson };
      if (depotId !== undefined) body.depotId = depotId;
      if (model !== undefined) body.model = model;
      if (status !== undefined) body.status = status;

      const response = await api.put(`/vehicles/${id}`, body);
      if (response.data?.success) {
        return {
          success: true,
          message: response.data.message || "Cập nhật phương tiện thành công",
          data: response.data.data
            ? transformVehicle(response.data.data)
            : null,
        };
      }
      return {
        success: false,
        error: response.data?.message || "Cập nhật thất bại",
      };
    } catch (error) {
      console.error(`Error updating vehicle ${id}:`, error);
      const msg = error.response?.data?.message || error.message;
      return {
        success: false,
        error: msg || "Không thể cập nhật phương tiện",
      };
    }
  },

  // ── DELETE /api/v1/vehicles/{id} ──────────────────────────────────────────
  // ⚠ Không cho phép xóa khi status = IN_USE
  deleteVehicle: async (id) => {
    try {
      const response = await api.delete(`/vehicles/${id}`);
      if (response.data?.success) {
        return {
          success: true,
          message: response.data.message || "Xóa phương tiện thành công",
        };
      }
      return {
        success: false,
        error: response.data?.message || "Xóa thất bại",
      };
    } catch (error) {
      console.error(`Error deleting vehicle ${id}:`, error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Không thể xóa phương tiện",
      };
    }
  },

  // ── PUT /api/v1/vehicles/{id}/status ─────────────────────────────────────
  // status: "AVAILABLE" | "IN_USE" | "MAINTENANCE"
  updateVehicleStatus: async (id, status) => {
    try {
      const response = await api.put(`/vehicles/${id}/status`, { status });
      if (response.data?.success) {
        return {
          success: true,
          message: response.data.message || "Cập nhật trạng thái thành công",
          data: response.data.data
            ? transformVehicle(response.data.data)
            : null,
        };
      }
      return {
        success: false,
        error: response.data?.message || "Cập nhật trạng thái thất bại",
      };
    } catch (error) {
      console.error(`Error updating vehicle status ${id}:`, error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Không thể cập nhật trạng thái",
      };
    }
  },

  // ── GET /api/v1/vehicles/status/{status} ──────────────────────────────────
  // status: "AVAILABLE" | "IN_USE" | "MAINTENANCE"
  getVehiclesByStatus: async (status) => {
    try {
      const response = await api.get(`/vehicles/status/${status}`);
      if (response.data?.success && Array.isArray(response.data?.data)) {
        return {
          success: true,
          data: response.data.data.map(transformVehicle),
        };
      }
      if (response.data?.success) {
        return { success: true, data: [] };
      }
      return {
        success: false,
        error: response.data?.message || "Không thể lọc phương tiện",
      };
    } catch (error) {
      console.error(`Error fetching vehicles by status ${status}:`, error);
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Không thể lọc phương tiện",
      };
    }
  },

  // ── GET /api/v1/vehicles/check-availability?vehicleId={id} ───────────────
  checkAvailability: async (vehicleId) => {
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

  // ── GET /api/v1/vehicles/any-available ────────────────────────────────────
  anyAvailable: async () => {
    try {
      const response = await api.get("/vehicles/any-available");
      if (response.data?.success) {
        return { success: true, available: response.data.data === true };
      }
      return { success: false, available: false };
    } catch (error) {
      console.error("Error checking any available vehicle:", error);
      return { success: false, available: false };
    }
  },
};

export default vehicleService;
