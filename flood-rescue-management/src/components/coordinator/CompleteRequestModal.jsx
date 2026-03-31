import React from "react";

const formatDateTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const DetailRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
    <span className="material-symbols-outlined text-slate-400 text-base mt-0.5">
      {icon}
    </span>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <p className="text-sm text-slate-800 break-words whitespace-pre-wrap">
        {value || "—"}
      </p>
    </div>
  </div>
);

const CompleteRequestModal = ({
  isOpen,
  onClose,
  onConfirm,
  request,
  mission,
  loadingMission,
  confirming,
}) => {
  if (!isOpen) return null;

  const rescuedValue =
    mission?.peopleRescued ??
    mission?.rescuedCount ??
    mission?.rescueCount ??
    mission?.numberOfPeopleRescued;
  const peopleRescued =
    rescuedValue !== null && rescuedValue !== undefined
      ? String(rescuedValue)
      : "Chưa cập nhật";

  const teamSummary =
    mission?.summary ??
    mission?.reportSummary ??
    mission?.report ??
    mission?.description ??
    mission?.note ??
    mission?.missionNote ??
    "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-lg">
              Xác nhận hoàn thành
            </h2>
            <p className="text-emerald-100 text-sm">
              Xem báo cáo từ team trước khi hoàn tất yêu cầu
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={confirming}
            className="text-white/80 hover:text-white transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <p className="text-sm font-bold text-slate-800">
            Yêu cầu #{request?.id} · {request?.name || "Không rõ"}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {request?.location || "—"}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loadingMission ? (
            <div className="py-10 flex flex-col items-center justify-center gap-3 text-slate-500">
              <span className="animate-spin rounded-full h-7 w-7 border-b-2 border-emerald-600" />
              <p className="text-sm font-medium">
                Đang tải báo cáo của team...
              </p>
            </div>
          ) : (
            <>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4">
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                  Mission #{mission?.id || "—"} · Trạng thái:{" "}
                  {mission?.status || "—"}
                </p>
                <p className="text-[12px] text-emerald-700 mt-1">
                  Cập nhật lần cuối:{" "}
                  {formatDateTime(mission?.updatedAt || mission?.endTime)}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center gap-3">
          <button
            onClick={onClose}
            disabled={confirming}
            className="flex-1 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Đóng
          </button>
          <button
            onClick={onConfirm}
            disabled={confirming || loadingMission}
            className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {confirming ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                <span>Đang xác nhận...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">
                  done_all
                </span>
                <span>Xác nhận hoàn thành</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompleteRequestModal;
