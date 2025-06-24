import { useState } from "react";
import { FaPhone, FaCheck } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onSendCode: (phone: string) => void;
  onVerifyCode: (code: string) => void;
  step: "login" | "verify";
  loading: boolean;
}

export default function PhoneAuth({
  onSendCode,
  onVerifyCode,
  step,
  loading,
}: Props) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {step === "login" ? (
          <motion.div
            key="phone"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="flex gap-2"
          >
            <input
              type="tel"
              placeholder="+90 555 012 3456"
              className="flex-grow px-4 py-3 rounded-xl border border-gray-300 bg-white/80 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#e2725b] text-gray-800"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
              autoComplete="tel"
              inputMode="tel"
            />
            <button
              type="button"
              onClick={() => onSendCode(phone)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow transition-all ${
                loading
                  ? "bg-[#e2725b]/50 cursor-not-allowed"
                  : "bg-[#e2725b] hover:bg-[#c25944]"
              }`}
              aria-label="Send SMS code"
              disabled={loading || !phone}
            >
              <FaPhone />
            </button>
            {/* Recaptcha goes outside this div (portal) */}
          </motion.div>
        ) : (
          <motion.div
            key="verify"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="SMS Kodu"
              className="flex-grow px-4 py-3 rounded-xl border border-gray-300 bg-white/80 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-800"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={loading}
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={6}
            />
            <button
              type="button"
              onClick={() => onVerifyCode(code)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow transition-all ${
                loading
                  ? "bg-green-600/50 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
              aria-label="Verify code"
              disabled={loading || !code}
            >
              <FaCheck />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Recaptcha container portal */}
      <div id="recaptcha-container" />
    </div>
  );
}
