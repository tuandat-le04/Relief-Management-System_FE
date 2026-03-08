import React, { useEffect, useMemo, useRef, useState } from "react";
import api from "../../services/api";

const STATUS_TO_STEP = {
  PENDING: 1,
  ASSIGNED: 1,
  IN_PROGRESS: 1,
  ARRIVED: 2,
  COMPLETED: 3,
  CANCELLED: 1,
};

const getStepFromStatus = (status) => {
  if (!status) return 1;
  return STATUS_TO_STEP[status] || 1;
};

export default function MissionProgress({
  missionId,
  initialStatus = "IN_PROGRESS",
  onStatusChange,
}) {
  const [status, setStatus] = useState(initialStatus);
  const [submitting, setSubmitting] = useState(false);
  const maxStepRef = useRef(getStepFromStatus(initialStatus));

  // Track the highest step we have shown to avoid regressions from polling.
  useEffect(() => {
    const step = getStepFromStatus(status);
    if (step > maxStepRef.current) maxStepRef.current = step;
  }, [status]);

  useEffect(() => {
    const incomingStatus = initialStatus || "IN_PROGRESS";
    const incomingStep = getStepFromStatus(incomingStatus);

    // Always accept COMPLETED.
    if (incomingStatus === "COMPLETED") {
      maxStepRef.current = 3;
      setStatus("COMPLETED");
      return;
    }

    // Do not regress UI if polling returns an older status.
    if (incomingStep < maxStepRef.current) return;

    maxStepRef.current = Math.max(maxStepRef.current, incomingStep);
    setStatus(incomingStatus);
  }, [initialStatus]);

  const currentStep = useMemo(() => getStepFromStatus(status), [status]);

  const nextAction = useMemo(() => {
    if (status === "PENDING" || status === "IN_PROGRESS" || status === "ASSIGNED") {
      return { nextStatus: "ARRIVED", label: "Xác nhận Đã đến nơi" };
    }
    if (status === "ARRIVED") {
      return { nextStatus: "COMPLETED", label: "Xác nhận Hoàn thành" };
    }
    return null;
  }, [status]);

  const isTerminalStatus = status === "COMPLETED" || status === "CANCELLED";

  const patchStatus = async (nextStatus) => {
    if (!missionId) throw new Error("Thiếu missionId");

    const endpoint = `/missions/${missionId}/status`;

    const formatError = (err) => {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (typeof err?.response?.data === "string" ? err.response.data : null) ||
        err?.message ||
        "Cập nhật trạng thái thất bại";
      const code = err?.response?.status ? `HTTP ${err.response.status}` : "";
      return ["Cập nhật trạng thái thất bại", code, msg].filter(Boolean).join(" - ");
    };

    // Swagger: PATCH /missions/{id}/status expects application/json:
    // { status, peopleRescued, reports, obstacles }
    const payload = {
      status: nextStatus,
      peopleRescued: 0,
      reports: "",
      obstacles: "",
    };

    try {
      const res = await api.patch(endpoint, payload);
      if (res?.data?.success === false) {
        throw new Error(res?.data?.message || "Cập nhật trạng thái thất bại");
      }
      return res?.data;
    } catch (err) {
      console.error("Mission status update failed", {
        missionId,
        nextStatus,
        endpoint,
        payload,
        response: err?.response?.data,
      });
      throw new Error(formatError(err));
    }
  };

  const handleClick = async () => {
    if (!nextAction) return;
    if (submitting) return;

    setSubmitting(true);
    try {
      // Some backends require an intermediate transition (ASSIGNED -> IN_PROGRESS -> ARRIVED)
      // while the UI only exposes ARRIVED/COMPLETED.
      if (nextAction.nextStatus === "ARRIVED" && status === "ASSIGNED") {
        await patchStatus("IN_PROGRESS");
      }

      await patchStatus(nextAction.nextStatus);
      setStatus(nextAction.nextStatus);
      onStatusChange?.(nextAction.nextStatus);
    } catch (err) {
      window.alert(err?.message || "Không thể cập nhật trạng thái nhiệm vụ");
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { id: 1, label: "Đang di chuyển" },
    { id: 2, label: "Đã đến nơi" },
    { id: 3, label: "Hoàn thành" },
  ];

  return (
    <div className="bg-white dark:bg-[#1c1e22] border border-gray-200 dark:border-gray-700 rounded-2xl p-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {steps.map((s) => {
            const isActive = s.id === currentStep;
            const isDone = s.id < currentStep;
            const base =
              "flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-bold";
            const cls = isActive
              ? "bg-blue-600 text-white border-blue-400/50"
              : isDone
                ? "bg-green-50 dark:bg-green-900/20 text-success-green border-green-200 dark:border-green-800"
                : "bg-gray-50 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700";

            return (
              <div key={s.id} className={`${base} ${cls}`}>
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-black">
                  {s.id}
                </span>
                <span>{s.label}</span>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          disabled={!missionId || !nextAction || submitting || isTerminalStatus}
          onClick={handleClick}
          className={`h-11 px-5 rounded-xl text-sm font-black border-2 transition-all active:scale-[0.98] ${
            !missionId || !nextAction || isTerminalStatus
              ? "bg-gray-200 text-gray-500 border-gray-200 cursor-not-allowed"
              : submitting
                ? "bg-blue-600 text-white border-blue-400/50 opacity-70 cursor-wait"
                : "bg-blue-600 hover:bg-blue-500 text-white border-blue-400/50"
          }`}
        >
          {submitting
            ? "ĐANG CẬP NHẬT..."
            : nextAction
              ? nextAction.label
              : "Đã hoàn thành"}
        </button>
      </div>

      {(status === "IN_PROGRESS" || status === "PENDING" || status === "ASSIGNED") && (
        <p className="mt-3 text-xs text-gray-500 font-medium">
          Trạng thái hiện tại: {status}
        </p>
      )}
    </div>
  );
}
