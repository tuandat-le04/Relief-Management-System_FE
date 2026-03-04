import axios from "axios";

// Sử dụng key riêng cho Goong Geocoding, nếu không có thì fallback sang key maptiles
const GOONG_API_KEY =
  import.meta.env.VITE_GOONG_API_KEY || import.meta.env.VITE_GOONG_MAPTILES_KEY;

const geocodingService = {
  /**
   * Reverse geocoding: lat, lng -> địa chỉ text (Goong)
   */
  reverseGeocode: async (latitude, longitude) => {
    try {
      if (!GOONG_API_KEY) {
        console.warn("GOONG_API_KEY chưa được cấu hình (.env: VITE_GOONG_API_KEY)");
        return null;
      }

      if (
        typeof latitude !== "number" ||
        typeof longitude !== "number" ||
        Number.isNaN(latitude) ||
        Number.isNaN(longitude)
      ) {
        return null;
      }

      const response = await axios.get("https://rsapi.goong.io/Geocode", {
        params: {
          latlng: `${latitude},${longitude}`,
          api_key: GOONG_API_KEY,
        },
      });

      const results = response.data?.results || [];
      if (!results.length) return null;

      const first = results[0];
      // Tuỳ cấu trúc API, ưu tiên formatted_address
      return (
        first.formatted_address ||
        first.address ||
        first.name ||
        null
      );
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      return null;
    }
  },
};

export default geocodingService;
