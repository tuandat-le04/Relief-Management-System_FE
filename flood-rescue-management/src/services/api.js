import axios from "axios";

// Tạo axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
});

// Request interceptor - Thêm token vào mỗi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Token chưa có – user chưa đăng nhập hoặc localStorage trống
      console.warn("[api] No token found in localStorage for request:", config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - Xử lý lỗi và refresh token
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa retry
    // Tạm thời KHÔNG tự động xóa token + redirect để tránh bị "đá" khi reload trang.
    // Có thể triển khai refresh token tại đây nếu backend hỗ trợ.
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // TODO: refresh token (nếu có API), sau đó retry:
      // const refreshToken = localStorage.getItem("refreshToken");
      // const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken });
      // localStorage.setItem("token", response.data.token);
      // return api(originalRequest);
    }

    return Promise.reject(error);
  },
);

export default api;

