import axios from "axios";
import avatarUser from "../assets/images/avatar-user.png";

// Fix: Không dùng process.env trực tiếp
const API_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

const authService = {
  // MOCK LOGIN - Để test khi backend chưa sẵn sàng
  loginMock: async (credentials) => {
    console.log("🎭 Using MOCK login");

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock user database
    const mockUsers = {
      "admin@test.com": {
        id: 1,
        role: "ADMIN",
        name: "Admin User",
        email: "admin@test.com",
        avatar: avatarUser,
      },
      "coordinator@test.com": {
        id: 2,
        role: "RESCUE_COORDINATOR",
        name: "Coordinator User",
        email: "coordinator@test.com",
        avatar: avatarUser,
      },
      "manager@test.com": {
        id: 3,
        role: "MANAGER",
        name: "Manager User",
        email: "manager@test.com",
        avatar: avatarUser,
      },
      "citizen@test.com": {
        id: 4,
        role: "CITIZEN",
        name: "Citizen User",
        email: "citizen@test.com",
        avatar: avatarUser,
      },
    };

    const userData = mockUsers[credentials.email];

    if (userData && credentials.password === "123456") {
      const mockToken = "mock-jwt-token-" + Date.now();

      // Save to localStorage
      localStorage.setItem("token", mockToken);
      localStorage.setItem("user", JSON.stringify(userData));

      console.log("✅ Mock login successful:", userData);

      return {
        success: true,
        user: userData,
        token: mockToken,
      };
    } else {
      throw new Error(
        "Email hoặc mật khẩu không đúng (Thử: citizen@test.com / 123456)",
      );
    }
  },

  // REAL LOGIN - Khi backend sẵn sàng
  loginReal: async (credentials) => {
    try {
      console.log("📤 Sending real login request:", credentials);
      const response = await api.post("/auth/login", credentials);

      console.log("📦 Login API Response:", response.data);

      if (!response.data) {
        throw new Error("No data received from server");
      }

      // Lấy token từ nhiều cấu trúc response khác nhau
      let token =
        response.data.token ||
        response.data.accessToken ||
        (response.data.data &&
          (response.data.data.token || response.data.data.accessToken));

      if (!token) {
        throw new Error("Không nhận được token từ server");
      }

      // Lưu token trước để gọi được /auth/profile
      localStorage.setItem("token", token);
      console.log("💾 Token saved");

      // Thử gọi API lấy profile để có đủ fullName, phone, v.v.
      let userData = null;
      try {
        const profileResponse = await api.get("/auth/profile");
        console.log("📦 Profile API Response:", profileResponse.data);

        // Thường backend sẽ bọc trong data, nếu không thì lấy trực tiếp
        userData = profileResponse.data?.data || profileResponse.data || null;
      } catch (profileError) {
        console.error("🔥 Profile fetch error:", profileError);

        // Nếu gọi profile lỗi, fallback lại các field từ response login cũ
        if (response.data.user) {
          userData = response.data.user;
        } else if (response.data.data) {
          userData = response.data.data.user || response.data.data;
        } else if (response.data.role) {
          userData = response.data;
        } else {
          userData = null;
        }
      }

      if (!userData) {
        throw new Error("No user data in response");
      }

      // Lưu user vào localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      console.log("💾 User saved:", userData);

      return {
        success: true,
        user: userData,
        token: token,
      };
    } catch (error) {
      console.error("🔥 Login error:", error);

      if (error.response) {
        console.error("🔥 Error response:", error.response.data);
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          "Đăng nhập thất bại";
        throw new Error(errorMessage);
      } else if (error.request) {
        throw new Error(
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối.",
        );
      } else {
        throw new Error(error.message || "Đăng nhập thất bại");
      }
    }
  },

  // Main login function - Switch between mock and real
  login: async (credentials) => {
    // Dùng backend thật
    return authService.loginReal(credentials);

    // Dùng mock login để test (không cần backend):
    // return authService.loginMock(credentials);
  },

  register: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Đăng ký thất bại";
      throw new Error(errorMessage);
    }
  },

  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem("user");

      if (!userStr || userStr === "undefined" || userStr === "null") {
        return null;
      }

      const user = JSON.parse(userStr);
      console.log("✅ Current user:", user);
      return user;
    } catch (error) {
      console.error("💥 Error parsing user:", error);
      localStorage.removeItem("user");
      return null;
    }
  },

  getToken: () => {
    return localStorage.getItem("token");
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  isAuthenticated: () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    return !!(token && user && user !== "undefined" && user !== "null");
  },
};

export default authService;
