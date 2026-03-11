import api from "./api";

/**
 * Service để quản lý các API liên quan đến người dùng
 */

/**
 * Lấy danh sách tất cả người dùng trong hệ thống (Admin)
 * @returns {Promise} Response chứa danh sách người dùng
 */
export const getAllUsers = async () => {
  try {
    const response = await api.get("/admin/users");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    throw error;
  }
};

/**
 * Lấy thông tin chi tiết của một người dùng
 * @param {number} userId - ID của người dùng
 * @returns {Promise} Response chứa thông tin người dùng
 */
export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi lấy thông tin người dùng ${userId}:`, error);
    throw error;
  }
};

/**
 * Tạo người dùng mới
 * @param {Object} userData - Dữ liệu người dùng mới
 * @returns {Promise} Response chứa thông tin người dùng đã tạo
 */
export const createUser = async (userData) => {
  try {
    const response = await api.post("/admin/users", userData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo người dùng mới:", error);
    throw error;
  }
};

/**
 * Cập nhật thông tin người dùng
 * @param {number} userId - ID của người dùng
 * @param {Object} userData - Dữ liệu cập nhật
 * @returns {Promise} Response chứa thông tin người dùng đã cập nhật
 */
export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi cập nhật người dùng ${userId}:`, error);
    throw error;
  }
};

/**
 * Xóa người dùng
 * @param {number} userId - ID của người dùng cần xóa
 * @returns {Promise} Response xác nhận xóa thành công
 */
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi xóa người dùng ${userId}:`, error);
    throw error;
  }
};

/**
 * Kích hoạt/vô hiệu hóa tài khoản người dùng
 * @param {number} userId - ID của người dùng
 * @param {boolean} isActive - Trạng thái kích hoạt
 * @returns {Promise} Response xác nhận cập nhật trạng thái
 */
export const toggleUserStatus = async (userId, isActive) => {
  try {
    const response = await api.patch(`/admin/users/${userId}/status`, {
      isActive,
    });
    return response.data;
  } catch (error) {
    console.error(`Lỗi khi thay đổi trạng thái người dùng ${userId}:`, error);
    throw error;
  }
};

export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
};
