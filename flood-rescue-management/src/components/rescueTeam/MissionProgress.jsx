import React, { useEffect, useMemo, useState } from "react";
import missionService from "../../services/missionService";

const normalizeStatus = (value) => {
  if (value == null) return "";
  return String(value).trim().toUpperCase();
};

const statusToStep = (status) => {
  const s = normalizeStatus(status);
  if (s === "COMPLETED" || s === "DONE" || s === "FINISHED") return 3;
  if (s === "ARRIVED" || s === "AT_LOCATION") return 2;
  if (s === "IN_PROGRESS" || s === "PROCESSING" || s === "ONGOING") return 1;
  return 1;
};

const StepItem = ({ active, done, title }) => {
  const base =
    "flex-1 flex items-center justify-center gap-2 rounded-xl border-2 p-3 transition-all";

  const className = done
    ? `${base} bg-status-green text-white border-green-500`
    : active
      ? `${base} bg-primary text-white border-primary`
      : `${base} bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-200 border-gray-200 dark:border-gray-600`;

  return (
    <div className={className}>
      <span className="material-symbols-outlined text-xl">
        {done ? "check_circle" : active ? "radio_button_checked" : "radio_button_unchecked"}
      </span>
      <span className="text-sm font-bold">{title}</span>
    </div>
  );
};

/**
 * Props:
 * - missionId: number|string (required)
 * - status?: string (preferred - controlled)
 * - initialStatus?: string (fallback when status is not provided)
 * - onStatusChange?: (nextStatus: string) => void
 */
const MissionProgress = ({
  missionId,
  status: statusProp,
  initialStatus = "IN_PROGRESS",
  onStatusChange,
}) => {
  const [status, setStatus] = useState(
    normalizeStatus(statusProp ?? initialStatus) || "IN_PROGRESS",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (statusProp == null) return;
    const normalized = normalizeStatus(statusProp) || "IN_PROGRESS";
    setStatus(normalized);
  }, [statusProp]);

  const currentStep = useMemo(() => statusToStep(status), [status]);

  const buttonLabel = useMemo(() => {
    if (currentStep === 1) return "X├íc nhß║¡n ─É├ú ─æß║┐n n╞íi";
    if (currentStep === 2) return "X├íc nhß║¡n Ho├án th├ánh";
    return "";
  }, [currentStep]);

  const nextStatus = useMemo(() => {
    if (currentStep === 1) return "ARRIVED";
    if (currentStep === 2) return "COMPLETED";
    return "";
  }, [currentStep]);

  const handleUpdate = async () => {
    setError("");

    if (!missionId) {
      setError("Thiß║┐u missionId ─æß╗â cß║¡p nhß║¡t trß║íng th├íi.");
      return;
    }

    if (!nextStatus) return;

    setSubmitting(true);
    try {
      const res = await missionService.updateMissionStatus(missionId, nextStatus);
      if (!res.success) throw new Error(res.error || "Cß║¡p nhß║¡t trß║íng th├íi thß║Ñt bß║íi");

      setStatus(nextStatus);
      onStatusChange?.(nextStatus);
    } catch (e) {
      setError(e?.message || "Kh├┤ng thß╗â cß║¡p nhß║¡t trß║íng th├íi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#2d3139] border border-gray-200 dark:border-gray-600 rounded-2xl p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StepItem
          title="─Éang di chuyß╗ân"
          active={currentStep === 1}
          done={currentStep > 1}
        />
        <StepItem title="─É├ú ─æß║┐n n╞íi" active={currentStep === 2} done={currentStep > 2} />
        <StepItem title="Ho├án th├ánh" active={currentStep === 3} done={currentStep >= 3} />
      </div>

      {error ? <div className="mt-3 text-sm font-semibold text-red-600">{error}</div> : null}

      {currentStep < 3 ? (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleUpdate}
            disabled={submitting}
            className="px-4 py-2 rounded-xl bg-primary text-white font-bold hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "─Éang cß║¡p nhß║¡t..." : buttonLabel}
          </button>
        </div>
      ) : (
        <div className="mt-4 text-sm font-bold text-status-green">Nhiß╗çm vß╗Ñ ─æ├ú ho├án th├ánh.</div>
      )}
    </div>
  );
};

export default MissionProgress;
