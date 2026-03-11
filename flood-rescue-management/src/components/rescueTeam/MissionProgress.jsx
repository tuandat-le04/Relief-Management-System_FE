import React, { useEffect, useMemo, useState } from "react";
import missionService from "../../services/missionService";

const clampNumber = (value, min, max) => {
  const num = Number(value);
  if (Number.isNaN(num)) return min;
  return Math.min(max, Math.max(min, num));
};

const normalizeSelectableStatus = (status) => {
  if (!status) return "IN_PROGRESS";
  if (status === "PENDING" || status === "ASSIGNED") return "IN_PROGRESS";
  if (
    status === "IN_PROGRESS" ||
    status === "ARRIVED" ||
    status === "COMPLETED"
  ) {
    return status;
  }
  return "IN_PROGRESS";
};

const STATUS_TO_CONFIRMED_STEP = {
  PENDING: 0,
  ASSIGNED: 0,
  IN_PROGRESS: 1,
  ARRIVED: 2,
  COMPLETED: 3,
  CANCELLED: 0,
};

const getConfirmedStepFromStatus = (status) => {
  if (!status) return 0;
  return STATUS_TO_CONFIRMED_STEP[status] ?? 0;
};

export default function MissionProgress({
  missionId,
  initialStatus = "IN_PROGRESS",
  onStatusChange,
}) {
  // `committedStatus` tracks the latest status we believe backend currently has.
  // Keep it RAW so we can still confirm transitions like ASSIGNED -> IN_PROGRESS.
  const [committedStatus, setCommittedStatus] = useState(initialStatus);
  const [selectedStatus, setSelectedStatus] = useState(
    normalizeSelectableStatus(initialStatus),
  );
  const [peopleRescued, setPeopleRescued] = useState(0);
  const [summary, setSummary] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const confirmedStep = useMemo(
    () => getConfirmedStepFromStatus(committedStatus),
    [committedStatus],
  );

  const selectedStep = useMemo(
    () => getConfirmedStepFromStatus(selectedStatus),
    [selectedStatus],
  );

  useEffect(() => {
    const incomingSelectable = normalizeSelectableStatus(initialStatus);
    setCommittedStatus(initialStatus);
    setSelectedStatus(incomingSelectable);
    if (incomingSelectable !== "COMPLETED") {
      setPeopleRescued(0);
      setSummary("");
    }
    setError("");
  }, [initialStatus]);

  const steps = useMemo(
    () => [
      { id: 1, label: "Đang di chuyển", status: "IN_PROGRESS" },
      { id: 2, label: "Đã đến nơi", status: "ARRIVED" },
      { id: 3, label: "Hoàn thành", status: "COMPLETED" },
    ],
    [],
  );

  const isCompletedAlready = confirmedStep >= 3;
  const isCompletedForm = selectedStatus === "COMPLETED" && !isCompletedAlready;
  const canConfirm =
    !!missionId &&
    !submitting &&
    !isCompletedAlready &&
    !isCompletedForm &&
    selectedStep > confirmedStep;

  const handleConfirm = async () => {
    if (!canConfirm) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await missionService.updateMissionStatus(missionId, {
        status: selectedStatus,
      });
      if (!res.success) {
        throw new Error(res.error || "Cập nhật trạng thái thất bại");
      }
      setCommittedStatus(selectedStatus);
      onStatusChange?.(selectedStatus);
    } catch (err) {
      const message = err?.message || "Không thể cập nhật trạng thái nhiệm vụ";
      setError(message);
      window.alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitCompleted = async () => {
    if (!missionId) return;
    if (submitting) return;
    if (isCompletedAlready) return;

    setSubmitting(true);
    setError("");
    try {
      const people = clampNumber(peopleRescued, 0, 999);
      const res = await missionService.updateMissionStatus(missionId, {
        status: "COMPLETED",
        peopleRescued: people,
        summary,
      });
      if (!res.success) {
        throw new Error(res.error || "Cập nhật trạng thái thất bại");
      }
      setCommittedStatus("COMPLETED");
      setSelectedStatus("COMPLETED");
      onStatusChange?.("COMPLETED");
    } catch (err) {
      const message = err?.message || "Không thể gửi báo cáo";
      setError(message);
      window.alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1c1e22] border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {steps.map((s) => {
            const base =
              "flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-bold";
            const isSelected = s.status === selectedStatus;
            const isDisabled =
              submitting || isCompletedAlready || confirmedStep >= s.id;
            const cls = isSelected
              ? "bg-blue-600 text-white border-blue-400/50"
              : "bg-gray-50 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700";

            return (
              <button
                key={s.id}
                type="button"
                disabled={isDisabled}
                onClick={() => {
                  setSelectedStatus(s.status);
                  setError("");
                }}
                className={`${base} ${cls} transition-colors active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-black">
                  {s.id}
                </span>
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>

        {!isCompletedForm && !isCompletedAlready && (
          <button
            type="button"
            disabled={!canConfirm}
            onClick={handleConfirm}
            className={`h-11 px-5 rounded-xl text-sm font-black border-2 transition-all active:scale-[0.98] ${
              !canConfirm
                ? "bg-gray-200 text-gray-500 border-gray-200 cursor-not-allowed"
                : submitting
                  ? "bg-blue-600 text-white border-blue-400/50 opacity-70 cursor-wait"
                  : "bg-blue-600 hover:bg-blue-500 text-white border-blue-400/50"
            }`}
          >
            {submitting ? "ĐANG CẬP NHẬT..." : "Xác nhận"}
          </button>
        )}
      </div>

      {isCompletedForm && (
        <div className="mt-5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Số người đã cứu
              </label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-xl font-bold text-gray-600"
                  onClick={() =>
                    setPeopleRescued((v) => clampNumber(v - 1, 0, 999))
                  }
                  disabled={submitting}
                >
                  -
                </button>
                <input
                  className="w-20 h-12 text-center text-2xl font-bold bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-primary focus:ring-0"
                  type="number"
                  value={peopleRescued}
                  onChange={(e) =>
                    setPeopleRescued(clampNumber(e.target.value, 0, 999))
                  }
                  min={0}
                  disabled={submitting}
                />
                <button
                  type="button"
                  className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-xl font-bold text-gray-600"
                  onClick={() =>
                    setPeopleRescued((v) => clampNumber(v + 1, 0, 999))
                  }
                  disabled={submitting}
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Ghi chú nhanh (Description)
              </label>
              <textarea
                className="w-full h-28 p-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium focus:border-primary focus:ring-0 resize-none"
                placeholder="Nhập ghi chú..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>

          <button
            type="button"
            className="w-full bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-200 dark:text-black text-white h-14 rounded-xl text-lg font-black shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
            onClick={handleSubmitCompleted}
            disabled={!missionId || submitting}
          >
            <span className="material-symbols-outlined">send</span>
            {submitting ? "ĐANG GỬI..." : "GỬI BÁO CÁO & KẾT THÚC"}
          </button>
        </div>
      )}

      {error && <p className="mt-3 text-xs text-red-600 font-bold">{error}</p>}
    </div>
  );
}
