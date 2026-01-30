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

      // Lưu token và thông tin user vào localStorage
      if (response.data.success && response.data.data) {
        const { token, refreshToken, userId, email, role } = response.data.data;

        localStorage.setItem("accessToken", token);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify({ userId, email, role }));
      }

      return response.data;
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
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },
};

export default authService;
