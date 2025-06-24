import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { motion } from "framer-motion";

interface Props {
  onSignup: (email: string, password: string) => void;
  loading: boolean;
}

export default function SignupForm({ onSignup, loading }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [acceptTOS, setAcceptTOS] = useState(false);

  return (
    <form
      className="w-full flex flex-col gap-4 mt-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!acceptTOS) return;
        onSignup(email, password);
      }}
      autoComplete="on"
    >
      <motion.input
        whileFocus={{ borderColor: "#e2725b" }}
        className="rounded-xl px-4 py-3 bg-white/80 placeholder-gray-500 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#e2725b] text-gray-800"
        type="email"
        placeholder="Email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />
      <div className="relative">
        <motion.input
          whileFocus={{ borderColor: "#e2725b" }}
          className="rounded-xl px-4 py-3 bg-white/80 placeholder-gray-500 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#e2725b] text-gray-800 w-full"
          type={showPass ? "text" : "password"}
          placeholder="Şifre"
          required
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          onClick={() => setShowPass((s) => !s)}
          tabIndex={-1}
        >
          {showPass ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
      <label className="flex items-center text-xs mt-1 gap-2">
        <input
          type="checkbox"
          checked={acceptTOS}
          onChange={() => setAcceptTOS((v) => !v)}
          className="accent-[#e2725b]"
          disabled={loading}
        />
        <span>
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Kullanım Koşulları
          </a>{" "}
          kabul ediyorum.
        </span>
      </label>
      <button
        type="submit"
        className={`
          w-full py-3 mt-1 rounded-full font-semibold text-white text-base transition-all shadow-md
          ${
            acceptTOS
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-400 cursor-not-allowed"
          }
        `}
        disabled={!acceptTOS || loading}
      >
        Kayıt Ol
      </button>
    </form>
  );
}
