import React, { useState } from "react";

export const getPriorityColor = (priority) => {
  if (priority === "CRITICAL") return "border-red-600";
  if (priority === "HIGH") return "border-orange-500";
  if (priority === "MEDIUM") return "border-yellow-400";
  if (priority === "LOW") return "border-slate-300";
  return "border-blue-400"; // NORMAL
};

export const getStatusBadge = (status) => {
  if (status === "ACCEPTED") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 uppercase tracking-wide">
        Đã tiếp nhận
      </span>
    );
  }
  if (status === "IN_PROGRESS") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-600 uppercase tracking-wide">
        Đang xử lý
      </span>
    );
  }
  if (status === "COMPLETED") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wide">
        Hoàn thành
      </span>
    );
  }
  if (status === "CANCELLED") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 uppercase tracking-wide">
        Đã từ chối
      </span>
    );
  }
  return null;
};

const MISSION_STATUS_UI = {
  PENDING: {
    label: "Chờ khởi động",
    className: "bg-slate-100 text-slate-600",
    note: "Đang chờ đội bắt đầu nhiệm vụ",
  },
  ASSIGNED: {
    label: "Đã phân công",
    className: "bg-blue-100 text-blue-700",
    note: "Đã phân công đội, chờ team cập nhật tiến độ",
  },
  IN_PROGRESS: {
    label: "Đang di chuyển",
    className: "bg-orange-100 text-orange-700",
    note: "Team đang di chuyển tới hiện trường",
  },
  ARRIVED: {
    label: "Đã đến nơi",
    className: "bg-teal-100 text-teal-700",
    note: "Team đã có mặt tại hiện trường",
  },
  COMPLETED: {
    label: "Team đã hoàn thành",
    className: "bg-emerald-100 text-emerald-700",
    note: "Team đã gửi báo cáo hoàn thành, chờ xác nhận",
  },
  CANCELLED: {
    label: "Đã hủy",
    className: "bg-red-100 text-red-700",
    note: "Nhiệm vụ đã bị hủy",
  },
};

const getMissionStatusUi = (status) => {
  if (!status) return MISSION_STATUS_UI.PENDING;
  return MISSION_STATUS_UI[status] || MISSION_STATUS_UI.PENDING;
};

const PRIORITY_CONFIG = {
  CRITICAL: { bg: "bg-red-100", text: "text-red-600", label: "Nguy kịch" },
  HIGH: { bg: "bg-orange-100", text: "text-orange-600", label: "Ưu tiên cao" },
  MEDIUM: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Trung bình" },
  NORMAL: { bg: "bg-blue-100", text: "text-blue-600", label: "Bình thường" },
  LOW: { bg: "bg-slate-100", text: "text-slate-500", label: "Thấp" },
};

export const getPriorityBadge = (priority) => {
  const c = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG["NORMAL"];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${c.bg} ${c.text} uppercase tracking-wide`}
    >
      {c.label}
    </span>
  );
};

const RequestCard = ({
  request,
  stage,
  mission,
  onApprove,
  onComplete,
  onCancel,
  onClassify,
  onDetail,
  onFlyTo,
  onAssign,
}) => {
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const requestStage = stage || request.status;
  const missionStatusUi = getMissionStatusUi(mission?.status);
  const teamDone = mission?.status === "COMPLETED";
  const hasMission = !!mission?.id;

  const flowLabel =
    requestStage === "pending"
      ? "Bước 1/4 · Chờ tiếp nhận"
      : requestStage === "accepted"
        ? "Bước 2/4 · Đã tiếp nhận"
        : requestStage === "inprogress"
          ? "Bước 3/4 · Team đang xử lý"
          : requestStage === "completed"
            ? "Bước 4/4 · Hoàn thành"
            : "Đã từ chối";

  const acceptedHint = hasMission
    ? `Đã có nhiệm vụ #${mission.id}. Chờ team xuất hiện ở danh sách active hoặc cập nhật trạng thái.`
    : "Yêu cầu đã tiếp nhận. Vui lòng phân công đội và phương tiện để bắt đầu xử lý.";
  // Theo F4: media đã nhúng sẵn trong response, không cần fetch riêng
  // request.medias = mảng object đầy đủ, request.mediaList = mảng URL
  const medias = request.medias ?? [];
  const hasMedia = medias.length > 0;
  const previewList = medias.slice(0, 3);
  const extraCount = medias.length - 3;

  return (
    <div
      className={`relative group bg-white rounded-xl border-l-4 ${getPriorityColor(request.priority)} shadow-sm hover:shadow-md transition-all overflow-hidden`}
    >
      {/* Lightbox inline */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            className="absolute top-5 right-5 text-white/80 hover:text-white"
            onClick={() => setLightboxUrl(null)}
          >
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>
          <img
            src={lightboxUrl}
            alt="Ảnh phóng to"
            className="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            {getStatusBadge(
              requestStage === "accepted"
                ? "ACCEPTED"
                : requestStage === "inprogress"
                  ? "IN_PROGRESS"
                  : request.status,
            )}
            {requestStage === "pending" && getPriorityBadge(request.priority)}
          </div>
          <div className="flex items-center gap-2">
            {hasMedia && (
              <span className="flex items-center gap-0.5 text-[10px] font-semibold text-slate-400">
                <span className="material-symbols-outlined text-xs">
                  photo_library
                </span>
                {medias.length}
              </span>
            )}
            <span className="text-xs font-medium text-slate-400">
              {request.time}
            </span>
          </div>
        </div>
        <h3 className="text-base font-bold text-slate-900 mb-1">
          {request.name} - {request.type}
        </h3>
        <p className="text-sm text-slate-500 flex items-center gap-1 mb-3">
          <span className="material-symbols-outlined text-sm">location_on</span>
          {request.location}
        </p>

        <div className="mb-3 flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 uppercase tracking-wide">
            {flowLabel}
          </span>
          {mission?.status &&
            requestStage !== "completed" &&
            requestStage !== "cancelled" && (
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${missionStatusUi.className}`}
              >
                Mission: {mission.status}
              </span>
            )}
        </div>

        {/* ── Thumbnail strip ── */}
        {hasMedia && (
          <div className="mb-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {previewList.map((media, idx) => (
                <button
                  key={media.id ?? idx}
                  onClick={() => setLightboxUrl(media.mediaUrl)}
                  className="relative flex-shrink-0 w-16 h-14 rounded-lg overflow-hidden border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group/thumb"
                  title="Phóng to"
                >
                  {media.mediaType === "VIDEO" ? (
                    <div className="w-full h-full bg-slate-800 flex flex-col items-center justify-center gap-0.5">
                      <span className="material-symbols-outlined text-white text-base">
                        play_circle
                      </span>
                      <span className="text-white/60 text-[9px]">Video</span>
                    </div>
                  ) : (
                    <img
                      src={media.mediaUrl}
                      alt={`Ảnh ${idx + 1}`}
                      className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform"
                      onError={(e) => {
                        e.target.parentElement.classList.add("bg-slate-100");
                        e.target.style.display = "none";
                      }}
                    />
                  )}
                  {/* overlay icon khi hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/25 transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-base opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                      zoom_in
                    </span>
                  </div>
                </button>
              ))}
              {extraCount > 0 && (
                <button
                  onClick={() => onDetail(request)}
                  className="flex-shrink-0 w-16 h-14 rounded-lg border border-slate-200 bg-slate-100 hover:bg-slate-200 transition-colors flex flex-col items-center justify-center gap-0.5"
                  title="Xem tất cả ảnh"
                >
                  <span className="material-symbols-outlined text-slate-500 text-base">
                    more_horiz
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    +{extraCount}
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* PENDING: Xem chi tiết → Phân loại → Tiếp nhận / Từ chối */}
        {requestStage === "pending" && (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => onDetail(request)}
              className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">info</span>
              Xem chi tiết yêu cầu
            </button>
            <button
              onClick={() => onClassify(request)}
              className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">tune</span>
              Phân loại yêu cầu
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onApprove(request.id)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">
                  check_circle
                </span>
                Tiếp nhận
              </button>
              <button
                onClick={() => onCancel(request)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">
                  cancel
                </span>
                Từ chối
              </button>
              <button
                onClick={() => onFlyTo(request)}
                className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-colors"
                title="Xem trên bản đồ"
              >
                <span className="material-symbols-outlined text-sm">map</span>
              </button>
            </div>
          </div>
        )}

        {/* IN_PROGRESS: Phân công nhiệm vụ + Đánh dấu hoàn thành */}
        {requestStage === "accepted" && (
          <div className="flex flex-col gap-2">
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
              <p className="text-xs font-semibold text-indigo-700 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">
                  fact_check
                </span>
                Đã tiếp nhận yêu cầu
              </p>
              <p className="text-[11px] text-indigo-600 mt-1">{acceptedHint}</p>
            </div>

            <button
              onClick={() => onAssign && onAssign(request)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">
                assignment_ind
              </span>
              {hasMission
                ? "Cập nhật phân công đội & phương tiện"
                : "Phân công đội & phương tiện"}
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onFlyTo(request)}
                className="w-full bg-slate-100 text-slate-600 rounded-lg py-2 hover:bg-blue-100 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                title="Xem trên bản đồ"
              >
                <span className="material-symbols-outlined text-sm">map</span>
                Xem trên bản đồ
              </button>
            </div>
          </div>
        )}

        {/* IN_PROGRESS: Theo dõi trạng thái team + xác nhận hoàn thành */}
        {requestStage === "inprogress" && (
          <div className="flex flex-col gap-2">
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-slate-700">
                  Trạng thái team
                </p>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${missionStatusUi.className}`}
                >
                  {missionStatusUi.label}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {missionStatusUi.note}
              </p>
              {teamDone && (
                <div className="mt-2 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-2 py-1.5">
                  {mission?.peopleRescued !== undefined &&
                    mission?.peopleRescued !== null && (
                      <p>Số người cứu được: {mission.peopleRescued}</p>
                    )}
                  {mission?.summary && (
                    <p className="mt-1">Ghi chú: {mission.summary}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onComplete && onComplete(request.id)}
                disabled={!teamDone}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
                  teamDone
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                    : "bg-slate-200 text-slate-500 cursor-not-allowed"
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  {teamDone ? "done_all" : "task_alt"}
                </span>
                {teamDone
                  ? "Team đã hoàn thành • Bấm hoàn thành"
                  : "Chờ team hoàn thành"}
              </button>
              <button
                onClick={() => onFlyTo(request)}
                className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-blue-100 hover:text-blue-600 transition-colors"
                title="Xem trên bản đồ"
              >
                <span className="material-symbols-outlined text-sm">
                  my_location
                </span>
              </button>
            </div>
          </div>
        )}

        {/* CANCELLED */}
        {requestStage === "cancelled" && (
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
        {requestStage === "completed" && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDetail(request)}
              className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-base">
                search
              </span>
              Xem lại chi tiết
            </button>
            <button
              onClick={() => onFlyTo(request)}
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
  );
};

export default RequestCard;
