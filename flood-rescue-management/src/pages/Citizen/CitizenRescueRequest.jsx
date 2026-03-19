import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import api from "../../services/api";
import CitizenMapGoong from "../../components/citizen/CitizenMapGoong";
import avatarUser from "../../assets/images/avatar-user.png";

const MAX_MEDIA_FILES = 5;
const MAX_MEDIA_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

const formatBytes = (bytes) => {
  const size = Number(bytes);
  if (!Number.isFinite(size) || size <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const idx = Math.min(
    units.length - 1,
    Math.floor(Math.log(size) / Math.log(1024)),
  );
  const value = size / 1024 ** idx;
  return `${value.toFixed(value >= 10 || idx === 0 ? 0 : 1)} ${units[idx]}`;
};

const isAllowedMediaType = (mime) => {
  if (!mime) return false;
  return mime.startsWith("image/") || mime.startsWith("video/");
};

export default function CitizenRescueRequest({
  requestId: requestIdProp,
} = {}) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [mediaItems, setMediaItems] = useState([]);
  const [mediaError, setMediaError] = useState("");
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState([]);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    description: "",
    images: null,
  });

  const [coords, setCoords] = useState({ latitude: null, longitude: null });
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);

  const resolvedRequestIdForUpload = useMemo(() => {
    if (requestIdProp != null) {
      const n = Number(requestIdProp);
      return Number.isFinite(n) && n > 0 ? n : null;
    }
    const stored = parseInt(
      localStorage.getItem("lastRescueRequestId") || "",
      10,
    );
    return Number.isFinite(stored) && stored > 0 ? stored : null;
  }, [requestIdProp]);

  useEffect(() => {
    return () => {
      mediaItems.forEach((it) => {
        try {
          URL.revokeObjectURL(it.previewUrl);
        } catch {
          // ignore
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentUser = authService.getCurrentUser();
  const displayName =
    currentUser?.fullName ||
    currentUser?.username ||
    currentUser?.name ||
    "Người dùng";
  const roleLabel =
    currentUser?.role === "CITIZEN" ? "Người dân" : "Người dùng";
  const avatarUrl = currentUser?.avatar || avatarUser;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const addSelectedMediaFiles = (fileList) => {
    setMediaError("");
    const incoming = Array.from(fileList || []);
    if (incoming.length === 0) return;

    setMediaItems((prev) => {
      const next = [...prev];
      const errors = [];

      for (const file of incoming) {
        if (next.length >= MAX_MEDIA_FILES) {
          errors.push(`Chỉ được chọn tối đa ${MAX_MEDIA_FILES} file.`);
          break;
        }
        if (!isAllowedMediaType(file.type)) {
          errors.push(
            `File "${file.name}" không đúng định dạng (chỉ cho phép ảnh/video).`,
          );
          continue;
        }
        if (file.size > MAX_MEDIA_SIZE_BYTES) {
          errors.push(
            `File "${file.name}" vượt quá 20MB (${formatBytes(file.size)}).`,
          );
          continue;
        }

        const previewUrl = URL.createObjectURL(file);
        const id =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        next.push({
          id,
          file,
          previewUrl,
          kind: file.type.startsWith("video/") ? "video" : "image",
        });
      }

      if (errors.length > 0) {
        setMediaError(errors[0]);
        window.alert(errors.join("\n"));
      }

      return next;
    });
  };

  const handlePickMediaClick = () => {
    fileInputRef.current?.click();
  };

  const handleMediaInputChange = (e) => {
    addSelectedMediaFiles(e.target.files);
    setFormData((prev) => ({ ...prev, images: e.target.files }));
    e.target.value = "";
  };

  const handleRemoveMedia = (id) => {
    setMediaItems((prev) => {
      const target = prev.find((x) => x.id === id);
      if (target) {
        try {
          URL.revokeObjectURL(target.previewUrl);
        } catch {
          // ignore
        }
      }
      return prev.filter((x) => x.id !== id);
    });
  };

  const uploadMediaFiles = async (requestId, items) => {
    if (!requestId) throw new Error("Thiếu requestId để upload media");
    if (!items || items.length === 0) return { success: 0, failed: 0 };

    setIsUploadingMedia(true);
    try {
      const results = await Promise.allSettled(
        items.map(async (it) => {
          const formDataUpload = new FormData();
          formDataUpload.append("file", it.file);

          const res = await api.post(
            `/rescue-requests/${requestId}/media`,
            formDataUpload,
            {
              headers: { "Content-Type": "multipart/form-data" },
            },
          );
          return res?.data;
        }),
      );

      let successCount = 0;
      let failedCount = 0;
      const uploaded = [];

      for (const r of results) {
        if (r.status === "fulfilled" && r.value?.success) {
          successCount += 1;
          if (r.value?.data) uploaded.push(r.value.data);
        } else {
          failedCount += 1;
        }
      }

      if (uploaded.length > 0) {
        setUploadedMedia((prev) => [...uploaded, ...prev]);
      }

      return { success: successCount, failed: failedCount };
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      const user = currentUser;

      const payload = {
        userId: user?.id ?? user?.userId ?? null,
        phone: formData.phone,
        requestType: "RESCUE",
        latitude: coords.latitude ?? 0,
        longitude: coords.longitude ?? 0,
        description: formData.description || "",
        priority: "CRITICAL",
        requestSupplies: null,
        requestMedia: null,
      };

      const response = await api.post("/rescue-requests/rescue", payload);

      try {
        const created = response?.data?.data;
        const createdId = created?.id != null ? Number(created.id) : null;
        if (created?.id != null)
          localStorage.setItem("lastRescueRequestId", String(created.id));

        // Upload media (if any) after request is created
        if (mediaItems.length > 0 && createdId) {
          const { success, failed } = await uploadMediaFiles(
            createdId,
            mediaItems,
          );
          if (failed === 0) {
            window.alert(
              `Upload thành công ${success}/${mediaItems.length} file.`,
            );
          } else {
            window.alert(
              `Upload xong: ${success}/${mediaItems.length} file thành công, ${failed} file thất bại.`,
            );
          }
        }
      } catch (e) {
        console.warn("Không lưu được lastRescueRequestId:", e);
      }

      alert("Yêu cầu cứu hộ đã được gửi thành công!");
      navigate("/citizen/dashboard");
    } catch (error) {
      console.error("Submit rescue request error", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Gửi yêu cầu cứu hộ thất bại. Vui lòng thử lại.";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillAddressFromCoords = async (latitude, longitude) => {
    try {
      const apiKey = import.meta.env.VITE_GOONG_GEOLOCATION_KEY;
      if (!apiKey) {
        console.warn("Thiếu VITE_GOONG_GEOLOCATION_KEY trong file .env");
        return;
      }

      const url = `https://rsapi.goong.io/geocode?latlng=${latitude},${longitude}&api_key=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();

      const address = data?.results?.[0]?.formatted_address;
      if (address) {
        setFormData((prev) => ({ ...prev, address }));
      }
    } catch (error) {
      console.error("Reverse geocode error", error);
    }
  };

  const handleAutoLocation = async () => {
    try {
      if (!navigator.geolocation) {
        alert("Trình duyệt không hỗ trợ lấy vị trí tự động.");
        return;
      }

      setIsLocating(true);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;

            setCoords({ latitude, longitude });
            await fillAddressFromCoords(latitude, longitude);
          } catch (error) {
            console.error("Auto location error", error);
            alert("Có lỗi khi lấy địa chỉ tự động.");
          } finally {
            setIsLocating(false);
          }
        },
        (error) => {
          console.error("Geolocation error", error);
          alert(
            "Không lấy được vị trí. Vui lòng kiểm tra quyền truy cập vị trí.",
          );
          setIsLocating(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    } catch (e) {
      console.error(e);
      alert("Có lỗi khi lấy vị trí tự động.");
      setIsLocating(false);
    }
  };

  const completedSteps = (() => {
    let steps = 0;
    if (formData.fullName.trim() && formData.phone.trim()) steps += 1;
    if (formData.address.trim() && coords.latitude && coords.longitude)
      steps += 1;
    if (formData.description.trim()) steps += 1;
    return steps;
  })();

  const progressPercent = (completedSteps / 3) * 100;

  return (
    <div className="bg-background-light dark:bg-background-dark font-display min-h-screen text-[#131416] dark:text-white transition-colors duration-200">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-[#dee0e3] dark:border-gray-800">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="resq-brand-mark-sm">
              <span className="material-symbols-outlined block text-xl">
                emergency
              </span>
            </div>
            <h2 className="resq-brand-title text-xl">ResQ</h2>
            <span className="hidden md:inline-flex bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Trực tuyến 24/7
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              <button
                onClick={() => navigate("/citizen/dashboard")}
                className="hover:text-primary transition-colors"
              >
                Trang chủ
              </button>
              <a className="hover:text-primary transition-colors" href="#">
                Bản đồ cứu hộ
              </a>
              <a className="hover:text-primary transition-colors" href="#">
                Hướng dẫn
              </a>
            </div>
            {currentUser ? (
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 p-1 pl-1 pr-3 rounded-full transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700 group">
                  <div className="size-8 bg-gray-200 rounded-full overflow-hidden ring-2 ring-white dark:ring-gray-800 shadow-sm group-hover:ring-primary/20 transition-all">
                    <img
                      alt="User Avatar"
                      className="w-full h-full object-cover"
                      src={avatarUrl}
                    />
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-bold text-gray-900 dark:text-gray-100 leading-tight">
                      {displayName}
                    </p>
                    <p className="text-[10px] text-gray-500 font-medium">
                      {roleLabel}
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 whitespace-nowrap"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-primary/90 transition-all"
              >
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[960px] mx-auto px-4 py-8 md:py-12">
        {/* Page Heading */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4">
            Gửi Cứu Hộ Khẩn Cấp
          </h1>
          <p className="text-[#6b7680] dark:text-gray-400 text-lg md:text-xl max-w-2xl">
            Vui lòng điền thông tin chính xác để đội cứu hộ có thể tiếp cận bạn
            nhanh nhất. Mọi dữ liệu đều được bảo mật.
          </p>
        </div>

        {/* Progress */}
        <div className="bg-white dark:bg-gray-900 border border-[#dee0e3] dark:border-gray-800 rounded-xl p-6 shadow-sm mb-10">
          <div className="flex justify-between items-center mb-4">
            <p className="text-lg font-bold">Tiến trình yêu cầu</p>
            <p className="text-primary font-bold text-sm bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full border border-red-100 dark:border-red-800">
              {completedSteps}/3 bước {completedSteps === 3 ? "hoàn tất" : ""}
            </p>
          </div>
          <div className="w-full bg-[#dee0e3] dark:bg-gray-800 h-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-3 text-[#6b7680] dark:text-gray-400 text-sm italic">
            {completedSteps === 3
              ? "Sẵn sàng gửi yêu cầu cứu hộ ngay bây giờ."
              : "Vui lòng hoàn thành đủ thông tin ở các bước trên."}
          </p>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Personal Info */}
          <section className="bg-white dark:bg-gray-900 border border-[#dee0e3] dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
            <div className="border-b border-[#f1f2f3] dark:border-gray-800 px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  person
                </span>
                1. Thông tin người cần cứu hộ
              </h3>
            </div>
            <div className="p-6 grid md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[#131416] dark:text-gray-200 text-lg font-bold">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="h-14 rounded-lg border border-[#dee0e3] dark:border-gray-700 bg-white dark:bg-gray-800 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 px-4"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  type="text"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[#131416] dark:text-gray-200 text-lg font-bold">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="h-14 rounded-lg border border-[#dee0e3] dark:border-gray-700 bg-white dark:bg-gray-800 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 px-4"
                  placeholder="Nhập số điện thoại để liên lạc"
                  type="tel"
                  required
                />
              </div>
            </div>
          </section>

          {/* Section 2: Location */}
          <section className="bg-white dark:bg-gray-900 border border-[#dee0e3] dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
            <div className="border-b border-[#f1f2f3] dark:border-gray-800 px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  location_on
                </span>
                2. Vị trí hiện tại
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-[#131416] dark:text-gray-200 text-lg font-bold">
                  Địa chỉ chi tiết <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col md:flex-row gap-4">
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="flex-1 h-14 rounded-lg border border-[#dee0e3] dark:border-gray-700 bg-white dark:bg-gray-800 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 px-4"
                    placeholder="Số nhà, tên đường, thôn/xóm..."
                    type="text"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleAutoLocation}
                    className="bg-primary/10 hover:bg-primary/20 text-primary h-14 px-6 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={isLocating}
                  >
                    <span className="material-symbols-outlined">
                      my_location
                    </span>
                    {isLocating ? "Đang lấy vị trí..." : "Lấy vị trí tự động"}
                  </button>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden border border-[#dee0e3] dark:border-gray-700 h-48 bg-gray-100 relative">
                <button
                  type="button"
                  onClick={() => setIsMapOpen(true)}
                  className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="bg-white/90 dark:bg-black/80 px-4 py-2 rounded-full shadow-lg border border-primary/20 flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-600">
                      location_on
                    </span>
                    <span className="font-medium text-sm">
                      Chọn vị trí trên bản đồ
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </section>

          {/* Section 3: Situation */}
          <section className="bg-white dark:bg-gray-900 border border-[#dee0e3] dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
            <div className="border-b border-[#f1f2f3] dark:border-gray-800 px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  report_problem
                </span>
                3. Chi tiết tình trạng
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-[#131416] dark:text-gray-200 text-lg font-bold">
                  Mô tả tình trạng <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-[#dee0e3] dark:border-gray-700 bg-white dark:bg-gray-800 text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 p-4"
                  placeholder="Ví dụ: Nước đang dâng cao, nhà có 2 người già và 1 trẻ em, đang ở trên tầng 2..."
                  rows="4"
                  required
                ></textarea>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[#131416] dark:text-gray-200 text-lg font-bold">
                  Ảnh hoặc Video (nếu có)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={handleMediaInputChange}
                />
                <div
                  className="border-2 border-dashed border-[#dee0e3] dark:border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center gap-3 bg-gray-50/30 dark:bg-gray-800/30 hover:bg-gray-100/50 transition-colors cursor-pointer group"
                  role="button"
                  tabIndex={0}
                  onClick={handlePickMediaClick}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      handlePickMediaClick();
                  }}
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-primary text-3xl font-light">
                      photo_camera
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">
                      Chạm để chụp ảnh hoặc tải lên
                    </p>
                    <p className="text-[#6b7680] text-sm">
                      Hệ thống sẽ tự động giảm dung lượng để gửi nhanh hơn
                    </p>
                    <p className="text-[#6b7680] text-xs mt-2 font-medium">
                      Đã chọn: {mediaItems.length}/{MAX_MEDIA_FILES} • Tối đa
                      20MB/file
                    </p>
                  </div>
                </div>

                {mediaError && (
                  <p className="mt-4 text-sm font-semibold text-red-600">
                    {mediaError}
                  </p>
                )}

                {mediaItems.length > 0 && (
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {mediaItems.map((it) => (
                      <div
                        key={it.id}
                        className="bg-white dark:bg-gray-900 border border-[#dee0e3] dark:border-gray-700 rounded-xl overflow-hidden shadow-sm"
                      >
                        <div className="w-full aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                          {it.kind === "video" ? (
                            <video
                              src={it.previewUrl}
                              className="w-full h-full object-cover"
                              controls
                              preload="metadata"
                              muted
                            />
                          ) : (
                            <img
                              src={it.previewUrl}
                              alt={it.file.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                            {it.file.name}
                          </p>
                          <p className="text-xs text-[#6b7680] dark:text-gray-400 font-medium">
                            {formatBytes(it.file.size)}
                          </p>
                          <button
                            type="button"
                            className="mt-2 text-xs font-semibold text-red-600 hover:text-red-700"
                            onClick={() => handleRemoveMedia(it.id)}
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {(isUploadingMedia || uploadedMedia.length > 0) && (
                  <div className="mt-6 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 p-4 rounded-xl shadow-sm">
                    <p className="text-sm font-bold text-red-700 dark:text-red-300">
                      {isUploadingMedia
                        ? "Đang upload ảnh/video..."
                        : `Đã upload thành công: ${uploadedMedia.length} file`}
                    </p>
                    {resolvedRequestIdForUpload && (
                      <p className="text-xs text-red-700/80 dark:text-red-200/80 font-medium mt-1">
                        RequestId: {resolvedRequestIdForUpload}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Massive Action Button */}
          <div className="py-10">
            <button
              type="submit"
              className="w-full bg-[#218838] hover:bg-[#19692c] text-white py-6 rounded-2xl text-2xl md:text-3xl font-black uppercase tracking-wider shadow-xl shadow-green-500/20 transform active:scale-[0.98] transition-all flex items-center justify-center gap-4"
            >
              <span className="material-symbols-outlined text-4xl">send</span>
              GỬI YÊU CẦU NGAY
            </button>
            <div className="mt-6 flex flex-col items-center text-center gap-3">
              <p className="text-[#6b7680] dark:text-gray-400 font-medium">
                Thông tin của bạn đang được mã hóa và gửi tới trung tâm điều
                phối gần nhất.
              </p>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold uppercase tracking-widest">
                <span className="material-symbols-outlined text-sm">lock</span>
                Bảo mật cấp chính phủ
              </div>
            </div>
          </div>
        </form>
      </main>

      {isMapOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl h-[70vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  map
                </span>
                Chọn vị trí cứu hộ
              </h3>
              <button
                type="button"
                onClick={() => setIsMapOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1">
              <CitizenMapGoong
                initialCoords={
                  coords.latitude && coords.longitude ? coords : null
                }
                onSelectLocation={async ({ latitude, longitude }) => {
                  setCoords({ latitude, longitude });
                  await fillAddressFromCoords(latitude, longitude);
                }}
              />
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-sm">
              <div className="text-gray-600 dark:text-gray-300">
                Tọa độ đã chọn:{" "}
                {coords.latitude && coords.longitude
                  ? `${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)}`
                  : "Chưa chọn"}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsMapOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => setIsMapOpen(false)}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90"
                >
                  Xác nhận vị trí
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Sidebar (Sticky Desktop) */}
      <aside className="hidden xl:block fixed right-8 top-32 w-64 space-y-4">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-5 rounded-xl">
          <h4 className="text-red-600 dark:text-red-400 font-black text-sm uppercase mb-3 tracking-widest">
            Liên hệ khẩn cấp
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-red-100 dark:border-red-800 pb-2">
              <span className="font-bold">Cảnh sát</span>
              <span className="text-2xl font-black text-red-600">113</span>
            </div>
            <div className="flex justify-between items-center border-b border-red-100 dark:border-red-800 pb-2">
              <span className="font-bold">Cứu hỏa</span>
              <span className="text-2xl font-black text-red-600">114</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold">Cấp cứu</span>
              <span className="text-2xl font-black text-red-600">115</span>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-5 rounded-xl">
          <h4 className="text-blue-600 dark:text-blue-400 font-bold text-xs uppercase mb-2">
            Lời khuyên an toàn
          </h4>
          <p className="text-sm leading-relaxed text-blue-800 dark:text-blue-200">
            Hãy giữ bình tĩnh, di chuyển lên vị trí cao hơn và luôn để điện
            thoại ở chế độ tiết kiệm pin.
          </p>
        </div>
      </aside>

      {/* Footer Information */}
      <footer className="bg-white dark:bg-background-dark border-t border-[#dee0e3] dark:border-gray-800 py-12 mt-12">
        <div className="max-w-[1200px] mx-auto px-6 grid md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary p-1 rounded text-white">
                <span className="material-symbols-outlined block text-sm">
                  emergency
                </span>
              </div>
              <span className="font-bold">
                Hệ thống Điều phối Cứu hộ Quốc gia
              </span>
            </div>
            <p className="text-sm text-[#6b7680] max-w-sm">
              Phát triển bởi Ban Chỉ đạo Quốc gia về Phòng chống thiên tai. Hệ
              thống kết nối người dân với các đơn vị cứu hộ quân đội, công an và
              tình nguyện viên.
            </p>
          </div>
          <div>
            <h5 className="font-bold mb-4 text-sm uppercase tracking-wider">
              Thông tin
            </h5>
            <ul className="text-sm space-y-2 text-[#6b7680]">
              <li>
                <a className="hover:text-primary" href="#">
                  Về chúng tôi
                </a>
              </li>
              <li>
                <a className="hover:text-primary" href="#">
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a className="hover:text-primary" href="#">
                  Điều khoản sử dụng
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-4 text-sm uppercase tracking-wider">
              Hỗ trợ
            </h5>
            <ul className="text-sm space-y-2 text-[#6b7680]">
              <li>
                <a className="hover:text-primary" href="#">
                  Câu hỏi thường gặp
                </a>
              </li>
              <li>
                <a className="hover:text-primary" href="#">
                  Báo lỗi hệ thống
                </a>
              </li>
              <li>
                <a className="hover:text-primary" href="#">
                  Cẩm nang thoát nạn
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto px-6 mt-12 pt-8 border-t border-[#f1f2f3] dark:border-gray-800 text-center text-xs text-[#6b7680]">
          © 2024 Cứu Hộ Việt Nam. Một sáng kiến vì cộng đồng.
        </div>
      </footer>
    </div>
  );
}
