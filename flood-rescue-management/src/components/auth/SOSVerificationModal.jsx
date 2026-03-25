import React, { useEffect, useMemo, useRef, useState } from "react";

const DIGITS_ONLY_REGEX = /\D+/g;

const normalizeDigits = (value) => (value || "").replace(DIGITS_ONLY_REGEX, "");

const isValidVietnamPhoneLength = (digits) => digits.length >= 9 && digits.length <= 11;

const SOSVerificationModal = ({ onConfirm }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const phoneInputRef = useRef(null);
  const otpInputRef = useRef(null);

  const phoneDigits = useMemo(() => normalizeDigits(phone), [phone]);

  useEffect(() => {
    if (!isOpen) return;

    // Ensure autofocus works reliably after modal opens / step switches.
    const focusTarget = step === 1 ? phoneInputRef.current : otpInputRef.current;
    if (!focusTarget) return;

    const id = window.setTimeout(() => {
      focusTarget.focus();
      if (typeof focusTarget.select === "function") focusTarget.select();
    }, 0);

    return () => window.clearTimeout(id);
  }, [isOpen, step]);

  const open = () => {
    setIsOpen(true);
    setStep(1);
    setPhone("");
    setOtp("");
    setError("");
  };

  const close = () => {
    setIsOpen(false);
    setError("");
  };

  const goToOtpStep = () => {
    const digits = phoneDigits;
    if (!isValidVietnamPhoneLength(digits)) {
      setError("Số điện thoại không hợp lệ. Vui lòng kiểm tra lại.");
      return;
    }

    setError("");
    setStep(2);
  };

  const confirmAndSend = async () => {
    const otpDigits = normalizeDigits(otp);
    if (otpDigits.length !== 6) {
      setError("OTP phải gồm 6 chữ số.");
      return;
    }

    setError("");

    if (typeof onConfirm === "function") {
      await onConfirm({ phone: phoneDigits, otp: otpDigits });
    }

    close();
  };

  return (
    <>
      {/* Trigger SOS button */}
      <button
        type="button"
        onClick={open}
        className="fixed bottom-6 right-6 z-[70] isolate"
        aria-label="Mở yêu cầu cứu trợ khẩn cấp"
      >
        <span className="absolute inset-0 -z-10 flex items-center justify-center">
          <span className="absolute size-24 rounded-full bg-sos-red/25 animate-radar" />
          <span className="absolute size-16 rounded-full bg-sos-red/20 animate-radar [animation-delay:0.6s]" />
        </span>
        <span className="flex items-center justify-center size-16 rounded-2xl bg-sos-red text-white shadow-xl shadow-black/20 border border-white/20">
          <span className="text-base font-black tracking-wider">SOS</span>
        </span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sos-modal-title"
        >
          <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-surface-dark border border-red-200/70 dark:border-red-900/40">
            {/* Header */}
            <div className="bg-sos-red text-white px-5 py-4 flex items-center justify-between">
              <h2 id="sos-modal-title" className="text-base md:text-lg font-extrabold">
                Yêu cầu cứu trợ khẩn cấp
              </h2>
              <button
                type="button"
                onClick={close}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Đóng"
              >
                <span className="material-symbols-outlined text-xl leading-none">close</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-5">
              {step === 1 ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Vui lòng cung cấp số điện thoại chính xác để đội điều phối liên lạc.
                  </p>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                      Số điện thoại
                    </label>
                    <input
                      ref={phoneInputRef}
                      autoFocus
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder="Ví dụ: 09xxxxxxxx"
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sos-red/20 focus:border-sos-red transition"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-sos-red font-semibold">{error}</p>
                  )}

                  <button
                    type="button"
                    onClick={goToOtpStep}
                    className="w-full rounded-xl bg-sos-red text-white font-extrabold py-3.5 shadow-lg shadow-sos-red/20 active:scale-[0.99] transition"
                  >
                    Nhận mã xác thực (OTP)
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-700 dark:text-gray-200">
                    Mã OTP đã được gửi đến số <span className="font-extrabold">{phoneDigits}</span>.
                  </p>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                      OTP (6 số)
                    </label>
                    <input
                      ref={otpInputRef}
                      autoFocus
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => {
                        const next = normalizeDigits(e.target.value).slice(0, 6);
                        setOtp(next);
                        if (error) setError("");
                      }}
                      placeholder="••••••"
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-4 text-2xl font-extrabold tracking-widest text-center text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sos-red/20 focus:border-sos-red transition"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-sos-red font-semibold">{error}</p>
                  )}

                  <button
                    type="button"
                    onClick={confirmAndSend}
                    className="w-full rounded-xl bg-sos-red text-white font-extrabold py-3.5 shadow-lg shadow-sos-red/20 active:scale-[0.99] transition"
                  >
                    Xác nhận &amp; Gửi yêu cầu
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setOtp("");
                      setError("");
                    }}
                    className="w-full text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-sos-red transition-colors"
                  >
                    Đổi số điện thoại khác
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SOSVerificationModal;
