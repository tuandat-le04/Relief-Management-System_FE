import React, { useState, useEffect, useRef } from "react";
import Header from "../../components/coordinator/Header";
import goongjs from "@goongmaps/goong-js";
import "@goongmaps/goong-js/dist/goong-js.css";
import "../../assets/styles/coordinator.css";
import rescueRequestService from "../../services/rescueRequestService";

const CoordinatorDashboard = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // State cho dữ liệu từ API
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rawApiData, setRawApiData] = useState(null); // Debug state

  // Thống kê - tính từ data thực
  const stats = {
    emergency: requests.filter(
      (r) => r.priority === "emergency" && r.status !== "COMPLETED",
    ).length,
    active: requests.filter((r) => r.status === "IN_PROGRESS").length,
    pending: requests.filter((r) => r.status === "CREATED").length,
  };

  // Fetch data từ API
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await rescueRequestService.getAllRequests();

        console.log("Fetch result:", result); // Debug log
        setRawApiData(result); // Lưu raw data để debug

        if (result.success) {
          console.log("Setting requests:", result.data);
          setRequests(result.data);
        } else {
          console.error("Fetch failed:", result.error);
          setError(result.error);
        }
      } catch (err) {
        console.error("Error in fetchRequests:", err);
        setError("Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();

    // Auto refresh mỗi 30 giây
    const interval = setInterval(fetchRequests, 30000);

    return () => clearInterval(interval);
  }, []);

  // Khởi tạo Goong Map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Set API key
    goongjs.accessToken = import.meta.env.VITE_GOONG_MAPTILES_KEY;

    // Khởi tạo map
    const map = new goongjs.Map({
      container: mapRef.current,
      style: "https://tiles.goong.io/assets/goong_map_web.json",
      center: [108.2022, 16.0544], // Đà Nẵng [lng, lat]
      zoom: 11,
    });

    map.on("load", () => {
      // Thêm markers cho các yêu cầu cứu hộ
      requests.forEach((request) => {
        const el = document.createElement("div");
        el.className =
          request.priority === "emergency"
            ? "marker-emergency"
            : "marker-urgent";
        el.style.width = "30px";
        el.style.height = "30px";
        el.style.borderRadius = "50%";
        el.style.cursor = "pointer";
        el.style.backgroundColor =
          request.priority === "emergency" ? "#CC0000" : "#FF8C00";
        el.style.border = "3px solid white";
        el.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";

        new goongjs.Marker(el).setLngLat(request.coordinates).addTo(map);
      });

      // Thêm heat layer effect
      map.addLayer({
        id: "heatmap-layer",
        type: "circle",
        source: {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: requests.map((req) => ({
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: req.coordinates,
              },
              properties: {
                priority: req.priority,
              },
            })),
          },
        },
        paint: {
          "circle-radius": 50,
          "circle-color": [
            "match",
            ["get", "priority"],
            "emergency",
            "#CC0000",
            "urgent",
            "#FF8C00",
            "#4277a9",
          ],
          "circle-opacity": 0.2,
          "circle-blur": 1,
        },
      });
    });

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [requests]); // Re-render map khi requests thay đổi

  // Filter requests
  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilter === "all" || request.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const getPriorityColor = (priority) => {
    return priority === "emergency" ? "border-red-600" : "border-orange-500";
  };

  const getPriorityBadge = (priority) => {
    if (priority === "emergency") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 uppercase tracking-wide">
          Nguy kịch
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-600 uppercase tracking-wide">
        Ưu tiên cao
      </span>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar - Request List */}
        <aside className="w-[420px] bg-white border-r border-slate-200 flex flex-col shadow-sm">
          {/* Stats Cards */}
          <div className="p-4 grid grid-cols-3 gap-2 border-b border-slate-200">
            <div className="bg-red-50 p-3 rounded-xl border border-red-100">
              <p className="text-[10px] font-bold text-red-600 uppercase">
                Khẩn cấp
              </p>
              <p className="text-xl font-black text-red-700">
                {stats.emergency.toLocaleString()}
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
              <p className="text-[10px] font-bold text-blue-600 uppercase">
                Hoạt động
              </p>
              <p className="text-xl font-black text-blue-700">{stats.active}</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
              <p className="text-[10px] font-bold text-orange-600 uppercase">
                Đang chờ
              </p>
              <p className="text-xl font-black text-orange-700">
                {stats.pending}
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="p-4 flex flex-col gap-3 border-b border-slate-200">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                search
              </span>
              <input
                type="text"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Tìm tên, khu vực, loại cứu hộ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeFilter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setActiveFilter("medical")}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeFilter === "medical"
                    ? "bg-red-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-600"
                }`}
              >
                Y tế
              </button>
              <button
                onClick={() => setActiveFilter("food")}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeFilter === "food"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-600"
                }`}
              >
                Thực phẩm
              </button>
              <button
                onClick={() => setActiveFilter("evacuation")}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeFilter === "evacuation"
                    ? "bg-yellow-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-yellow-100 hover:text-yellow-600"
                }`}
              >
                Di tản
              </button>
            </div>
          </div>

          {/* Request List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-slate-500 font-medium">
                  Đang tải dữ liệu...
                </p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <span className="material-symbols-outlined text-red-600 text-4xl mb-2">
                  error
                </span>
                <p className="text-red-600 font-semibold">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700"
                >
                  Thử lại
                </button>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <span className="material-symbols-outlined text-slate-300 text-5xl mb-3">
                  inbox
                </span>
                <p className="text-slate-500 font-medium">
                  Không có yêu cầu nào
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  Dữ liệu sẽ tự động cập nhật mỗi 30 giây
                </p>
              </div>
            ) : (
              filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className={`relative group bg-white rounded-xl border-l-4 ${getPriorityColor(request.priority)} shadow-sm hover:shadow-md transition-all overflow-hidden`}
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      {getPriorityBadge(request.priority)}
                      <span className="text-xs font-medium text-slate-400">
                        {request.time}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">
                      {request.name} - {request.type}
                    </h3>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mb-4">
                      <span className="material-symbols-outlined text-sm">
                        location_on
                      </span>
                      {request.location}
                    </p>
                    <div className="flex items-center gap-2">
                      <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-sm">
                          handshake
                        </span>
                        Tiếp nhận
                      </button>
                      <button className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
                        <span className="material-symbols-outlined text-sm">
                          map
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Processing Section */}
            <div className="pt-6">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                Đang xử lý (4)
              </h4>
              <div className="space-y-3 opacity-70">
                <div className="bg-white/50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                      <span className="material-symbols-outlined text-base">
                        directions_boat
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        Đội 04 - Đang tiếp cận
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Khu vực Hòa Xuân
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">
                    2p nữa
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Map Section */}
        <section className="flex-1 relative bg-slate-100 overflow-hidden">
          {/* Map Container */}
          <div ref={mapRef} className="absolute inset-0 w-full h-full" />

          {/* Map Overlay Info */}
          <div className="absolute inset-0 z-10 p-8 flex flex-col justify-between pointer-events-none">
            {/* Top Left - Legend */}
            <div className="flex justify-between items-start">
              <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl border border-slate-200 shadow-lg pointer-events-auto">
                <h2 className="text-slate-900 font-bold mb-1">
                  Khu vực Miền Trung - VN
                </h2>
                <p className="text-xs text-slate-500">
                  Dữ liệu cập nhật: 15 giây trước
                </p>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-red-600 rounded-full shadow-sm"></span>
                    <span className="text-xs font-medium text-slate-700">
                      Vùng SOS khẩn cấp
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-blue-600 rounded-full shadow-sm"></span>
                    <span className="text-xs font-medium text-slate-700">
                      Đội cứu hộ hoạt động
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></span>
                    <span className="text-xs font-medium text-slate-700">
                      Điểm tập kết an toàn
                    </span>
                  </div>
                </div>
              </div>

              {/* Top Right - Map Controls */}
              <div className="flex flex-col gap-2 pointer-events-auto">
                <div className="bg-white/95 backdrop-blur-md p-1 rounded-lg border border-slate-200 shadow-lg flex flex-col">
                  <button className="p-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
                    <span className="material-symbols-outlined">add</span>
                  </button>
                  <div className="h-px bg-slate-200 mx-2"></div>
                  <button className="p-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors">
                    <span className="material-symbols-outlined">remove</span>
                  </button>
                </div>
                <button className="bg-white/95 backdrop-blur-md p-3 rounded-lg border border-slate-200 shadow-lg text-slate-700 hover:bg-slate-100 transition-colors">
                  <span className="material-symbols-outlined">layers</span>
                </button>
                <button className="bg-white/95 backdrop-blur-md p-3 rounded-lg border border-slate-200 shadow-lg text-slate-700 hover:bg-slate-100 transition-colors">
                  <span className="material-symbols-outlined">my_location</span>
                </button>
              </div>
            </div>

            {/* Bottom - Status Bar */}
            <div className="flex justify-center w-full">
              <div className="bg-white/95 backdrop-blur-md px-6 py-3 rounded-full border border-slate-200 shadow-lg flex items-center gap-6 pointer-events-auto">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Mực nước
                  </span>
                  <span className="text-sm font-bold text-red-600">+1.2m</span>
                </div>
                <div className="w-px h-4 bg-slate-300"></div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Gió
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    45 km/h
                  </span>
                </div>
                <div className="w-px h-4 bg-slate-300"></div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    Trạng thái liên lạc
                  </span>
                  <span className="text-sm font-bold text-green-600">
                    Tốt (85%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Emergency FAB */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="w-16 h-16 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group">
          <span className="material-symbols-outlined text-4xl group-hover:scale-110 transition-transform">
            emergency_share
          </span>
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-red-600 text-[10px] font-black rounded-full flex items-center justify-center border-2 border-red-600">
            !
          </span>
        </button>
      </div>

      {/* Styles for map markers and animations */}
      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(204, 0, 0, 0.7);
          }
          50% {
            box-shadow: 0 0 0 15px rgba(204, 0, 0, 0);
          }
        }

        .marker-emergency {
          animation: pulse 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default CoordinatorDashboard;
