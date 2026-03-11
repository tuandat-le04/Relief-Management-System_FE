import api from "./api";

// ===== WAREHOUSE API SERVICE =====

/**
 * Lấy danh sách tất cả warehouses
 * GET /api/v1/warehouses
 */
export const getAllWarehouses = async () => {
  try {
    const response = await api.get("/warehouses");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách warehouses:", error);
    throw error;
  }
};

/**
 * Tạo mới warehouse
 * POST /api/v1/warehouses
 * @param {Object} warehouseData - { userId, resourceId, supplyId, status }
 */
export const createWarehouse = async (warehouseData) => {
  try {
    const response = await api.post("/warehouses", warehouseData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo warehouse:", error);
    throw error;
  }
};

/**
 * Lấy warehouse theo ID
 * GET /api/v1/warehouses/{id}
 * @param {number} id - ID của warehouse
 */
export const getWarehouseById = async (id) => {
  try {
    const response = await api.get(`/warehouses/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy warehouse ${id}:`, error);
    throw error;
  }
};

/**
 * Lấy inventory của warehouse
 * GET /api/v1/warehouses/{id}/inventory
 * @param {number} id - ID của warehouse
 */
export const getWarehouseInventory = async (id) => {
  try {
    const response = await api.get(`/warehouses/${id}/inventory`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy inventory của warehouse ${id}:`, error);
    throw error;
  }
};

/**
 * Nhập kho (Inventory In)
 * POST /api/v1/warehouses/{id}/inventory/in
 * @param {number} id - ID của warehouse
 * @param {Object} data - { itemId, quantity }
 */
export const inventoryIn = async (id, data) => {
  try {
    const response = await api.post(`/warehouses/${id}/inventory/in`, data);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi nhập kho vào warehouse ${id}:`, error);
    throw error;
  }
};

/**
 * Xuất kho (Inventory Out)
 * POST /api/v1/warehouses/{id}/inventory/out
 * @param {number} id - ID của warehouse
 * @param {Object} data - { itemId, quantity }
 */
export const inventoryOut = async (id, data) => {
  try {
    const response = await api.post(`/warehouses/${id}/inventory/out`, data);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi xuất kho từ warehouse ${id}:`, error);
    throw error;
  }
};

/**
 * Cập nhật trạng thái warehouse (nếu cần)
 * PUT /api/v1/warehouses/{id}
 * @param {number} id - ID của warehouse
 * @param {Object} updateData - Dữ liệu cần cập nhật
 */
export const updateWarehouse = async (id, updateData) => {
  try {
    const response = await api.put(`/warehouses/${id}`, updateData);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi cập nhật warehouse ${id}:`, error);
    throw error;
  }
};

/**
 * Xóa warehouse (nếu cần)
 * DELETE /api/v1/warehouses/{id}
 * @param {number} id - ID của warehouse
 */
export const deleteWarehouse = async (id) => {
  try {
    const response = await api.delete(`/warehouses/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi xóa warehouse ${id}:`, error);
    throw error;
  }
};

/**
 * Ghi nhận phân phối hàng cứu trợ
 * POST /api/v1/relief-distributions
 * @param {Object} data - { missionId, inventoryId, quantity, householdIdentifier, isConfirmed }
 */
export const createReliefDistribution = async (data) => {
  try {
    const response = await api.post("/relief-distributions", data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi ghi nhận phân phối cứu trợ:", error);
    throw error;
  }
};

export default {
  getAllWarehouses,
  createWarehouse,
  getWarehouseById,
  getWarehouseInventory,
  inventoryIn,
  inventoryOut,
  updateWarehouse,
  deleteWarehouse,
  createReliefDistribution,
};

// ─── Helper functions cho AssignMissionModal ─────────────────────────────────

/**
 * Lấy danh sách kho — trả về { success, data, error }
 * GET /api/v1/warehouses
 */
export const getWarehousesForModal = async () => {
  try {
    const response = await api.get("/warehouses");
    if (response.data?.success && Array.isArray(response.data.data)) {
      return { success: true, data: response.data.data };
    }
    if (response.data?.success) return { success: true, data: [] };
    return {
      success: false,
      error: response.data?.message || "Không thể tải danh sách kho",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Không thể tải danh sách kho",
    };
  }
};

/**
 * Lấy inventory của kho — trả về { success, data, error }
 * GET /api/v1/warehouses/{id}/inventory
 * ⚠ Normalize typo của backend: `iventoryId` (thiếu 'n') → `inventoryId`
 */
export const getInventoryForModal = async (warehouseId) => {
  try {
    const response = await api.get(`/warehouses/${warehouseId}/inventory`);
    if (response.data?.success) {
      const raw = response.data.data?.items ?? [];
      const items = raw.map((item) => ({
        ...item,
        // backend typo: "iventoryId" → chuẩn hoá về inventoryId
        inventoryId: item.iventoryId ?? item.inventoryId ?? item.itemId,
      }));
      return { success: true, data: items };
    }
    return {
      success: false,
      error: response.data?.message || "Không thể tải tồn kho",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Không thể tải tồn kho",
    };
  }
};
