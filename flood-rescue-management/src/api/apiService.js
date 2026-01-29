import axiosInstance from "./axiosConfig";

// ==================== AUTH API ====================
export const authAPI = {
  login: (credentials) => axiosInstance.post("/auth/login", credentials),
  register: (userData) => axiosInstance.post("/auth/register", userData),
  logout: () => axiosInstance.post("/auth/logout"),
  getCurrentUser: () => axiosInstance.get("/auth/me"),
  forgotPassword: (email) =>
    axiosInstance.post("/auth/forgot-password", { email }),
  resetPassword: (token, newPassword) =>
    axiosInstance.post("/auth/reset-password", { token, newPassword }),
};

// ==================== RESCUE REQUEST API ====================
export const rescueRequestAPI = {
  // Citizen
  create: (data) => axiosInstance.post("/rescue-requests", data),
  getMyRequests: (params) =>
    axiosInstance.get("/rescue-requests/my-requests", { params }),
  getById: (id) => axiosInstance.get(`/rescue-requests/${id}`),
  update: (id, data) => axiosInstance.put(`/rescue-requests/${id}`, data),
  cancel: (id) => axiosInstance.patch(`/rescue-requests/${id}/cancel`),

  // Coordinator
  getPending: (params) =>
    axiosInstance.get("/rescue-requests/pending", { params }),
  verify: (id, data) =>
    axiosInstance.patch(`/rescue-requests/${id}/verify`, data),
  setPriority: (id, priority) =>
    axiosInstance.patch(`/rescue-requests/${id}/priority`, { priority }),
  assignTeam: (id, teamId) =>
    axiosInstance.patch(`/rescue-requests/${id}/assign`, { teamId }),

  // Rescue Team
  getAssigned: (params) =>
    axiosInstance.get("/rescue-requests/assigned", { params }),
  updateStatus: (id, status) =>
    axiosInstance.patch(`/rescue-requests/${id}/status`, { status }),
  addReport: (id, report) =>
    axiosInstance.post(`/rescue-requests/${id}/reports`, report),

  // Common
  getAll: (params) => axiosInstance.get("/rescue-requests", { params }),
  getStatistics: (params) =>
    axiosInstance.get("/rescue-requests/statistics", { params }),
};

// ==================== RESCUE TEAM API ====================
export const rescueTeamAPI = {
  getAll: (params) => axiosInstance.get("/rescue-teams", { params }),
  getById: (id) => axiosInstance.get(`/rescue-teams/${id}`),
  create: (data) => axiosInstance.post("/rescue-teams", data),
  update: (id, data) => axiosInstance.put(`/rescue-teams/${id}`, data),
  delete: (id) => axiosInstance.delete(`/rescue-teams/${id}`),
  getAvailable: (params) =>
    axiosInstance.get("/rescue-teams/available", { params }),
  getMembers: (teamId) => axiosInstance.get(`/rescue-teams/${teamId}/members`),
  addMember: (teamId, userId) =>
    axiosInstance.post(`/rescue-teams/${teamId}/members`, { userId }),
  removeMember: (teamId, userId) =>
    axiosInstance.delete(`/rescue-teams/${teamId}/members/${userId}`),
};

// ==================== VEHICLE API ====================
export const vehicleAPI = {
  getAll: (params) => axiosInstance.get("/vehicles", { params }),
  getById: (id) => axiosInstance.get(`/vehicles/${id}`),
  create: (data) => axiosInstance.post("/vehicles", data),
  update: (id, data) => axiosInstance.put(`/vehicles/${id}`, data),
  delete: (id) => axiosInstance.delete(`/vehicles/${id}`),
  getAvailable: (params) =>
    axiosInstance.get("/vehicles/available", { params }),
  assign: (id, data) => axiosInstance.patch(`/vehicles/${id}/assign`, data),
  updateStatus: (id, status) =>
    axiosInstance.patch(`/vehicles/${id}/status`, { status }),
  getHistory: (id, params) =>
    axiosInstance.get(`/vehicles/${id}/history`, { params }),
};

// ==================== RELIEF SUPPLY API ====================
export const reliefSupplyAPI = {
  getAll: (params) => axiosInstance.get("/relief-supplies", { params }),
  getById: (id) => axiosInstance.get(`/relief-supplies/${id}`),
  create: (data) => axiosInstance.post("/relief-supplies", data),
  update: (id, data) => axiosInstance.put(`/relief-supplies/${id}`, data),
  delete: (id) => axiosInstance.delete(`/relief-supplies/${id}`),
  updateInventory: (id, data) =>
    axiosInstance.patch(`/relief-supplies/${id}/inventory`, data),
  distribute: (data) => axiosInstance.post("/relief-supplies/distribute", data),
  getDistributionHistory: (params) =>
    axiosInstance.get("/relief-supplies/distribution-history", { params }),
  getLowStock: () => axiosInstance.get("/relief-supplies/low-stock"),
};

// ==================== USER API ====================
export const userAPI = {
  getAll: (params) => axiosInstance.get("/users", { params }),
  getById: (id) => axiosInstance.get(`/users/${id}`),
  create: (data) => axiosInstance.post("/users", data),
  update: (id, data) => axiosInstance.put(`/users/${id}`, data),
  delete: (id) => axiosInstance.delete(`/users/${id}`),
  updateStatus: (id, status) =>
    axiosInstance.patch(`/users/${id}/status`, { status }),
  updateRole: (id, roleId) =>
    axiosInstance.patch(`/users/${id}/role`, { roleId }),
  changePassword: (id, data) =>
    axiosInstance.patch(`/users/${id}/change-password`, data),
};

// ==================== NOTIFICATION API ====================
export const notificationAPI = {
  getMyNotifications: (params) =>
    axiosInstance.get("/notifications", { params }),
  getUnreadCount: () => axiosInstance.get("/notifications/unread-count"),
  markAsRead: (id) => axiosInstance.patch(`/notifications/${id}/read`),
  markAllAsRead: () => axiosInstance.patch("/notifications/read-all"),
  delete: (id) => axiosInstance.delete(`/notifications/${id}`),
};

// ==================== REPORT API ====================
export const reportAPI = {
  getSystemReport: (params) => axiosInstance.get("/reports/system", { params }),
  getActivityReport: (params) =>
    axiosInstance.get("/reports/activity", { params }),
  getDashboardStats: (role) => axiosInstance.get(`/reports/dashboard/${role}`),
  exportReport: (type, params) =>
    axiosInstance.get(`/reports/export/${type}`, {
      params,
      responseType: "blob",
    }),
};
