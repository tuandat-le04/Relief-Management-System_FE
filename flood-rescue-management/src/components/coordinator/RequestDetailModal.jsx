import React, { useState, useEffect } from "react";

const PRIORITY_CONFIG = {
  CRITICAL: {
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-300",
    label: "Nguy kịch",
    dot: "bg-red-600",
  },
  HIGH: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-300",
    label: "Ưu tiên cao",
    dot: "bg-orange-500",
  },
  MEDIUM: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    border: "border-yellow-300",
    label: "Trung bình",
    dot: "bg-yellow-500",
  },
  NORMAL: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-300",
    label: "Bình thường",
    dot: "bg-blue-500",
  },
  LOW: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-300",
    label: "Thấp",
    dot: "bg-slate-400",
  },
};

const STATUS_CONFIG = {
  CREATED: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    label: "Chờ xử lý",
    icon: "pending_actions",
  },
  IN_PROGRESS: {
    bg: "bg-green-100",
    text: "text-green-700",
    label: "Đang xử lý",
    icon: "autorenew",
  },
  COMPLETED: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    label: "Hoàn thành",
    icon: "task_alt",
  },
  CANCELLED: {
    bg: "bg-gray-100",
    text: "text-gray-600",
    label: "Đã từ chối",
    icon: "cancel",
  },
};

const TYPE_CONFIG = {
  RESCUE: {
    icon: "emergency",
    color: "text-red-600",
    bg: "bg-red-50",
    label: "Cứu hộ",
  },
  RELIEF: {
    icon: "volunteer_activism",
    color: "text-green-600",
    bg: "bg-green-50",
    label: "Cứu trợ",
  },
  OTHER: {
    icon: "help",
    color: "text-slate-500",
    bg: "bg-slate-50",
    label: "Khác",
  },
};

const Row = ({ icon, label, children }) => (
  <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
    <span className="material-symbols-outlined text-slate-400 text-base mt-0.5 flex-shrink-0">
      {icon}
    </span>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <div className="text-sm text-slate-800">{children}</div>
    </div>
  </div>
);

const formatDateTime = (isoString) => {
  if (!isoString) return "—";
  const d = new Date(isoString);
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const RequestDetailModal = ({ isOpen, onClose, request }) => {
  const [lightboxIdx, setLightboxIdx] = useState(null);

  // Reset lightbox khi đóng/mở modal
  useEffect(() => {
    if (!isOpen) setLightboxIdx(null);
  }, [isOpen]);

  // Đóng lightbox khi nhấn Escape / điều hướng bằng mũi tên
  useEffect(() => {
    if (lightboxIdx === null) return;
    const handler = (e) => {
      if (e.key === "Escape") setLightboxIdx(null);
      if (e.key === "ArrowRight")
        setLightboxIdx((i) => (i + 1) % medias.length);
      if (e.key === "ArrowLeft")
        setLightboxIdx((i) => (i - 1 + medias.length) % medias.length);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIdx]);

  if (!isOpen || !request) return null;

  // Theo F4: media đã nhúng sẵn trong response từ GET /rescue-requests
  // Mỗi phần tử là { id, mediaUrl, mediaType, fileSize, mimeType, createdAt }
  const medias = request.medias ?? [];

  const priority =
    PRIORITY_CONFIG[request.priority] || PRIORITY_CONFIG["NORMAL"];
  const status = STATUS_CONFIG[request.status] || STATUS_CONFIG["CREATED"];
  const reqType = TYPE_CONFIG[request.requestType] || TYPE_CONFIG["OTHER"];

  // Theo F3: phân loại bằng mediaType (IMAGE / VIDEO), không check extension
  const isVideo = (media) => media.mediaType === "VIDEO";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      {/* ── Lightbox ── */}
      {lightboxIdx !== null && medias.length > 0 && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setLightboxIdx(null)}
        >
          {/* Điều hướng trái */}
          {medias.length > 1 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/30 hover:bg-black/60 rounded-full p-3 transition-all z-10"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIdx(
                  (lightboxIdx - 1 + medias.length) % medias.length,
                );
              }}
            >
              <span className="material-symbols-outlined text-2xl">
                chevron_left
              </span>
            </button>
          )}

          <div
            className="relative flex flex-col items-center max-w-5xl max-h-[90vh] px-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Theo F3: dùng mediaType để phân biệt, dùng mimeType cho <source> */}
            {isVideo(medias[lightboxIdx]) ? (
              <video
                controls
                autoPlay
                className="max-h-[80vh] max-w-full rounded-xl shadow-2xl"
              >
                <source
                  src={medias[lightboxIdx].mediaUrl}
                  type={medias[lightboxIdx].mimeType}
                />
                Trình duyệt không hỗ trợ video.
              </video>
            ) : (
              <img
                src={medias[lightboxIdx].mediaUrl}
                alt={`Ảnh ${lightboxIdx + 1}`}
                className="max-h-[80vh] max-w-full rounded-xl shadow-2xl object-contain"
              />
            )}
            <p className="text-white/60 text-sm mt-3">
              {lightboxIdx + 1} / {medias.length}
              {medias.length > 1 && (
                <span className="ml-2 text-white/40">
                  ← → để chuyển, Esc để đóng
                </span>
              )}
            </p>
          </div>

          {/* Điều hướng phải */}
          {medias.length > 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/30 hover:bg-black/60 rounded-full p-3 transition-all z-10"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIdx((lightboxIdx + 1) % medias.length);
              }}
            >
              <span className="material-symbols-outlined text-2xl">
                chevron_right
              </span>
            </button>
          )}

          {/* Nút đóng */}
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/30 hover:bg-black/60 rounded-full p-2 transition-all z-10"
            onClick={() => setLightboxIdx(null)}
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>

          {/* Thanh thumbnail nhỏ phía dưới */}
          {medias.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4">
              {medias.map((media, idx) => (
                <button
                  key={media.id ?? idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIdx(idx);
                  }}
                  className={`w-12 h-10 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                    idx === lightboxIdx
                      ? "border-white scale-110"
                      : "border-white/30 opacity-60 hover:opacity-100"
                  }`}
                >
                  {isVideo(media) ? (
                    <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-sm">
                        videocam
                      </span>
                    </div>
                  ) : (
                    <img
                      src={media.mediaUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 ${reqType.bg} rounded-xl flex items-center justify-center flex-shrink-0`}
              >
                <span
                  className={`material-symbols-outlined text-2xl ${reqType.color}`}
                >
                  {reqType.icon}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${status.bg} ${status.text}`}
                  >
                    <span className="material-symbols-outlined text-xs align-middle mr-0.5">
                      {status.icon}
                    </span>
                    {status.label}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${priority.bg} ${priority.text}`}
                  >
                    {priority.label}
                  </span>
                </div>
                <h2 className="text-white font-bold text-base leading-tight">
                  Yêu cầu #{request.id} — {reqType.label}
                </h2>
                <p className="text-slate-400 text-xs mt-0.5">
                  {formatDateTime(request.createdAt)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors flex-shrink-0 mt-1"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Body – scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Người gửi */}
          <div className="mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Thông tin người gửi
            </h3>
            <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 divide-y divide-slate-100">
              <Row icon="person" label="Tên người dùng">
                {request.name || "—"}
              </Row>
              <Row icon="phone" label="Số điện thoại">
                {request.phone ? (
                  <a
                    href={`tel:${request.phone}`}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    {request.phone}
                  </a>
                ) : (
                  "—"
                )}
              </Row>
            </div>
          </div>

          {/* Nội dung yêu cầu */}
          <div className="mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Nội dung yêu cầu
            </h3>
            <div className="bg-slate-50 rounded-xl border border-slate-200 px-4 divide-y divide-slate-100">
              <Row icon="category" label="Loại yêu cầu">
                <span
                  className={`inline-flex items-center gap-1.5 font-semibold ${reqType.color}`}
                >
                  <span className="material-symbols-outlined text-base">
                    {reqType.icon}
                  </span>
                  {reqType.label}
                </span>
              </Row>
              <Row icon="flag" label="Mức độ ưu tiên">
                <span
                  className={`inline-flex items-center gap-1.5 font-semibold ${priority.text}`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${priority.dot}`}
                  />
                  {priority.label}
                </span>
              </Row>
              <Row icon="description" label="Mô tả tình huống">
                <p className="leading-relaxed">
                  {request.description || "Không có mô tả"}
                </p>
              </Row>
              {request.requestSupplies && (
                <Row icon="inventory_2" label="Vật tư yêu cầu">
                  <p className="leading-relaxed">{request.requestSupplies}</p>
                </Row>
              )}
            </div>
          </div>

          {/* ── Hình ảnh / Video đính kèm ── */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Hình ảnh / Video đính kèm
              </h3>
              {medias.length > 0 && (
                <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {medias.length} tệp
                </span>
              )}
            </div>

            {/* Có media → hiển thị grid */}
            {medias.length > 0 && (
              <div
                className={`grid gap-2 ${medias.length === 1 ? "grid-cols-1" : medias.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}
              >
                {medias.map((media, idx) => (
                  <button
                    key={media.id ?? idx}
                    onClick={() => setLightboxIdx(idx)}
                    className="relative group overflow-hidden rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all bg-slate-100"
                    style={{ aspectRatio: medias.length === 1 ? "16/9" : "1" }}
                    title="Phóng to"
                  >
                    {/* Theo F3: dùng mediaType để phân loại, không check extension */}
                    {isVideo(media) ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 gap-2">
                        <span className="material-symbols-outlined text-white text-3xl">
                          play_circle
                        </span>
                        <span className="text-white/70 text-[10px]">
                          {media.mimeType || "Video"}
                        </span>
                      </div>
                    ) : (
                      <img
                        src={media.mediaUrl}
                        alt={`Ảnh ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling?.classList.remove("hidden");
                        }}
                      />
                    )}
                    {/* Fallback lỗi ảnh */}
                    <div className="hidden w-full h-full absolute inset-0 flex flex-col items-center justify-center bg-slate-100 gap-1">
                      <span className="material-symbols-outlined text-slate-400 text-2xl">
                        broken_image
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Lỗi tải ảnh
                      </span>
                    </div>
                    {/* Overlay zoom khi hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <span className="material-symbols-outlined text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity drop-shadow">
                        zoom_in
                      </span>
                    </div>
                    {/* Badge số thứ tự */}
                    <span className="absolute top-1.5 left-1.5 bg-black/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                      {idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Không có media */}
            {medias.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 py-7 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <span className="material-symbols-outlined text-slate-300 text-4xl">
                  photo_library
                </span>
                <p className="text-sm text-slate-400 font-medium">
                  Chưa có hình ảnh đính kèm
                </p>
              </div>
            )}
          </div>

          {/* Thời gian */}
          <div className="mb-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Thời gian
            </h3>
            <div className="bg-slate-50 rounded-xl border border-slate-200 px-4">
              <Row icon="schedule" label="Thời gian tạo">
                {formatDateTime(request.createdAt)}
              </Row>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-900 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailModal;
