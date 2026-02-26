import axios from 'axios';

// Fix: Không dùng process.env trực tiếp
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const authService = {
  // MOCK LOGIN - Để test khi backend chưa sẵn sàng
  loginMock: async (credentials) => {
    console.log("🎭 Using MOCK login");
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock user database
    const mockUsers = {
      'admin@test.com': { 
        id: 1,
        role: 'ADMIN', 
        name: 'Admin User', 
        email: 'admin@test.com',
        avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff'
      },
      'coordinator@test.com': { 
        id: 2,
        role: 'RESCUE_COORDINATOR', 
        name: 'Coordinator User', 
        email: 'coordinator@test.com',
        avatar: 'https://ui-avatars.com/api/?name=Coordinator+User&background=F57C00&color=fff'
      },
      'manager@test.com': { 
        id: 3,
        role: 'MANAGER', 
        name: 'Manager User', 
        email: 'manager@test.com',
        avatar: 'https://ui-avatars.com/api/?name=Manager+User&background=2E7D32&color=fff'
      },
      'citizen@test.com': { 
        id: 4,
        role: 'CITIZEN', 
        name: 'Citizen User', 
        email: 'citizen@test.com',
        avatar: 'https://ui-avatars.com/api/?name=Citizen+User&background=0F52BA&color=fff'
      },
    };

    const userData = mockUsers[credentials.email];
    
    if (userData && credentials.password === '123456') {
      const mockToken = 'mock-jwt-token-' + Date.now();
      
      // Save to localStorage
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      console.log("✅ Mock login successful:", userData);
      
      return { 
        success: true, 
        user: userData,
        token: mockToken
      };
    } else {
      throw new Error("Email hoặc mật khẩu không đúng (Thử: citizen@test.com / 123456)");
    }
  },

  // REAL LOGIN - Khi backend sẵn sàng
  loginReal: async (credentials) => {
    try {
      console.log("📤 Sending real login request:", credentials);
      const response = await api.post('/auth/login', credentials);
      
      console.log("📦 API Response:", response.data);
      
      if (!response.data) {
        throw new Error("No data received from server");
      }

      // Parse response - Handle different structures
      let userData = null;
      let token = null;

      // Check different response structures
      if (response.data.user) {
        userData = response.data.user;
        token = response.data.token;
      } else if (response.data.data) {
        userData = response.data.data.user || response.data.data;
        token = response.data.data.token || response.data.token;
      } else if (response.data.role) {
        // User data directly in response
        userData = response.data;
        token = response.data.token;
      }

      // Save token
      if (token) {
        localStorage.setItem('token', token);
        console.log("💾 Token saved");
      }
      
      // Save user
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
        console.log("💾 User saved:", userData);
      } else {
        throw new Error("No user data in response");
      }
      
      return { 
        success: true, 
        user: userData,
        token: token
      };
    } catch (error) {
      console.error("🔥 Login error:", error);
      
      if (error.response) {
        console.error("🔥 Error response:", error.response.data);
        const errorMessage = error.response.data?.message 
          || error.response.data?.error 
          || "Đăng nhập thất bại";
        throw new Error(errorMessage);
      } else if (error.request) {
        throw new Error("Không thể kết nối đến server. Vui lòng kiểm tra kết nối.");
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
      const response = await api.post('/auth/register', userData);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Đăng ký thất bại";
      throw new Error(errorMessage);
    }
  },

  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      
      if (!userStr || userStr === 'undefined' || userStr === 'null') {
        return null;
      }
      
      const user = JSON.parse(userStr);
      console.log("✅ Current user:", user);
      return user;
    } catch (error) {
      console.error("💥 Error parsing user:", error);
      localStorage.removeItem('user');
      return null;
    }
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user && user !== 'undefined' && user !== 'null');
  }
};

export default authService;
