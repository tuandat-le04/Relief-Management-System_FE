import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Permission } from "../../constants/permissions";
import { usePermission } from "../../hooks/usePermission";
import authService from "../../services/authService";
import missionService from "../../services/missionService";
import AssignedMissionMapGoong from "../../components/rescueTeam/AssignedMissionMapGoong";
import MissionProgress from "../../components/rescueTeam/MissionProgress";
import api from "../../services/api";
import goongjs from "@goongmaps/goong-js";
import rescueRequestService, {
  getTimeAgo,
} from "../../services/rescueRequestService";

const STORAGE_KEYS = {
  activeRequestId: "rescueTeam.activeRequestId",
  progressByRequestPrefix: "rescueTeam.progress.",
  reports: "rescueTeam.reports",
};

const clampNumber = (value, min, max) => {
  const num = Number(value);
  if (Number.isNaN(num)) return min;
  return Math.min(max, Math.max(min, num));
};

const formatPhone = (phone) => {
  if (!phone) return "";
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
};

const haversineKm = (a, b) => {
  if (!a || !b) return null;
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
};

const decodePolyline = (encoded, precision = 5) => {
  if (!encoded) return [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  const coordinates = [];
  const factor = Math.pow(10, precision);

  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let b;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    result = 0;
    shift = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    // Goong/Mapbox expects [lng, lat]
    coordinates.push([lng / factor, lat / factor]);
  }

  return coordinates;
};

const extractRouteCoordinates = (directionJson) => {
  const route = directionJson?.routes?.[0];
  if (!route) return null;

  // Format A: Google-style overview_polyline.points
  const encodedA = route?.overview_polyline?.points;
  if (encodedA) return decodePolyline(encodedA, 5);

  // Format B: overview_polyline is a plain string
  const encodedB =
    typeof route?.overview_polyline === "string"
      ? route.overview_polyline
      : null;
  if (encodedB) return decodePolyline(encodedB, 5);

  // Format C: Mapbox-style geometry as GeoJSON
  const geojsonCoords = route?.geometry?.coordinates;
  if (Array.isArray(geojsonCoords) && geojsonCoords.length > 0)
    return geojsonCoords;

  // Format D: Mapbox-style geometry as polyline string
  const encodedC = typeof route?.geometry === "string" ? route.geometry : null;
  if (encodedC) return decodePolyline(encodedC, 5);

  return null;
};

const extractRouteSummary = (directionJson) => {
  const route = directionJson?.routes?.[0];
  if (!route) return null;

  // Format A: Google Directions style
  const leg = route?.legs?.[0];
  const distA = leg?.distance?.value;
  const durA = leg?.duration?.value;
  if (Number.isFinite(Number(distA)) || Number.isFinite(Number(durA))) {
    return {
      distanceMeters: Number.isFinite(Number(distA)) ? Number(distA) : null,
      durationSeconds: Number.isFinite(Number(durA)) ? Number(durA) : null,
    };
  }

  // Format B: Mapbox/Goong style
  const distB = route?.distance;
  const durB = route?.duration;
  if (Number.isFinite(Number(distB)) || Number.isFinite(Number(durB))) {
    return {
      distanceMeters: Number.isFinite(Number(distB)) ? Number(distB) : null,
      durationSeconds: Number.isFinite(Number(durB)) ? Number(durB) : null,
    };
  }

  return null;
};

const formatDistanceFromMeters = (meters) => {
  const m = Number(meters);
  if (!Number.isFinite(m) || m < 0) return "—";
  if (m < 1000) return `${Math.round(m)} m`;
  const km = m / 1000;
  return km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`;
};

const formatDurationFromSeconds = (seconds) => {
  const s = Number(seconds);
  if (!Number.isFinite(s) || s < 0) return "";
  const minutes = Math.round(s / 60);
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem ? `${hours}h ${rem}m` : `${hours}h`;
};

const createOriginBlueDotElement = () => {
  const el = document.createElement("div");
  // Tailwind classes are referenced as literal strings so they are included in build
  el.className = "relative w-8 h-8";
  el.innerHTML = `
    <div class="absolute inset-0 rounded-full bg-blue-500/25 animate-ping"></div>
    <div class="absolute inset-0 rounded-full bg-blue-500/20 blur-sm"></div>
    <div class="absolute left-1/2 top-1/2 w-3.5 h-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500 ring-4 ring-blue-200/70 border-2 border-white shadow"></div>
  `;
  return el;
};

const waitForMapLoaded = (map) => {
  if (!map) return Promise.reject(new Error("Map chưa sẵn sàng"));
  if (typeof map.loaded === "function" && map.loaded())
    return Promise.resolve();
  return new Promise((resolve) => {
    map.once("load", resolve);
  });
};

const formatAxiosError = (error) => {
  const status = error?.response?.status;
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Request failed";
  const url = error?.config?.url;
  const method = error?.config?.method?.toUpperCase();
  const statusPart = status ? `HTTP ${status}` : "";
  const reqPart = method && url ? `${method} ${url}` : url ? String(url) : "";
  return ["Lỗi gọi API", statusPart, reqPart, message]
    .filter(Boolean)
    .join(" - ");
};

const getEffectiveMissionStatus = (assignment) => {
  const missionStatus = assignment?.mission?.status ?? null;
  const assignmentStatus = assignment?.status ?? null;

  const missionLikeStatuses = new Set([
    "PENDING",
    "ASSIGNED",
    "IN_PROGRESS",
    "ARRIVED",
    "COMPLETED",
    "CANCELLED",
    "FAILED",
  ]);

  // Prefer the non-PENDING status between mission.status and assignment.status.
  // Backend sometimes keeps one of them at PENDING while the other is already ASSIGNED.
  if (missionStatus && missionStatus !== "PENDING") return missionStatus;
  if (
    assignmentStatus &&
    assignmentStatus !== "PENDING" &&
    missionLikeStatuses.has(assignmentStatus)
  )
    return assignmentStatus;
  return missionStatus || null;
};

const pickFirstActionableAssignment = (list) => {
  if (!Array.isArray(list) || list.length === 0) return null;
  return (
    list.find((a) => {
      if (!a?.mission) return false;
      if (a?.status === "DECLINED") return false;
      const status = getEffectiveMissionStatus(a);
      if (!status) return false;
      return (
        status !== "PENDING" && status !== "COMPLETED" && status !== "CANCELLED"
      );
    }) || null
  );
};

const RescueTeamDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { hasPermission } = usePermission();
  const canReport = hasPermission(Permission.REPORT_RESCUE_RESULT);
  const canUpdateStatus = hasPermission(Permission.UPDATE_TASK_STATUS);

  const mapRef = useRef(null);
  const originMarkerRef = useRef(null);
  const gpsWatchIdRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [request, setRequest] = useState(null);
  const [mission, setMission] = useState(null);
  const [rescueTeamId, setRescueTeamId] = useState(null);
  const [rescueTeamName, setRescueTeamName] = useState("");
  const [goongMap, setGoongMap] = useState(null);
  const [startingNavigation, setStartingNavigation] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(Date.now());

  const [routeSummary, setRouteSummary] = useState(null); // { distanceMeters, durationSeconds }
  const [navigationActive, setNavigationActive] = useState(false);

  const [gps, setGps] = useState({
    status: "idle", // idle | updating | ready | error
    coords: null, // { lat, lng }
    updatedAt: null,
    error: null,
  });

  const [progressStep, setProgressStep] = useState(1); // 1..3

  const activeRequestIdFromUrl = useMemo(() => {
    const fromQuery =
      searchParams.get("requestId") ||
      searchParams.get("rid") ||
      searchParams.get("id");
    const parsed = fromQuery ? parseInt(fromQuery, 10) : NaN;
    return Number.isFinite(parsed) ? parsed : null;
  }, [searchParams]);

  const priorityLabel = useMemo(() => {
    if (loading) return "Đang tải";
    const p = request?.priority;
    // Spec: chỉ hiển thị 2 mức ưu tiên
    if (p === "CRITICAL") return "YÊU CẦU KHẨN";
    return "BÌNH THƯỜNG";
  }, [loading, request?.priority]);

  const displayRequestCode = useMemo(() => {
    if (loading) return "#RE-....";
    const id = mission?.id;
    if (id === null || id === undefined) return "#RE-____";
    return `#RE-${String(id).padStart(3, "0")}`;
  }, [loading, mission?.id]);

  const victimName = loading ? "Đang tải..." : request?.name || "Không rõ tên";
  const victimPhone = loading ? "" : request?.phone || "";
  const victimAddress = loading
    ? "Đang tải..."
    : request?.location || "Không có địa chỉ";
  const receivedTimeAgo =
    !loading && request?.createdAt ? getTimeAgo(request.createdAt) : "";
  const lastUpdatedAgo = useMemo(
    () => getTimeAgo(lastUpdatedAt),
    [lastUpdatedAt],
  );

  const requestTags = useMemo(() => {
    const supplies = request?.requestSupplies;
    if (!supplies) return [];
    if (Array.isArray(supplies)) return supplies.filter(Boolean).map(String);
    if (typeof supplies === "string") {
      const trimmed = supplies.trim();
      if (!trimmed) return [];
      // Support comma-separated values if backend returns a string
      if (trimmed.includes(",")) {
        return trimmed
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return [trimmed];
    }
    return [];
  }, [request?.requestSupplies]);

  const progressPercent = useMemo(() => {
    if (progressStep <= 1) return 33;
    if (progressStep === 2) return 66;
    return 100;
  }, [progressStep]);

  const distanceKm = useMemo(() => {
    if (!gps.coords || !request?.coordinates) return null;
    const [lng, lat] = request.coordinates;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return haversineKm(gps.coords, { lat, lng });
  }, [gps.coords, request?.coordinates]);

  const distanceLabel = useMemo(() => {
    if (
      routeSummary?.distanceMeters !== null &&
      routeSummary?.distanceMeters !== undefined
    ) {
      return formatDistanceFromMeters(routeSummary.distanceMeters);
    }
    if (distanceKm === null) return "—";
    if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
    return `${distanceKm.toFixed(1)} km`;
  }, [distanceKm, routeSummary?.distanceMeters]);

  const progressText = useMemo(() => {
    if (progressStep === 1) return "Đang di chuyển...";
    if (progressStep === 2) return "Đã đến nơi";
    return "Hoàn thành";
  }, [progressStep]);

  const progressTimeLabel = useMemo(() => {
    if (!receivedTimeAgo) return "";
    return receivedTimeAgo;
  }, [receivedTimeAgo]);

  // ---- Load assigned mission (Rescue Team chỉ làm 1 nhiệm vụ) ----
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const user = authService.getCurrentUser();
        if (!user) {
          throw new Error("Bạn chưa đăng nhập hoặc phiên đã hết hạn");
        }

        const assignedRes = await missionService.getAssignedToMe();
        if (!assignedRes.success) {
          throw new Error(
            assignedRes.error || "Không thể tải nhiệm vụ được giao",
          );
        }

        const assignment = pickFirstActionableAssignment(assignedRes.data);

        if (!assignment?.mission) {
          throw new Error("Hiện chưa có nhiệm vụ nào được giao");
        }

        const effectiveMissionStatus = getEffectiveMissionStatus(assignment);

        // If backend returns a mission that is not actionable for Rescue Team yet,
        // treat it as no active mission.
        if (
          effectiveMissionStatus === "COMPLETED" ||
          effectiveMissionStatus === "PENDING" ||
          effectiveMissionStatus === "CANCELLED"
        ) {
          localStorage.removeItem(STORAGE_KEYS.activeRequestId);
          if (!isMounted) return;
          setRequest(null);
          setMission(null);
          setProgressStep(1);
          setRouteSummary(null);
          setNavigationActive(false);
          setLastUpdatedAt(Date.now());
          return;
        }

        const requestId =
          assignment.request?.id ??
          assignment.requestId ??
          assignment.requestID ??
          assignment.mission?.requestId ??
          assignment.mission?.requestID ??
          null;
        if (requestId === null || requestId === undefined) {
          throw new Error(
            "Nhiệm vụ thiếu requestId (không thể hiển thị chi tiết)",
          );
        }
        const loadedRescueTeamId =
          assignment.rescueTeamId ??
          assignment.rescueTeamID ??
          assignment.rescueTeam?.id ??
          user?.rescueTeamId ??
          user?.rescueTeamID ??
          user?.teamId ??
          user?.teamID ??
          user?.rescueTeam?.id ??
          null;

        const loadedRescueTeamName =
          assignment.rescueTeamName ??
          assignment.rescueTeam?.name ??
          assignment.rescueTeam?.rescueTeamName ??
          user?.rescueTeamName ??
          user?.teamName ??
          user?.rescueTeam?.name ??
          user?.rescueTeam?.rescueTeamName ??
          "";

        // Gọi API chi tiết rescue request để lấy SĐT + tình trạng/ghi chú
        const detailRes = await rescueRequestService.getRequestById(requestId);
        const detail = detailRes.success ? detailRes.data : null;

        const lat = assignment.request?.latitude;
        const lng = assignment.request?.longitude;
        const coordsValid =
          Number.isFinite(Number(lat)) && Number.isFinite(Number(lng));

        // Fallback theo spec khi API chưa có đầy đủ
        const loadedRequest = {
          ...(detail || {}),
          id: requestId,
          // Ưu tiên lấy từ assigned-to-me (spec), fallback sang detail nếu cần
          priority: assignment.request?.priority || detail?.priority,
          requestType: detail?.requestType || assignment.mission.missionType,
          createdAt:
            detail?.createdAt ||
            assignment.mission.createdAt ||
            assignment.mission.startTime,
          // Nếu detail chưa có phone/description thì UI sẽ fallback
          phone: detail?.phone || null,
          description: detail?.description || null,
          // Giữ tọa độ chính xác từ assigned-to-me
          coordinates: coordsValid
            ? [Number(lng), Number(lat)]
            : detail?.coordinates || null,
          // Nếu backend có status của rescue request thì dùng để hiển thị/logic sau này
          status: detail?.status || assignment.mission.status || "IN_PROGRESS",
          // ĐỊA ĐIỂM/ĐỊA CHỈ: hiện API detail chưa có field address riêng,
          // tránh lấy nhầm từ description -> luôn hiển thị theo tọa độ assigned-to-me.
          location: coordsValid
            ? `Tọa độ: ${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`
            : "Đang cập nhật",
        };

        localStorage.setItem(
          STORAGE_KEYS.activeRequestId,
          String(loadedRequest.id),
        );

        const missionData = {
          ...(assignment.mission || {}),
          status: effectiveMissionStatus || assignment.mission?.status,
        };

        // Progress step should reflect mission status if backend provides it
        const statusStep =
          missionData?.status === "ARRIVED"
            ? 2
            : missionData?.status === "COMPLETED"
              ? 3
              : 1;

        // Fallback to stored (client-side) step only when mission is still IN_PROGRESS
        const stepKey = `${STORAGE_KEYS.progressByRequestPrefix}${loadedRequest.id}`;
        const storedStep = parseInt(localStorage.getItem(stepKey) || "1", 10);
        const storedClamped = Number.isFinite(storedStep)
          ? clampNumber(storedStep, 1, 3)
          : 1;
        const nextStep = statusStep > 1 ? statusStep : storedClamped;

        if (!isMounted) return;
        setRequest(loadedRequest);
        setMission(missionData);
        setRescueTeamId(loadedRescueTeamId);
        setRescueTeamName(String(loadedRescueTeamName || ""));
        setProgressStep(nextStep);
        setRouteSummary(null);
        setNavigationActive(false);
        setLastUpdatedAt(Date.now());
      } catch (err) {
        if (!isMounted) return;
        setLoadError(err?.message || "Không thể tải dữ liệu");
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [activeRequestIdFromUrl]);

  // Poll refresh assigned mission every 30 seconds
  useEffect(() => {
    if (!request?.id) return undefined;

    let cancelled = false;
    const interval = setInterval(async () => {
      try {
        const assignedRes = await missionService.getAssignedToMe();
        if (cancelled) return;
        if (!assignedRes.success) return;

        const assignment = pickFirstActionableAssignment(assignedRes.data);

        if (!assignment?.mission) return;

        const effectiveMissionStatus = getEffectiveMissionStatus(assignment);

        if (
          effectiveMissionStatus === "COMPLETED" ||
          effectiveMissionStatus === "PENDING" ||
          effectiveMissionStatus === "CANCELLED"
        ) {
          localStorage.removeItem(STORAGE_KEYS.activeRequestId);
          setRequest(null);
          setMission(null);
          setProgressStep(1);
          setRouteSummary(null);
          setNavigationActive(false);
          setLastUpdatedAt(Date.now());
          return;
        }

        const requestId =
          assignment.request?.id ??
          assignment.requestId ??
          assignment.requestID ??
          assignment.mission?.requestId ??
          assignment.mission?.requestID ??
          null;
        if (requestId === null || requestId === undefined) return;
        const user = authService.getCurrentUser();
        const loadedRescueTeamId =
          assignment.rescueTeamId ??
          assignment.rescueTeamID ??
          assignment.rescueTeam?.id ??
          user?.rescueTeamId ??
          user?.rescueTeamID ??
          user?.teamId ??
          user?.teamID ??
          user?.rescueTeam?.id ??
          null;

        const loadedRescueTeamName =
          assignment.rescueTeamName ??
          assignment.rescueTeam?.name ??
          assignment.rescueTeam?.rescueTeamName ??
          user?.rescueTeamName ??
          user?.teamName ??
          user?.rescueTeam?.name ??
          user?.rescueTeam?.rescueTeamName ??
          "";
        const detailRes = await rescueRequestService.getRequestById(requestId);
        const detail = detailRes.success ? detailRes.data : null;

        const lat = assignment.request?.latitude;
        const lng = assignment.request?.longitude;
        const coordsValid =
          Number.isFinite(Number(lat)) && Number.isFinite(Number(lng));

        setMission({
          ...(assignment.mission || {}),
          status: effectiveMissionStatus || assignment.mission?.status,
        });
        setRescueTeamId(loadedRescueTeamId);
        setRescueTeamName(String(loadedRescueTeamName || ""));
        setRequest((prev) => ({
          ...(prev || {}),
          ...(detail || {}),
          id: requestId,
          priority:
            assignment.request?.priority || detail?.priority || prev?.priority,
          requestType:
            detail?.requestType ||
            assignment.mission.missionType ||
            prev?.requestType,
          createdAt:
            detail?.createdAt ||
            assignment.mission.createdAt ||
            assignment.mission.startTime ||
            prev?.createdAt,
          phone: detail?.phone || prev?.phone || null,
          description: detail?.description || prev?.description || null,
          coordinates: coordsValid
            ? [Number(lng), Number(lat)]
            : detail?.coordinates || prev?.coordinates || null,
          status:
            detail?.status ||
            effectiveMissionStatus ||
            assignment.mission?.status ||
            prev?.status,
          // ĐỊA ĐIỂM/ĐỊA CHỈ: luôn hiển thị theo tọa độ assigned-to-me
          location: coordsValid
            ? `Tọa độ: ${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`
            : prev?.location || "Đang cập nhật",
        }));
        // Keep UI progress in sync with mission status
        if (effectiveMissionStatus === "ARRIVED") setProgressStep(2);
        if (effectiveMissionStatus === "COMPLETED") setProgressStep(3);
        setLastUpdatedAt(Date.now());
      } catch {
        // silent polling failures
      }
    }, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [request?.id]);

  // GPS watch
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setGps((s) => ({
        ...s,
        status: "error",
        error: "Thiết bị không hỗ trợ GPS",
      }));
      return undefined;
    }

    setGps((s) => ({ ...s, status: "updating", error: null }));

    // Make sure we don't leak multiple watchers
    if (gpsWatchIdRef.current !== null && gpsWatchIdRef.current !== undefined) {
      try {
        navigator.geolocation.clearWatch(gpsWatchIdRef.current);
      } catch {
        // ignore
      }
      gpsWatchIdRef.current = null;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const nextLat = pos.coords.latitude;
        const nextLng = pos.coords.longitude;

        setGps({
          status: "ready",
          coords: {
            lat: nextLat,
            lng: nextLng,
          },
          updatedAt: Date.now(),
          error: null,
        });

        // UI only: if navigation has started, move the blue dot marker with device GPS
        if (navigationActive && originMarkerRef.current) {
          const lng = Number(nextLng);
          const lat = Number(nextLat);
          if (Number.isFinite(lat) && Number.isFinite(lng)) {
            originMarkerRef.current.setLngLat([lng, lat]);
          }
        }
      },
      (err) => {
        setGps((s) => ({
          ...s,
          status: "error",
          error: err?.message || "Không thể lấy vị trí hiện tại",
        }));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      },
    );

    gpsWatchIdRef.current = watchId;

    return () => {
      if (
        gpsWatchIdRef.current !== null &&
        gpsWatchIdRef.current !== undefined
      ) {
        try {
          navigator.geolocation.clearWatch(gpsWatchIdRef.current);
        } catch {
          // ignore
        }
        gpsWatchIdRef.current = null;
      }
    };
  }, [navigationActive]);

  // Keep progressStep persisted per request
  useEffect(() => {
    if (!request?.id) return;
    const stepKey = `${STORAGE_KEYS.progressByRequestPrefix}${request.id}`;
    localStorage.setItem(stepKey, String(progressStep));
  }, [progressStep, request?.id]);

  useEffect(() => {
    document.title = "Quản Lý Nhiệm Vụ & Báo Cáo Cứu Hộ Hiện Trường";
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const handleStartNavigation = async () => {
    if (startingNavigation) return;
    setStartingNavigation(true);

    try {
      const destination = (() => {
        if (request?.coordinates && request.coordinates.length === 2) {
          const [lng, lat] = request.coordinates;
          if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
        }
        return null;
      })();

      if (!destination) {
        throw new Error("Chưa có tọa độ điểm đến");
      }
      const currentUser = authService.getCurrentUser();
      const effectiveRescueTeamId =
        rescueTeamId ??
        currentUser?.rescueTeamId ??
        currentUser?.rescueTeamID ??
        currentUser?.teamId ??
        currentUser?.teamID ??
        currentUser?.rescueTeam?.id ??
        null;
      if (
        effectiveRescueTeamId === null ||
        effectiveRescueTeamId === undefined
      ) {
        throw new Error(
          "Thiếu rescueTeamId (chưa lấy được từ nhiệm vụ hoặc profile)",
        );
      }

      await waitForMapLoaded(goongMap);

      // 1) Lấy vị trí hiện tại của đội từ backend (Origin)
      let posRes;
      const posEndpoint = `/team-positions/team/${effectiveRescueTeamId}`;
      try {
        posRes = await api.get(posEndpoint);
      } catch (error) {
        throw new Error(
          `${formatAxiosError(error)} (endpoint: ${posEndpoint}, rescueTeamId: ${effectiveRescueTeamId})`,
        );
      }
      if (!posRes.data?.success) {
        throw new Error(
          `Không lấy được vị trí hiện tại của đội - ${posRes.data?.message || "Unknown error"} (endpoint: ${posEndpoint}, rescueTeamId: ${effectiveRescueTeamId})`,
        );
      }
      const originLat = Number(posRes.data?.data?.latitude);
      const originLng = Number(posRes.data?.data?.longitude);
      if (!Number.isFinite(originLat) || !Number.isFinite(originLng)) {
        throw new Error("Tọa độ điểm đi không hợp lệ");
      }

      // Marker origin (blue dot GPS-style)
      const originLngLat = [originLng, originLat];
      if (!originMarkerRef.current) {
        const el = createOriginBlueDotElement();
        originMarkerRef.current = new goongjs.Marker({
          element: el,
          anchor: "center",
        })
          .setLngLat(originLngLat)
          .addTo(goongMap);
      } else {
        originMarkerRef.current.setLngLat(originLngLat);
      }

      // Center camera at origin (zoom ~15)
      goongMap.flyTo({
        center: originLngLat,
        zoom: 15,
        speed: 1.2,
        curve: 1.2,
        essential: true,
      });

      // 2) Gọi Goong Direction API
      // Dùng key REST theo convention hiện có trong project (đang dùng cho geocode)
      const goongKey = import.meta.env.VITE_GOONG_GEOLOCATION_KEY;
      if (!goongKey) {
        throw new Error(
          "Thiếu VITE_GOONG_GEOLOCATION_KEY trong .env (dùng cho Direction API)",
        );
      }

      // Use v2 endpoint so it appears under Api v2 stats in Goong Dashboard
      const directionUrl = `https://rsapi.goong.io/v2/direction?origin=${originLat},${originLng}&destination=${destination.lat},${destination.lng}&vehicle=car&api_key=${goongKey}`;
      const directionRes = await fetch(directionUrl);
      if (!directionRes.ok) {
        let body = "";
        try {
          body = await directionRes.text();
        } catch {
          body = "";
        }
        throw new Error(
          `Direction API lỗi HTTP ${directionRes.status}${body ? ` - ${body}` : ""}`,
        );
      }
      const directionJson = await directionRes.json();

      // Store API route distance/time if present
      const summary = extractRouteSummary(directionJson);
      if (summary) setRouteSummary(summary);

      const lineCoords = extractRouteCoordinates(directionJson);
      if (!Array.isArray(lineCoords) || lineCoords.length === 0) {
        throw new Error(
          "Không đọc được dữ liệu tuyến đường từ Direction response",
        );
      }

      // 3) Add/Update source + layer để vẽ đường đứt nét
      const sourceId = "rescue-team-route-source";
      const layerId = "rescue-team-route-layer";
      const geojson = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: lineCoords },
          },
        ],
      };

      if (goongMap.getSource(sourceId)) {
        goongMap.getSource(sourceId).setData(geojson);
      } else {
        goongMap.addSource(sourceId, { type: "geojson", data: geojson });
      }

      if (!goongMap.getLayer(layerId)) {
        goongMap.addLayer({
          id: layerId,
          type: "line",
          source: sourceId,
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "#3b82f6",
            "line-width": 4,
            "line-opacity": 0.95,
            "line-dasharray": [2, 2],
          },
        });
      }

      setNavigationActive(true);
    } catch (err) {
      console.error(err);
      window.alert(err?.message || "Không thể bắt đầu dẫn đường");
    } finally {
      setStartingNavigation(false);
    }
  };

  const effectiveRescueTeamIdForUi = (() => {
    const currentUser = authService.getCurrentUser();
    return (
      rescueTeamId ??
      currentUser?.rescueTeamId ??
      currentUser?.rescueTeamID ??
      currentUser?.teamId ??
      currentUser?.teamID ??
      currentUser?.rescueTeam?.id ??
      null
    );
  })();

  const effectiveRescueTeamNameForUi = (() => {
    const currentUser = authService.getCurrentUser();
    const candidate =
      rescueTeamName ||
      currentUser?.rescueTeamName ||
      currentUser?.teamName ||
      currentUser?.rescueTeam?.name ||
      currentUser?.rescueTeam?.rescueTeamName ||
      "";
    return String(candidate || "").trim();
  })();

  const canStartNavigation =
    !loading &&
    !startingNavigation &&
    !!goongMap &&
    effectiveRescueTeamIdForUi !== null &&
    effectiveRescueTeamIdForUi !== undefined &&
    Array.isArray(request?.coordinates) &&
    request.coordinates.length === 2;

  const hasActiveMission =
    !loading &&
    !!mission &&
    mission.status !== "COMPLETED" &&
    mission.status !== "PENDING" &&
    mission.status !== "CANCELLED" &&
    !!request;

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-[#131416] dark:text-white min-h-screen">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-solid border-[#e5e7eb] dark:border-[#374151] bg-white dark:bg-background-dark px-6 py-3 lg:px-10 shadow-sm">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg text-white shadow-lg shadow-primary/30">
              <span className="material-symbols-outlined block text-2xl">
                emergency
              </span>
            </div>
            <div>
              <h2 className="text-[#131416] dark:text-white text-xl font-black leading-tight tracking-tight uppercase">
                Cứu Hộ VN
              </h2>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                {effectiveRescueTeamNameForUi || "—"}
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-full px-4 py-1.5">
            <span className="w-2 h-2 rounded-full bg-success-green animate-pulse mr-2"></span>
            <span className="text-success-green text-xs font-bold uppercase">
              Hệ thống trực tuyến
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 lg:gap-6">
          <button
            type="button"
            className="hidden md:flex items-center justify-center rounded-lg h-11 px-5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-black shadow-sm transition-all active:scale-95 border-2 border-gray-200 dark:border-gray-700"
            onClick={handleLogout}
          >
            <span className="material-symbols-outlined mr-2">logout</span>
            <span>Đăng xuất</span>
          </button>
          <div
            className="h-11 w-11 rounded-full bg-cover bg-center border-2 border-white shadow-md ring-2 ring-primary/20"
            data-alt="Ảnh đại diện đội trưởng đội cứu hộ"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDuyHJht1Ui_YnTJY1DSTJcepL41z4IZMSumUIurIVYz9lef0hO7-k_3uGKOnurRxgL8dyP3uXt8LLnxj0am06PnWSIY2rEbTIWwBVHMyaX-Ubx2HcV_jmPv0vWeY7QjH7wnnbSuvmdF3a96wV66E8_Xkkm4SJzfiy5u8pZsR7Jg1GT1YRXxBBTCjsOtcNX1pL-AlsMP3II1iJxEO0E1UYqEpwzWTj6UZeSCvlEbrTbzEdxkZ8BFHsX9mCnN-_TbKVl9lw6NXuuRBM")',
            }}
          ></div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto flex flex-col lg:flex-row h-[calc(100vh-73px)] overflow-hidden">
        <aside className="hidden lg:flex flex-col w-72 border-r border-[#e5e7eb] dark:border-[#374151] bg-white dark:bg-[#1c1e22] p-4 gap-6 z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
          <div className="px-2">
            <h1 className="text-[#131416] dark:text-white text-xl font-black mb-1">
              {effectiveRescueTeamIdForUi !== null &&
              effectiveRescueTeamIdForUi !== undefined
                ? `Đội Cứu Hộ ${effectiveRescueTeamIdForUi}`
                : "Đội Cứu Hộ"}
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              {effectiveRescueTeamNameForUi
                ? `Khu vực: ${effectiveRescueTeamNameForUi}`
                : "Khu vực: —"}
            </p>
          </div>
          <nav className="flex flex-col gap-2 flex-1">
            <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-primary text-white shadow-lg shadow-primary/25">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined">assignment</span>
                <p className="text-sm font-bold">Nhiệm vụ</p>
              </div>
              <span className="bg-white/20 px-2.5 py-0.5 rounded text-xs font-bold">
                {hasActiveMission ? 1 : 0}
              </span>
            </div>
          </nav>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-primary">
                cloud
              </span>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">
                  Thời tiết hiện tại
                </p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  Mưa lớn, Ngập cục bộ
                </p>
                <p className="text-xs text-primary font-bold mt-1">
                  26°C - Gió ĐN 15km/h
                </p>
              </div>
            </div>
          </div>
        </aside>

        <section className="flex-1 flex flex-col h-full bg-[#f6f7f8] dark:bg-background-dark overflow-hidden relative">
          {!loading && !hasActiveMission ? (
            <div className="h-full flex items-center justify-center p-8">
              <div className="w-full max-w-xl bg-white dark:bg-[#1c1e22] border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-xl">
                <div className="flex items-start gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3">
                    <span className="material-symbols-outlined text-success-green text-3xl">
                      task_alt
                    </span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white">
                      Không có nhiệm vụ đang thực hiện
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 font-medium">
                      Nhiệm vụ đã hoàn thành hoặc hệ thống chưa phân công nhiệm
                      vụ mới cho đội.
                    </p>
                    <p className="mt-4 text-xs text-gray-400 font-bold uppercase tracking-widest">
                      Trạng thái: Sẵn sàng nhận nhiệm vụ
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full grid grid-cols-1 xl:grid-cols-12 overflow-hidden">
              <div className="xl:col-span-4 flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1e22] h-full overflow-hidden shadow-xl z-10">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1e22]">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                      Nhiệm Vụ Hiện Tại
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                      <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase">
                        Đang xử lý
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 font-medium">
                    Bạn đang phụ trách 01 nhiệm vụ duy nhất.
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-black/10">
                  <div className="bg-white dark:bg-[#2d3139] border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-primary/50 transition-colors">
                    <div className="absolute -right-6 -top-6 text-gray-100 dark:text-gray-700 pointer-events-none transform rotate-12">
                      <span className="material-symbols-outlined text-[120px] opacity-30">
                        emergency
                      </span>
                    </div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <span className="bg-urgency-high/10 text-urgency-high px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider border border-urgency-high/20">
                          {priorityLabel}
                        </span>
                        <span className="text-xs font-bold text-gray-400">
                          {displayRequestCode}
                        </span>
                      </div>
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 leading-tight">
                        {victimName}
                      </h3>
                      <p className="text-sm font-bold text-urgency-critical mb-5 flex items-center gap-1">
                        <span className="material-symbols-outlined text-lg">
                          warning
                        </span>
                        {request?.requestType === "RESCUE"
                          ? "CỨU HỘ KHẨN CẤP"
                          : request?.requestType === "RELIEF"
                            ? "HỖ TRỢ CỨU TRỢ"
                            : "YÊU CẦU KHẨN"}
                      </p>
                      <div className="space-y-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                        <div className="flex items-start gap-3">
                          <span className="material-symbols-outlined text-primary mt-0.5">
                            location_on
                          </span>
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-0.5">
                              Địa điểm
                            </p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white leading-snug">
                              {victimAddress}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="pt-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-bold text-gray-500">
                            Thời gian nhận tin
                          </span>
                          <span className="font-bold text-gray-900 dark:text-white">
                            {progressTimeLabel}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div
                            className="bg-blue-600 h-full w-1/3 animate-pulse"
                            style={{ width: `${progressPercent}%` }}
                          ></div>
                        </div>
                        <p className="text-[10px] text-blue-600 font-bold mt-1 text-right">
                          {progressText}
                        </p>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-urgency-high to-urgency-critical"></div>
                  </div>
                  <div className="mt-8 text-center px-4">
                    <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600 mb-2">
                      my_location
                    </span>
                    <p className="text-xs text-gray-400 font-medium italic">
                      Tập trung hoàn thành nhiệm vụ này. Hệ thống sẽ không phân
                      công thêm nhiệm vụ mới cho đến khi bạn báo cáo hoàn thành.
                    </p>
                  </div>
                </div>
              </div>

              <div className="xl:col-span-8 overflow-y-auto bg-gray-50 dark:bg-black/20 h-full">
                <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
                  <div className="bg-white dark:bg-[#1c1e22] rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 flex flex-wrap items-center justify-between text-white gap-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-urgency-high p-2 rounded text-white shadow-lg">
                          <span className="material-symbols-outlined block">
                            priority_high
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                            Nhiệm vụ trọng tâm
                          </p>
                          <h2 className="text-lg font-black leading-none">
                            CỨU HỘ KHẨN CẤP {displayRequestCode}
                          </h2>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                        <span className="material-symbols-outlined text-sm">
                          schedule
                        </span>
                        <span className="text-sm font-bold">
                          Cập nhật: {lastUpdatedAgo}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div>
                          <p className="text-gray-500 text-xs font-bold uppercase mb-1">
                            Nạn nhân
                          </p>
                          <h2 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                            {victimName}
                          </h2>
                          <a
                            className="inline-flex items-center gap-3 text-3xl lg:text-4xl text-primary font-black mt-2 hover:text-blue-600 transition-colors"
                            href={victimPhone ? `tel:${victimPhone}` : "#"}
                            onClick={(e) => {
                              if (!victimPhone) e.preventDefault();
                            }}
                          >
                            <span className="material-symbols-outlined text-4xl filled">
                              call
                            </span>
                            {victimPhone
                              ? formatPhone(victimPhone)
                              : "Chưa có SĐT"}
                          </a>
                        </div>

                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-8 border-yellow-400 p-5 rounded-r-xl">
                          <p className="text-yellow-700 dark:text-yellow-500 text-xs font-black uppercase mb-2 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">
                              info
                            </span>
                            Tình trạng &amp; Ghi chú đặc biệt
                          </p>
                          <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white leading-snug">
                            {request?.description ? (
                              <>{request.description}</>
                            ) : (
                              <>
                                Chưa có ghi chú chi tiết. <br />
                                <span className="bg-yellow-200 dark:bg-yellow-700 px-1">
                                  Đang cập nhật
                                </span>
                              </>
                            )}
                          </p>
                          <div className="mt-3 flex gap-2 flex-wrap">
                            {requestTags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="bg-white dark:bg-gray-800 px-3 py-1 rounded border border-yellow-200 dark:border-gray-600 text-sm font-bold text-gray-700 dark:text-gray-300"
                              >
                                {tag}
                              </span>
                            ))}
                            {requestTags.length === 0 && (
                              <>
                                <span className="bg-white dark:bg-gray-800 px-3 py-1 rounded border border-yellow-200 dark:border-gray-600 text-sm font-bold text-gray-700 dark:text-gray-300">
                                  Cao huyết áp
                                </span>
                                <span className="bg-white dark:bg-gray-800 px-3 py-1 rounded border border-yellow-200 dark:border-gray-600 text-sm font-bold text-gray-700 dark:text-gray-300">
                                  Cần cáng cứu thương
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="bg-white dark:bg-[#1c1e22] border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 flex items-center justify-center">
                                <span className="material-symbols-outlined text-blue-600">
                                  assignment_turned_in
                                </span>
                              </div>
                              <div>
                                <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                                  Chi tiết nhiệm vụ
                                </p>
                                <p className="text-base font-black text-gray-900 dark:text-white leading-tight">
                                  {mission?.missionType || "—"}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs font-black px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 whitespace-nowrap">
                              {mission?.missionType || "—"}
                            </span>
                          </div>

                          <div className="p-5 space-y-6">
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <span className="material-symbols-outlined text-gray-400 text-sm">
                                  local_shipping
                                </span>
                                <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                                  Phương tiện (Vehicles)
                                </p>
                              </div>

                              {mission?.vehicles?.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {mission.vehicles.map((v, idx) => {
                                    const title = v?.type || "—";
                                    const model = v?.model || "";
                                    const license = v?.licensePlate || "—";
                                    const capacity = Number.isFinite(
                                      Number(v?.capacityPerson),
                                    )
                                      ? `${Number(v.capacityPerson)} người`
                                      : "—";
                                    const status = v?.status
                                      ? String(v.status).toUpperCase()
                                      : "";
                                    const statusCls = (() => {
                                      if (!status)
                                        return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700";
                                      if (status === "IN_USE") {
                                        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/30";
                                      }
                                      if (status === "AVAILABLE") {
                                        return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900/30";
                                      }
                                      if (status === "MAINTENANCE") {
                                        return "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-900/30";
                                      }
                                      return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700";
                                    })();

                                    return (
                                      <div
                                        key={
                                          v?.missionVehicleId ??
                                          v?.vehicleId ??
                                          v?.licensePlate ??
                                          idx
                                        }
                                        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4 min-w-[200px] w-full flex flex-col gap-3"
                                      >
                                        <div className="flex items-start justify-between gap-3">
                                          <p className="text-base font-black text-gray-900 dark:text-white leading-snug break-words">
                                            {title}
                                          </p>
                                          {!!status && (
                                            <span
                                              className={`text-xs font-black px-2.5 py-1 rounded-full border whitespace-nowrap ${statusCls}`}
                                            >
                                              {status}
                                            </span>
                                          )}
                                        </div>

                                        <p className="text-sm font-bold text-gray-500 break-words">
                                          {model || "—"}
                                        </p>

                                        <div className="mt-auto pt-1 flex items-center gap-2 flex-wrap">
                                          <span className="text-xs font-black px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                                            Biển số: {license}
                                          </span>
                                          <span className="text-xs font-black px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                                            Sức chứa: {capacity}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 flex items-center gap-3">
                                  <span className="material-symbols-outlined text-gray-400">
                                    no_transfer
                                  </span>
                                  <p className="text-sm font-bold text-gray-500">
                                    Chưa có phương tiện được gán.
                                  </p>
                                </div>
                              )}
                            </div>

                            {mission?.missionType === "RELIEF" && (
                              <div>
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="material-symbols-outlined text-gray-400 text-sm">
                                    inventory_2
                                  </span>
                                  <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                                    Vật tư (Supplies)
                                  </p>
                                </div>

                                {mission?.supplies?.length > 0 ? (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {mission.supplies.map((s, idx) => {
                                      const name = s?.itemName || "—";
                                      const type = s?.itemType || "—";
                                      const qty = Number.isFinite(
                                        Number(s?.quantity),
                                      )
                                        ? Number(s.quantity)
                                        : null;

                                      const typeBadgeClass =
                                        type === "FOOD"
                                          ? "bg-green-100 text-green-700"
                                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200";

                                      return (
                                        <div
                                          key={
                                            s?.missionSupplyId ??
                                            s?.inventoryId ??
                                            s?.itemId ??
                                            idx
                                          }
                                          className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3 p-4"
                                        >
                                          <div className="flex justify-between items-start gap-3 min-w-0">
                                            <p className="font-extrabold text-gray-800 dark:text-white text-lg truncate min-w-0">
                                              {name}
                                            </p>

                                            <span
                                              className={`px-2 py-1 text-[10px] font-bold rounded-md whitespace-nowrap ${typeBadgeClass}`}
                                            >
                                              {type}
                                            </span>
                                          </div>

                                          <div className="mt-auto text-right">
                                            {qty !== null ? (
                                              <div className="inline-flex items-baseline gap-2">
                                                <span className="text-sm text-gray-500">
                                                  x
                                                </span>
                                                <span className="text-xl font-black text-gray-800 dark:text-white">
                                                  {qty}
                                                </span>
                                              </div>
                                            ) : (
                                              <span className="text-sm font-bold text-gray-500">
                                                —
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-gray-400">
                                      inventory
                                    </span>
                                    <p className="text-sm font-bold text-gray-500">
                                      Chưa có vật tư được gán.
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="text-gray-500 text-xs font-bold uppercase mb-2">
                            Địa chỉ chính xác
                          </p>
                          <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                            <span className="material-symbols-outlined text-red-500 mt-1 text-2xl">
                              pin_drop
                            </span>
                            <div>
                              <p className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                                {victimAddress}
                              </p>
                              <p className="text-sm font-medium text-gray-500 mt-1">
                                Cách vị trí hiện tại: {distanceLabel}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        ref={mapRef}
                        className="flex flex-col h-full min-h-[400px] bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden border-2 border-white dark:border-gray-600 shadow-lg relative group"
                      >
                        <div className="absolute inset-0">
                          <AssignedMissionMapGoong
                            latitude={request?.coordinates?.[1]}
                            longitude={request?.coordinates?.[0]}
                            onMapReady={setGoongMap}
                          />
                        </div>
                        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
                          <div className="bg-white/90 backdrop-blur dark:bg-gray-900/90 px-3 py-2 rounded-lg shadow-md pointer-events-auto">
                            <p className="text-xs font-bold text-gray-500 uppercase">
                              GPS Đội cứu hộ
                            </p>
                            <div className="flex items-center gap-1 text-green-600 font-bold">
                              <span className="material-symbols-outlined text-sm">
                                my_location
                              </span>
                              <span>
                                {gps.status === "ready"
                                  ? "Đang cập nhật..."
                                  : gps.status === "error"
                                    ? "Không khả dụng"
                                    : "Đang cập nhật..."}
                              </span>
                            </div>
                          </div>
                          <div
                            className="bg-white/90 backdrop-blur dark:bg-gray-900/90 p-2 rounded-lg shadow-md pointer-events-auto cursor-pointer hover:bg-white dark:hover:bg-gray-800"
                            role="button"
                            tabIndex={0}
                            onClick={handleStartNavigation}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ")
                                handleStartNavigation();
                            }}
                          >
                            <span className="material-symbols-outlined text-gray-700 dark:text-gray-300">
                              layers
                            </span>
                          </div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                          <button
                            type="button"
                            disabled={!canStartNavigation}
                            className={`w-full bg-blue-600 hover:bg-blue-500 text-white h-14 rounded-xl flex items-center justify-center gap-2 text-lg font-black shadow-xl transition-all transform active:scale-[0.98] border-2 border-blue-400/50 ${
                              canStartNavigation
                                ? ""
                                : "opacity-60 cursor-not-allowed hover:bg-blue-600"
                            }`}
                            onClick={handleStartNavigation}
                          >
                            <span className="material-symbols-outlined text-3xl">
                              turn_right
                            </span>
                            {startingNavigation
                              ? "ĐANG TẢI..."
                              : "BẮT ĐẦU DẪN ĐƯỜNG"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 p-6 lg:p-8">
                    <h3 className="text-center text-gray-400 text-xs font-bold uppercase tracking-[0.2em] mb-6">
                      Tiến độ thực hiện
                    </h3>
                    <div className="mb-8">
                      <MissionProgress
                        missionId={mission?.id}
                        initialStatus={mission?.status || "IN_PROGRESS"}
                        onStatusChange={(nextStatus) => {
                          setMission((prev) =>
                            prev ? { ...prev, status: nextStatus } : prev,
                          );
                          if (nextStatus === "ARRIVED") setProgressStep(2);
                          if (nextStatus === "COMPLETED") {
                            setProgressStep(3);
                            localStorage.removeItem(
                              STORAGE_KEYS.activeRequestId,
                            );
                            setRouteSummary(null);
                            setNavigationActive(false);
                            setRequest(null);
                            setMission(null);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      <button
        type="button"
        className="md:hidden fixed bottom-6 left-6 w-16 h-16 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-black shadow-2xl z-50 ring-4 ring-gray-900/20 dark:ring-white/20"
        onClick={handleLogout}
        aria-label="Đăng xuất"
      >
        <span className="material-symbols-outlined text-4xl">logout</span>
      </button>
    </div>
  );
};

export default RescueTeamDashboard;
