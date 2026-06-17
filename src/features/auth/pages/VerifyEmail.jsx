import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FiMail,
  FiCheckCircle,
  FiRefreshCw,
  FiArrowRight,
  FiClock,
  FiSend,
} from "react-icons/fi";
import {
  useAuth,
  useVerifyEmail,
  useResendVerification,
  useCancelSignup,
} from "../hooks/useAuth";
import { useConfirm } from "../../../contexts/ConfirmationContext";
import toast from "react-hot-toast";


const RESEND_COOLDOWN_SECONDS = 60;

// Circular SVG countdown ring
const CountdownRing = ({ seconds, total }) => {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const progress = seconds / total;
  const dashOffset = circumference * (1 - progress);

  const getColor = () => {
    if (progress > 0.6) return "#2563eb"; // blue
    if (progress > 0.3) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  return (
    <svg width="72" height="72">
      {/* Background track */}
      <circle
        cx="36"
        cy="36"
        r={radius}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth="4"
      />
      {/* Progress arc */}
      <circle
        cx="36"
        cy="36"
        r={radius}
        fill="none"
        stroke={getColor()}
        strokeWidth="4"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        style={{
          transform: "rotate(-90deg)",
          transformOrigin: "36px 36px",
          transition: "stroke-dashoffset 1s linear, stroke 0.5s ease"
        }}
      />
      {/* Center text */}
      <text
        x="36"
        y="36"
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontSize: "14px",
          fontWeight: "700",
          fill: getColor(),
        }}
      >
        {seconds}s
      </text>
    </svg>
  );
};

const VerifyEmail = () => {
  const { user } = useAuth();
  const verifyEmail = useVerifyEmail();
  const resendVerification = useResendVerification();
  const cancelSignup = useCancelSignup();
  const confirm = useConfirm();
  const [token, setToken] = useState("");
  // Start cooldown immediately since email was sent during signup
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [emailSentBanner, setEmailSentBanner] = useState(true);

  // Countdown ticker
  useEffect(() => {
    if (cooldown <= 0) return;

    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldown === 0]);

  // Auto-hide the "email sent" banner after 6 seconds
  useEffect(() => {
    const t = setTimeout(() => setEmailSentBanner(false), 6000);
    return () => clearTimeout(t);
  }, []);

  const handleCancelSignup = async () => {
    const isConfirmed = await confirm({
      title: "Cancel Registration?",
      message: "Are you sure you want to cancel your registration? This will clear your temporary signup info and email from the system.",
      confirmLabel: "Yes, Cancel",
      cancelLabel: "No, Keep",
      type: "danger"
    });

    if (isConfirmed) {
      cancelSignup.mutate();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!token || token.length < 6) {
      toast.error("Please enter a valid 6-digit verification code");
      return;
    }
    verifyEmail.mutate(token);
  };

  const handleResend = useCallback(() => {
    if (cooldown > 0) return;
    resendVerification.mutate(undefined, {
      onSuccess: () => {
        setCooldown(RESEND_COOLDOWN_SECONDS);
        setEmailSentBanner(true);
        // Re-show banner, then hide after 6s
        setTimeout(() => setEmailSentBanner(false), 6000);
      },
    });
  }, [cooldown, resendVerification]);

  const isResendReady = cooldown === 0 && !resendVerification.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto w-full">

        {/* ── Email Sent Banner ── */}
        <div
          className={`mb-4 overflow-hidden transition-all duration-500 ease-in-out ${
            emailSentBanner ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 shadow-sm">
            <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <FiSend size={14} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold">Verification email sent!</p>
              <p className="text-xs text-green-600 opacity-80">
                Check your inbox (and spam folder) at{" "}
                <span className="font-bold">{user?.email}</span>
              </p>
            </div>
            <button
              onClick={() => setEmailSentBanner(false)}
              className="ml-auto text-green-400 hover:text-green-600 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ── Main Card ── */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center p-10">

          {/* Icon */}
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-5 shadow-inner">
            <FiMail size={38} />
          </div>

          <h2 className="text-3xl font-extrabold text-gray-900 mb-2 text-center">
            Verify your email
          </h2>
          <p className="text-gray-500 mb-6 leading-relaxed text-center text-sm">
            We've sent a 6-digit verification code to
            <br />
            <span className="font-bold text-gray-800 text-base">{user?.email}</span>
          </p>

          {/* Code Input */}
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div>
              <label htmlFor="token" className="sr-only">
                Verification Code
              </label>
              <input
                id="token"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="• • • • • •"
                value={token}
                onChange={(e) =>
                  setToken(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                maxLength={6}
                className="appearance-none block w-full px-4 py-4 text-center text-3xl tracking-[0.6em] border-2 border-gray-200 rounded-xl placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
              />
              <p className="text-xs text-gray-400 mt-1.5 text-center">
                Numbers only · Code expires in 24 hours
              </p>
            </div>

            <button
              type="submit"
              disabled={verifyEmail.isPending || token.length < 6}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl shadow-lg shadow-blue-100 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifyEmail.isPending ? (
                <>
                  <FiRefreshCw className="animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify Code
                  <FiCheckCircle className="text-lg" />
                </>
              )}
            </button>
          </form>

          {/* ── Resend Section ── */}
          <div className="mt-8 pt-6 border-t border-gray-100 w-full flex flex-col items-center gap-4">
            <p className="text-sm text-gray-500">Didn't receive the code?</p>

            {cooldown > 0 ? (
              /* Countdown state */
              <div className="flex flex-col items-center gap-2">
                <CountdownRing seconds={cooldown} total={RESEND_COOLDOWN_SECONDS} />
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <FiClock size={12} />
                  <span>
                    Resend available in{" "}
                    <span className="font-bold text-gray-600">{cooldown}s</span>
                  </span>
                </div>
              </div>
            ) : resendVerification.isPending ? (
              /* Sending state */
              <div className="flex items-center gap-2 text-blue-500 text-sm font-medium">
                <FiRefreshCw className="animate-spin" />
                Sending new code...
              </div>
            ) : (
              /* Ready to resend state */
              <button
                type="button"
                onClick={handleResend}
                className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-semibold text-sm transition-all group"
              >
                <FiSend
                  size={14}
                  className="group-hover:-translate-y-0.5 transition-transform"
                />
                Resend verification code
                <FiArrowRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            )}
          </div>

          {/* Cancel Section */}
          <div className="mt-6 pt-4 border-t border-gray-100 w-full flex justify-center">
            <button
              type="button"
              onClick={handleCancelSignup}
              disabled={cancelSignup.isPending}
              className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 disabled:opacity-50 animate-pulse-subtle"
            >
              {cancelSignup.isPending ? (
                <>
                  <FiRefreshCw className="animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Registration & Return"
              )}
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-gray-400 text-xs italic">
          SCMS · Cooperative Society Management System
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
