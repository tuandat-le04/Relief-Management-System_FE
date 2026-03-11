import { useRef, useEffect } from "react";
import goongjs from "@goongmaps/goong-js";
import "@goongmaps/goong-js/dist/goong-js.css";

// Tạo custom pin marker element
const createMarkerElement = (request) => {
  const wrapper = document.createElement("div");
  wrapper.style.cssText = "position: relative; cursor: pointer;";

  const isRescue = request.type === "Cứu hộ khẩn cấp";
  const isCancelled = request.status === "CANCELLED";
  const isCompleted = request.status === "COMPLETED";
  const isInProgress = request.status === "IN_PROGRESS";
  const isCritical = request.priority === "CRITICAL";
  const isHigh = request.priority === "HIGH";

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

// Tạo popup HTML
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
    statusText = "⚠️ Ưu tiên cao";
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

const useMap = (requests) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const mapLoadedRef = useRef(false);

  const updateMapMarkers = (map) => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (map.getLayer("heatmap-layer")) map.removeLayer("heatmap-layer");
    if (map.getSource("heatmap-source")) map.removeSource("heatmap-source");

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

      el.addEventListener("click", () => marker.togglePopup());
      markersRef.current.push(marker);
    });

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
      center: [106.6297, 10.8231],
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update markers khi requests thay đổi
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoadedRef.current) return;
    updateMapMarkers(mapInstanceRef.current);
  }, [requests]); // eslint-disable-line react-hooks/exhaustive-deps

  const flyToRequest = (request) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo({
      center: request.coordinates,
      zoom: 14,
      speed: 1.5,
      curve: 1.2,
    });
    const marker = markersRef.current.find(
      (m) =>
        m.getLngLat().lng === request.coordinates[0] &&
        m.getLngLat().lat === request.coordinates[1],
    );
    if (marker) setTimeout(() => marker.togglePopup(), 800);
  };

  return { mapRef, flyToRequest };
};

export default useMap;
