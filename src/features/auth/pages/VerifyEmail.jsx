import React, { useState, useEffect, useCallback } from "react";
import {
  FiMail,
  FiCheckCircle,
  FiRefreshCw,
  FiArrowRight,
} from "react-icons/fi";
import {
  useAuth,
  useVerifyEmail,
  useResendVerification,
} from "../hooks/useAuth";
import toast from "react-hot-toast";

const RESEND_COOLDOWN_SECONDS = 60; // 60 seconds cooldown

const VerifyEmail = () => {
  const { user } = useAuth();
  const verifyEmail = useVerifyEmail();
  const resendVerification = useResendVerification();
  const [token, setToken] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // Cooldown timer effect
  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!token || token.length < 6) {
      toast.error("Please enter a valid 6-digit verification code");
      return;
    }
    verifyEmail.mutate(token);
  };

  const handleResend = useCallback(() => {
    if (cooldown > 0) {
      toast.error(`Please wait ${cooldown} seconds before resending`);
      return;
    }
    resendVerification.mutate(undefined, {
      onSuccess: () => {
        setCooldown(RESEND_COOLDOWN_SECONDS);
      },
    });
  }, [cooldown, resendVerification]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto w-full text-center">
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-6">
            <FiMail size={40} />
          </div>

          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Verify your email
          </h2>

          <p className="text-gray-500 mb-8 leading-relaxed">
            We've sent a 6-digit verification code to <br />
            <span className="font-bold text-gray-800">{user?.email}</span>
          </p>

          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div>
              <label htmlFor="token" className="sr-only">
                Verification Code
              </label>
              <input
                id="token"
                type="text"
                autoComplete="one-time-code"
                placeholder="Enter 6-digit code"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                maxLength={6}
                className="appearance-none block w-full px-4 py-4 text-center text-2xl tracking-[0.5em] border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={verifyEmail.isPending || !token}
              className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-200 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifyEmail.isPending ? (
                <FiRefreshCw className="animate-spin text-xl" />
              ) : (
                <>
                  Verify Code <FiCheckCircle className="ml-2 text-lg" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 w-full flex flex-col items-center">
            <p className="text-sm text-gray-500 mb-3">
              Didn't receive the code?
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendVerification.isPending || cooldown > 0}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {resendVerification.isPending ? (
                <>
                  <FiRefreshCw className="animate-spin mr-1" />
                  Sending...
                </>
              ) : cooldown > 0 ? (
                `Resend in ${cooldown}s`
              ) : (
                <>
                  Click to resend
                  <FiArrowRight className="ml-1" />
                </>
              )}
            </button>
            {cooldown > 0 && (
              <p className="text-xs text-gray-400 mt-2">
                You can request a new code in {cooldown} seconds
              </p>
            )}
          </div>
        </div>

        <p className="mt-8 text-gray-400 text-sm italic">
          Scms Cooperative Society Management System
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
