import api from "./api";

const authService = {
  /**
   * Đăng ký tài khoản mới
   * @param {Object} data - { fullName, email, phoneNumber, password, role }
   * @returns {Promise}
   */
  register: async (data) => {
    try {
      const response = await api.post("/auth/register", data);
      return response.data;
    } catch (error) {
      console.error("Register API error:", error.response || error);

      // Extract error message
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Đăng ký thất bại";

      throw new Error(errorMessage);
    }
  },

  /**
   * Đăng nhập
   * @param {Object} credentials - { email, password }
   * @returns {Promise}
   */
  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);

      // Lưu token
      localStorage.setItem("token", response.data.token);

      // Lưu user info (quan trọng!)
      localStorage.setItem("user", JSON.stringify(response.data.user));

      return { success: true, user: response.data.user };
    } catch (error) {
      console.error("Login API error:", error.response || error);

      // Extract error message
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Đăng nhập thất bại";

      throw new Error(errorMessage);
    }
  },

  /**
   * Đăng xuất
   */
  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  },

  /**
   * Lấy thông tin profile người dùng
   * @returns {Promise}
   */
  getProfile: async () => {
    try {
      const response = await api.get("/auth/profile");
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Cập nhật profile
   * @param {Object} data - { fullName, phoneNumber }
   * @returns {Promise}
   */
  updateProfile: async (data) => {
    try {
      const response = await api.put("/auth/profile", data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Kiểm tra người dùng đã đăng nhập chưa
   * @returns {boolean}
   */
  isAuthenticated: () => {
    return !!localStorage.getItem("accessToken");
  },

  /**
   * Lấy thông tin user từ localStorage
   * @returns {Object|null}
   */
  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) return null;

      const user = JSON.parse(userStr);
      console.log("getCurrentUser:", user); // Debug
      return user;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  },
};

export default authService;
