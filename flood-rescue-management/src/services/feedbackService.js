import api from "./api";

const feedbackService = {
  // GET /api/v1/feedbacks
  getAllFeedbacks: async () => {
    try {
      const response = await api.get("/feedbacks");
      if (response.data?.success) {
        const list = Array.isArray(response.data?.data)
          ? response.data.data
          : response.data?.data
            ? [response.data.data]
            : [];
        return { success: true, data: list };
      }
      return {
        success: false,
        error: response.data?.message || "Không thể tải phản hồi",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Không thể tải phản hồi",
      };
    }
  },
};

export default feedbackService;
