localStorage.removeItem("token");
localStorage.removeItem("user");import React, { useState, useEffect, useRef } from "react";
import Header from "../../components/coordinator/Header";
import CancelRequestModal from "../../components/coordinator/CancelRequestModal";
import ClassifyRequestModal from "../../components/coordinator/ClassifyRequestModal";
import RequestDetailModal from "../../components/coordinator/RequestDetailModal";
import goongjs from "@goongmaps/goong-js";
import "@goongmaps/goong-js/dist/goong-js.css";
import "../../assets/styles/coordinator.css";
import rescueRequestService from "../../services/rescueRequestService";

const CoordinatorDashboard = () => {
  // pending | inprogress | completed | cancelled
  const [activeTab, setActiveTab] = useState("pending");
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]); // Lưu tất cả markers để clear khi update
  const mapLoadedRef = useRef(false); // Track map đã load xong chưa

  // State cho dữ liệu từ API
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State cho modal từ chối
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  // State cho modal phân loại
  const [classifyModalOpen, setClassifyModalOpen] = useState(false);
  // State cho modal xem chi tiết
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Mở modal xem chi tiết
  const openDetailModal = (request) => {
    setSelectedRequest(request);
    setDetailModalOpen(true);
  };

  // Thống kê - tính từ data thực
  const stats = {
    // CRITICAL = nguy kịch (chưa hật kết)
    emergency: requests.filter(
      (r) =>
        r.priority === "CRITICAL" &&
        r.status !== "COMPLETED" &&
        r.status !== "CANCELLED",
    ).length,
    rescue: requests.filter(
      (r) => r.type === "Cứu hộ khẩn cấp" && r.status === "CREATED",
    ).length,
    relief: requests.filter(
      (r) => r.type === "Hỗ trợ cứu trợ" && r.status === "CREATED",
    ).length,
    // Approve ⇒ IN_PROGRESS (không phải APPROVED)
    inProgress: requests.filter((r) => r.status === "IN_PROGRESS").length,
    completed: requests.filter((r) => r.status === "COMPLETED").length,
    cancelled: requests.filter((r) => r.status === "CANCELLED").length,
  };

  // Debug logging
  useEffect(() => {
    console.log("=== STATS DEBUG ===");
    console.log("Total requests:", requests.length);
    console.log(
      "All statuses:",
      requests.map((r) => ({ id: r.id, status: r.status })),
    );
    console.log("Stats:", stats);
    console.log("===================");
  }, [requests]);

  // Fetch data từ API
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await rescueRequestService.getAllRequests();

        console.log("Fetch result:", result);

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

  // Xử lý phân loại request (PATCH /classify)
  const handleClassifyRequest = async ({ priority, requestType }) => {
    if (!selectedRequest) return;
    try {
      const result = await rescueRequestService.classifyRequest(
        selectedRequest.id,
        { priority, requestType },
      );
      if (result.success) {
        const updatedRequests = await rescueRequestService.getAllRequests();
        if (updatedRequests.success) setRequests(updatedRequests.data);
      } else {
        alert("❌ " + result.error);
      }
    } catch (error) {
      console.error("Error classifying request:", error);
      alert("❌ Không thể phân loại yêu cầu");
    }
  };

  // Xử lý đánh dấu hoàn thành request (PUT /status → COMPLETED)
  const handleCompleteRequest = async (requestId) => {
    try {
      const result = await rescueRequestService.updateRequestStatus(
        requestId,
        "COMPLETED",
      );
      if (result.success) {
        const updatedRequests = await rescueRequestService.getAllRequests();
        if (updatedRequests.success) {
          setRequests(updatedRequests.data);
          setTimeout(() => setActiveTab("completed"), 500);
        }
      } else {
        alert("❌ " + result.error);
      }
    } catch (error) {
      console.error("Error completing request:", error);
      alert("❌ Không thể cập nhật trạng thái");
    }
  };

  // Mở modal phân loại
  const openClassifyModal = (request) => {
    setSelectedRequest(request);
    setClassifyModalOpen(true);
  };

  // Xử lý tiếp nhận request
  const handleApproveRequest = async (requestId) => {
    try {
      const result = await rescueRequestService.approveRequest(requestId);

      console.log("Approve result:", result);

      if (result.success) {
        // Hiển thị thông báo thành công
        alert("✅ " + result.message);

        // Refresh danh sách
        const updatedRequests = await rescueRequestService.getAllRequests();
        console.log("Updated requests after approve:", updatedRequests);

        if (updatedRequests.success) {
          setRequests(updatedRequests.data);
          // Sau khi approve → status = IN_PROGRESS, chuyển sang tab đang xử lý
          setTimeout(() => setActiveTab("inprogress"), 500);
        }
      } else {
        alert("❌ " + result.error);
      }
    } catch (error) {
      console.error("Error approving request:", error);
      alert("❌ Không thể tiếp nhận yêu cầu");
    }
  };

  // Xử lý từ chối request
  const handleCancelRequest = async (reason) => {
    if (!selectedRequest) return;

    try {
      const result = await rescueRequestService.cancelRequest(
        selectedRequest.id,
        reason,
      );

      console.log("Cancel result:", result);

      if (result.success) {
        // Hiển thị thông báo thành công
        alert("✅ " + result.message);

        // Refresh danh sách
        const updatedRequests = await rescueRequestService.getAllRequests();
        console.log("Updated requests after cancel:", updatedRequests);

        if (updatedRequests.success) {
          setRequests(updatedRequests.data);
          setTimeout(() => setActiveTab("cancelled"), 500);
        }
      } else {
        alert("❌ " + result.error);
      }
    } catch (error) {
      console.error("Error canceling request:", error);
      alert("❌ Không thể từ chối yêu cầu");
    }
  };

  // Mở modal từ chối
  const openCancelModal = (request) => {
    setSelectedRequest(request);
    setCancelModalOpen(true);
  };

  // Tạo custom pin marker element
  const createMarkerElement = (request) => {
    const wrapper = document.createElement("div");
    wrapper.style.cssText = "position: relative; cursor: pointer;";

    const isRescue = request.type === "Cứu hộ khẩn cấp";
    const isCancelled = request.status === "CANCELLED";
    const isCompleted = request.status === "COMPLETED";
    const isInProgress = request.status === "IN_PROGRESS";
    // Priority từ API: CRITICAL, HIGH, MEDIUM, NORMAL, LOW
    const isCritical = request.priority === "CRITICAL";
    const isHigh = request.priority === "HIGH";

    // Màu sắc theo trạng thái (uu tiên status trước, rồi mới priority)
    let pinColor, ringColor, icon;
    if (isCancelled) {
      pinColor = "#94a3b8";
      ringColor = "rgba(148,163,184,0.3)";
      icon = "cancel";
    } else if (isCompleted) {
      pinColor = "#059669";
      ringColor = "rgba(5,150,105,0.3)";
      icon = "task_alt";
    } else if (isInProgress) {
      pinColor = "#16a34a";
      ringColor = "rgba(22,163,74,0.3)";
      icon = "check_circle";
    } else if (isCritical) {
      pinColor = "#dc2626";
      ringColor = "rgba(220,38,38,0.4)";
      icon = "emergency";
    } else if (isHigh) {
      pinColor = "#ea580c";
      ringColor = "rgba(234,88,12,0.3)";
      icon = isRescue ? "sos" : "priority_high";
    } else {
      pinColor = "#3b82f6";
      ringColor = "rgba(59,130,246,0.3)";
      icon = isRescue ? "sos" : "volunteer_activism";
    }

    // Ring pulse (chỉ hiện với CREATED chưa xử lý)
    if (!isCancelled && !isInProgress && !isCompleted) {
      const ring = document.createElement("div");
      ring.style.cssText = `
        position: absolute; top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        width: 48px; height: 48px; border-radius: 50%;
        background: ${ringColor};
        animation: ping 1.8s ease-in-out infinite;
        pointer-events: none;
      `;
      wrapper.appendChild(ring);
    }

    // Pin body (hình giọng nước)
    const pin = document.createElement("div");
    pin.style.cssText = `
      position: relative; z-index: 1;
      width: 36px; height: 44px;
      display: flex; align-items: center; justify-content: center;
    `;
    pin.innerHTML = `
      <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 0C8.06 0 0 8.06 0 18C0 30 18 44 18 44C18 44 36 30 36 18C36 8.06 27.94 0 18 0Z" fill="${pinColor}"/>
        <circle cx="18" cy="17" r="9" fill="white" fill-opacity="0.25"/>
      </svg>
    `;

    // Icon bên trong pin
    const iconEl = document.createElement("span");
    iconEl.className = "material-symbols-outlined";
    iconEl.style.cssText = `
      position: absolute; top: 7px; left: 50%;
      transform: translateX(-50%);
      font-size: 18px; color: white; z-index: 2;
      font-variation-settings: 'FILL' 1, 'wght' 600, 'GRAD' 0, 'opsz' 20;
    `;
    iconEl.textContent = icon;

    wrapper.appendChild(pin);
    wrapper.appendChild(iconEl);
    return wrapper;
  };

  // Tạo popup content
  const createPopupHTML = (request) => {
    const isRescue = request.type === "Cứu hộ khẩn cấp";
    let statusColor, statusText;
    if (request.status === "IN_PROGRESS") {
      statusColor = "#16a34a";
      statusText = "⏳ Đang xử lý";
    } else if (request.status === "COMPLETED") {
      statusColor = "#059669";
      statusText = "✓ Hoàn thành";
    } else if (request.status === "CANCELLED") {
      statusColor = "#94a3b8";
      statusText = "✕ Đã từ chối";
    } else if (request.priority === "CRITICAL") {
      statusColor = "#dc2626";
      statusText = "⚠️ Nguy kịch";
    } else if (request.priority === "HIGH") {
      statusColor = "#ea580c";
      statusText = "⚠️ ƯU tiên cao";
    } else {
      statusColor = "#3b82f6";
      statusText = "ℹ️ Yêu cầu mới";
    }

    return `
      <div style="font-family: system-ui, sans-serif; min-width: 220px; padding: 4px;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
          <div style="width:10px; height:10px; border-radius:50%; background:${statusColor}; flex-shrink:0;"></div>
          <span style="font-size:11px; font-weight:700; color:${statusColor}; text-transform:uppercase; letter-spacing:0.5px;">${statusText}</span>
        </div>
        <div style="font-size:14px; font-weight:700; color:#0f172a; margin-bottom:4px;">
          ${isRescue ? "🚨" : "🤝"} ${request.type}
        </div>
        <div style="font-size:12px; color:#475569; margin-bottom:8px; display:flex; align-items:center; gap:4px;">
          📞 ${request.name}
        </div>
        <div style="font-size:12px; color:#64748b; margin-bottom:8px; padding:8px; background:#f8fafc; border-radius:6px; line-height:1.4;">
          📍 ${request.location}
        </div>
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <span style="font-size:11px; color:#94a3b8;">🕒 ${request.time}</span>
          <span style="font-size:10px; padding:3px 8px; border-radius:12px; font-weight:600;
            background:${isRescue ? "#fee2e2" : "#dcfce7"};
            color:${isRescue ? "#dc2626" : "#16a34a"};">
            ${isRescue ? "Cứu hộ" : "Cứu trợ"}
          </span>
        </div>
      </div>
    `;
  };

  // Hàm update markers trên bản đồ (gọi lại khi requests thay đổi)
  const updateMapMarkers = (map) => {
    // Xóa tất cả markers cũ
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Xóa heat layer cũ nếu có
    if (map.getLayer("heatmap-layer")) map.removeLayer("heatmap-layer");
    if (map.getSource("heatmap-source")) map.removeSource("heatmap-source");

    // Chỉ hiển thị requests có tọa độ hợp lệ
    const validRequests = requests.filter(
      (r) =>
        r.coordinates &&
        r.coordinates[0] !== 108.2022 &&
        r.coordinates[1] !== 16.0544,
    );

    // Thêm markers mới với custom pin
    requests.forEach((request) => {
      const el = createMarkerElement(request);

      const popup = new goongjs.Popup({
        offset: [0, -44],
        closeButton: true,
        closeOnClick: false,
        className: "custom-goong-popup",
      }).setHTML(createPopupHTML(request));

      const marker = new goongjs.Marker({ element: el, anchor: "bottom" })
        .setLngLat(request.coordinates)
        .setPopup(popup)
        .addTo(map);

      // Click vào marker để mở popup
      el.addEventListener("click", () => marker.togglePopup());

      markersRef.current.push(marker);
    });

    // Thêm heat layer cho requests CREATED (chưa xử lý)
    const createdRequests = requests.filter((r) => r.status === "CREATED");
    if (createdRequests.length > 0) {
      map.addSource("heatmap-source", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: createdRequests.map((req) => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: req.coordinates },
            properties: { priority: req.priority },
          })),
        },
      });

      map.addLayer({
        id: "heatmap-layer",
        type: "circle",
        source: "heatmap-source",
        paint: {
          "circle-radius": 55,
          "circle-color": [
            "match",
            ["get", "priority"],
            "CRITICAL",
            "#dc2626",
            "HIGH",
            "#ea580c",
            "#3b82f6",
          ],
          "circle-opacity": 0.12,
          "circle-blur": 1,
        },
      });
    }
  };

  // Init map (chỉ chạy 1 lần)
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    goongjs.accessToken = import.meta.env.VITE_GOONG_MAPTILES_KEY;

    const map = new goongjs.Map({
      container: mapRef.current,
      style: "https://tiles.goong.io/assets/goong_map_web.json",
      center: [106.6297, 10.8231], // TP. Hồ Chí Minh [lng, lat]
      zoom: 11,
    });

    map.on("load", () => {
      mapLoadedRef.current = true;
      updateMapMarkers(map);
    });

    mapInstanceRef.current = map;

    return () => {
      mapLoadedRef.current = false;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Chỉ mount 1 lần

  // Update markers khi requests thay đổi
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoadedRef.current) return;
    updateMapMarkers(mapInstanceRef.current);
  }, [requests]);

  // Fly to request khi click vào item trong list
  const flyToRequest = (request) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo({
      center: request.coordinates,
      zoom: 14,
      speed: 1.5,
      curve: 1.2,
    });
    // Mở popup của marker tương ứng
    const marker = markersRef.current.find(
      (m) =>
        m.getLngLat().lng === request.coordinates[0] &&
        m.getLngLat().lat === request.coordinates[1],
    );
    if (marker) setTimeout(() => marker.togglePopup(), 800);
  };

  // Filter requests
  const filteredRequests = requests.filter((request) => {
    // Filter theo tab
    if (activeTab === "pending" && request.status !== "CREATED") return false;
    if (activeTab === "inprogress" && request.status !== "IN_PROGRESS")
      return false;
    if (activeTab === "completed" && request.status !== "COMPLETED")
      return false;
    if (activeTab === "cancelled" && request.status !== "CANCELLED")
      return false;

    const matchesSearch =
      request.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.location.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter theo loại (rescue/relief) hoặc category
    let matchesFilter = true;
    if (activeFilter === "rescue") {
      matchesFilter = request.type === "Cứu hộ khẩn cấp";
    } else if (activeFilter === "relief") {
      matchesFilter = request.type === "Hỗ trợ cứu trợ";
    } else if (activeFilter !== "all") {
      matchesFilter = request.category === activeFilter;
    }

    return matchesSearch && matchesFilter;
  });

  const getPriorityColor = (priority) => {
    if (priority === "CRITICAL") return "border-red-600";
    if (priority === "HIGH") return "border-orange-500";
    if (priority === "MEDIUM") return "border-yellow-400";
    if (priority === "LOW") return "border-slate-300";
    return "border-blue-400"; // NORMAL
  };

  const getStatusBadge = (status) => {
    if (status === "IN_PROGRESS") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-600 uppercase tracking-wide">
          ⏳ Đang xử lý
        </span>
      );
    }
    if (status === "COMPLETED") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wide">
          ✓ Hoàn thành
        </span>
      );
    }
    if (status === "CANCELLED") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 uppercase tracking-wide">
          ✕ Đã từ chối
        </span>
      );
    }
    return null;
  };

  const getPriorityBadge = (priority) => {
    const cfg = {
      CRITICAL: { bg: "bg-red-100", text: "text-red-600", label: "Nguy kịch" },
      HIGH: {
        bg: "bg-orange-100",
        text: "text-orange-600",
        label: "Ưu tiên cao",
      },
      MEDIUM: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        label: "Trung bình",
      },
      NORMAL: {
        bg: "bg-blue-100",
        text: "text-blue-600",
        label: "Bình thường",
      },
      LOW: { bg: "bg-slate-100", text: "text-slate-500", label: "Thấp" },
    };
    const c = cfg[priority] || cfg["NORMAL"];
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${c.bg} ${c.text} uppercase tracking-wide`}
      >
        {c.label}
      </span>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar - Request List */}
        <aside className="w-[420px] bg-white border-r border-slate-200 flex flex-col shadow-sm">
          {/* Tabs: 4 trạng thái theo vòng đời API */}
          <div className="p-3 border-b border-slate-200">
            <div className="grid grid-cols-4 gap-1 bg-slate-100 rounded-lg p-1">
              {/* Tab 1: Chờ xử lý (CREATED) */}
              <button
                onClick={() => {
                  setActiveTab("pending");
                  setActiveFilter("all");
                }}
                className={`px-2 py-2 rounded-md text-xs font-semibold transition-all ${
                  activeTab === "pending"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="material-symbols-outlined text-base">
                    pending_actions
                  </span>
                  <span>Chờ xử lý</span>
                  {stats.rescue + stats.relief > 0 && (
                    <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full">
                      {stats.rescue + stats.relief}
                    </span>
                  )}
                </div>
              </button>

              {/* Tab 2: Đang xử lý (IN_PROGRESS) */}
              <button
                onClick={() => {
                  setActiveTab("inprogress");
                  setActiveFilter("all");
                }}
                className={`px-2 py-2 rounded-md text-xs font-semibold transition-all ${
                  activeTab === "inprogress"
                    ? "bg-white text-green-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="material-symbols-outlined text-base">
                    autorenew
                  </span>
                  <span>Đang xử lý</span>
                  {stats.inProgress > 0 && (
                    <span className="px-1.5 py-0.5 bg-green-600 text-white text-[10px] font-bold rounded-full">
                      {stats.inProgress}
                    </span>
                  )}
                </div>
              </button>

              {/* Tab 3: Hoàn thành (COMPLETED) */}
              <button
                onClick={() => {
                  setActiveTab("completed");
                  setActiveFilter("all");
                }}
                className={`px-2 py-2 rounded-md text-xs font-semibold transition-all ${
                  activeTab === "completed"
                    ? "bg-white text-emerald-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="material-symbols-outlined text-base">
                    task_alt
                  </span>
                  <span>Hoàn thành</span>
                  {stats.completed > 0 && (
                    <span className="px-1.5 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full">
                      {stats.completed}
                    </span>
                  )}
                </div>
              </button>

              {/* Tab 4: Đã từ chối (CANCELLED) */}
              <button
                onClick={() => {
                  setActiveTab("cancelled");
                  setActiveFilter("all");
                }}
                className={`px-2 py-2 rounded-md text-xs font-semibold transition-all ${
                  activeTab === "cancelled"
                    ? "bg-white text-gray-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="material-symbols-outlined text-base">
                    cancel
                  </span>
                  <span>Từ chối</span>
                  {stats.cancelled > 0 && (
                    <span className="px-1.5 py-0.5 bg-gray-500 text-white text-[10px] font-bold rounded-full">
                      {stats.cancelled}
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="p-3 grid grid-cols-4 gap-2 border-b border-slate-200">
            <div className="bg-red-50 p-2.5 rounded-xl border border-red-100">
              <p className="text-[9px] font-bold text-red-600 uppercase">
                Nguy kịch
              </p>
              <p className="text-lg font-black text-red-700">
                {stats.emergency}
              </p>
            </div>
            <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-100">
              <p className="text-[9px] font-bold text-blue-600 uppercase">
                Cứu hộ
              </p>
              <p className="text-lg font-black text-blue-700">{stats.rescue}</p>
            </div>
            <div className="bg-green-50 p-2.5 rounded-xl border border-green-100">
              <p className="text-[9px] font-bold text-green-600 uppercase">
                Đang XL
              </p>
              <p className="text-lg font-black text-green-700">
                {stats.inProgress}
              </p>
            </div>
            <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
              <p className="text-[9px] font-bold text-emerald-600 uppercase">
                Hoàn thành
              </p>
              <p className="text-lg font-black text-emerald-700">
                {stats.completed}
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
                onClick={() => setActiveFilter("rescue")}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeFilter === "rescue"
                    ? "bg-red-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-600"
                }`}
              >
                🚨 Cứu hộ
              </button>
              <button
                onClick={() => setActiveFilter("relief")}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeFilter === "relief"
                    ? "bg-green-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-green-100 hover:text-green-600"
                }`}
              >
                🤝 Cứu trợ
              </button>
              <button
                onClick={() => setActiveFilter("medical")}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeFilter === "medical"
                    ? "bg-pink-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-pink-100 hover:text-pink-600"
                }`}
              >
                Y tế
              </button>
              <button
                onClick={() => setActiveFilter("food")}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeFilter === "food"
                    ? "bg-amber-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-600"
                }`}
              >
                Thực phẩm
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
                  {activeTab === "pending" && "Chưa có yêu cầu nào chờ xử lý"}
                  {activeTab === "inprogress" &&
                    "Chưa có yêu cầu nào đang xử lý"}
                  {activeTab === "completed" &&
                    "Chưa có yêu cầu nào hoàn thành"}
                  {activeTab === "cancelled" &&
                    "Chưa có yêu cầu nào bị từ chối"}
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
                      <div className="flex items-center gap-2">
                        {getStatusBadge(request.status)}
                        {request.status === "CREATED" &&
                          getPriorityBadge(request.priority)}
                      </div>
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

                    {/* Action buttons theo trạng thái */}

                    {/* CREATED: Phân loại → Tiếp nhận / Từ chối */}
                    {request.status === "CREATED" && (
                      <div className="flex flex-col gap-2">
                        {/* Hàng 0: xem chi tiết */}
                        <button
                          onClick={() => openDetailModal(request)}
                          className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-sm">
                            info
                          </span>
                          Xem chi tiết yêu cầu
                        </button>
                        {/* Hàng 1: phân loại */}
                        <button
                          onClick={() => openClassifyModal(request)}
                          className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-sm">
                            tune
                          </span>
                          Phân loại yêu cầu
                        </button>
                        {/* Hàng 2: tiếp nhận + từ chối + map */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApproveRequest(request.id)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-sm">
                              check_circle
                            </span>
                            Tiếp nhận
                          </button>
                          <button
                            onClick={() => openCancelModal(request)}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1.5"
                          >
                            <span className="material-symbols-outlined text-sm">
                              cancel
                            </span>
                            Từ chối
                          </button>
                          <button
                            onClick={() => flyToRequest(request)}
                            className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-colors"
                            title="Xem trên bản đồ"
                          >
                            <span className="material-symbols-outlined text-sm">
                              map
                            </span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* IN_PROGRESS: Đánh dấu hoàn thành */}
                    {request.status === "IN_PROGRESS" && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCompleteRequest(request.id)}
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                          <span className="material-symbols-outlined text-base">
                            task_alt
                          </span>
                          Đánh dấu hoàn thành
                        </button>
                        <button
                          onClick={() => flyToRequest(request)}
                          className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-colors"
                          title="Xem trên bản đồ"
                        >
                          <span className="material-symbols-outlined text-sm">
                            my_location
                          </span>
                        </button>
                      </div>
                    )}

                    {request.status === "CANCELLED" && (
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p className="text-xs text-gray-600 flex items-center gap-2">
                          <span className="material-symbols-outlined text-base text-gray-500">
                            info
                          </span>
                          <span>Yêu cầu đã bị từ chối và không thể xử lý</span>
                        </p>
                      </div>
                    )}

                    {/* COMPLETED: Xem lại chi tiết */}
                    {request.status === "COMPLETED" && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openDetailModal(request)}
                          className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
                        >
                          <span className="material-symbols-outlined text-base">
                            search
                          </span>
                          Xem lại chi tiết
                        </button>
                        <button
                          onClick={() => flyToRequest(request)}
                          className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-emerald-100 hover:text-emerald-600 transition-colors"
                          title="Xem vị trí trên bản đồ"
                        >
                          <span className="material-symbols-outlined text-sm">
                            my_location
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
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
                  TP. Hồ Chí Minh - VN
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

      {/* Cancel Request Modal */}
      <CancelRequestModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancelRequest}
        requestInfo={selectedRequest}
      />

      {/* Classify Request Modal */}
      <ClassifyRequestModal
        isOpen={classifyModalOpen}
        onClose={() => setClassifyModalOpen(false)}
        onConfirm={handleClassifyRequest}
        requestInfo={selectedRequest}
      />

      {/* Request Detail Modal */}
      <RequestDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        request={selectedRequest}
      />

      {/* Styles for map markers and animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(204, 0, 0, 0.7); }
          50% { box-shadow: 0 0 0 15px rgba(204, 0, 0, 0); }
        }
        @keyframes ping {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.8; }
          70% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
          100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
        }
        .marker-emergency { animation: pulse 2s infinite; }

        /* Popup styles */
        .custom-goong-popup .mapboxgl-popup-content {
          padding: 14px 16px;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.18);
          border: 1px solid #e2e8f0;
          min-width: 230px;
        }
        .custom-goong-popup .mapboxgl-popup-tip {
          border-top-color: white;
        }
        .custom-goong-popup .mapboxgl-popup-close-button {
          font-size: 18px;
          color: #64748b;
          padding: 4px 8px;
          right: 4px;
          top: 4px;
        }
        .custom-goong-popup .mapboxgl-popup-close-button:hover {
          color: #0f172a;
          background: #f1f5f9;
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
};

export default CoordinatorDashboard;
