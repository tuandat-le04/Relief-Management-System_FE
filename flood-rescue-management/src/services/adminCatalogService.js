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
