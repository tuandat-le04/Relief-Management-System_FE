import api from "./api";

/**
 * Admin Catalog Service
 * Quản lý các API liên quan đến catalog (danh mục) của Admin
 */

/**
 * Lấy danh sách tất cả vehicle types
 * @returns {Promise} Promise với danh sách vehicle types
 */
export const getAllVehicleTypes = async () => {
  try {
    const response = await api.get("/admin/catalog/vehicle-types");
    return response.data;
  } catch (error) {
    console.error("Error fetching vehicle types:", error);
    throw error;
  }
};

/**
 * Thêm vehicle type mới
 * @param {Object} vehicleTypeData - Dữ liệu vehicle type
 * @returns {Promise}
 */
export const createVehicleType = async (vehicleTypeData) => {
  try {
    const response = await api.post(
      "/admin/catalog/vehicle-types",
      vehicleTypeData,
    );
    return response.data;
  } catch (error) {
    console.error("Error creating vehicle type:", error);
    throw error;
  }
};

/**
 * Cập nhật vehicle type
 * @param {number} id - ID của vehicle type
 * @param {Object} vehicleTypeData - Dữ liệu cập nhật
 * @returns {Promise}
 */
export const updateVehicleType = async (id, vehicleTypeData) => {
  try {
    const response = await api.put(
      `/admin/catalog/vehicle-types/${id}`,
      vehicleTypeData,
    );
    return response.data;
  } catch (error) {
    console.error("Error updating vehicle type:", error);
    throw error;
  }
};

/**
 * Xóa vehicle type
 * @param {number} id - ID của vehicle type
 * @returns {Promise}
 */
export const deleteVehicleType = async (id) => {
  try {
    const response = await api.delete(`/admin/catalog/vehicle-types/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting vehicle type:", error);
    throw error;
  }
};

/**
 * Lấy danh sách vehicle types ACTIVE
 * @returns {Promise} Promise với danh sách vehicle types active
 */
export const getActiveVehicleTypes = async () => {
  try {
    const response = await api.get("/admin/catalog/vehicle-types/active");
    return response.data;
  } catch (error) {
    console.error("Error fetching active vehicle types:", error);
    throw error;
  }
};

// ==================== ITEMS API ====================

/**
 * Lấy danh sách tất cả items
 * @returns {Promise} Promise với danh sách items
 */
export const getAllItems = async () => {
  try {
    const response = await api.get("/admin/catalog/items");
    return response.data;
  } catch (error) {
    console.error("Error fetching items:", error);
    throw error;
  }
};

/**
 * Lấy item theo ID
 * @param {number} id - ID của item
 * @returns {Promise}
 */
export const getItemById = async (id) => {
  try {
    const response = await api.get(`/admin/catalog/items/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching item by ID:", error);
    throw error;
  }
};

/**
 * Tạo mới item
 * @param {Object} itemData - Dữ liệu item
 * @returns {Promise}
 */
export const createItem = async (itemData) => {
  try {
    const response = await api.post("/admin/catalog/items", itemData);
    return response.data;
  } catch (error) {
    console.error("Error creating item:", error);
    throw error;
  }
};

/**
 * Cập nhật item
 * @param {number} id - ID của item
 * @param {Object} itemData - Dữ liệu cập nhật
 * @returns {Promise}
 */
export const updateItem = async (id, itemData) => {
  try {
    const response = await api.put(`/admin/catalog/items/${id}`, itemData);
    return response.data;
  } catch (error) {
    console.error("Error updating item:", error);
    throw error;
  }
};

/**
 * Xóa item
 * @param {number} id - ID của item
 * @returns {Promise}
 */
export const deleteItem = async (id) => {
  try {
    const response = await api.delete(`/admin/catalog/items/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting item:", error);
    throw error;
  }
};

/**
 * Lấy danh sách items ACTIVE
 * @returns {Promise} Promise với danh sách items active
 */
export const getActiveItems = async () => {
  try {
    const response = await api.get("/admin/catalog/items/active");
    return response.data;
  } catch (error) {
    console.error("Error fetching active items:", error);
    throw error;
  }
};
