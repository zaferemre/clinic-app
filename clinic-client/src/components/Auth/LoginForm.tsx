import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { motion } from "framer-motion";

interface Props {
  onLogin: (email: string, password: string) => void;
  loading: boolean;
}

export default function LoginForm({ onLogin, loading }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  return (
    <form
      className="w-full flex flex-col gap-4 mt-2"
      onSubmit={(e) => {
        e.preventDefault();
        onLogin(email, password);
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
          autoComplete="current-password"
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
      <button
        type="submit"
        className="w-full py-3 mt-1 bg-[#e2725b] hover:bg-[#ce593e] rounded-full font-semibold text-white text-base transition-all shadow-md"
        disabled={loading}
      >
        Giriş Yap
      </button>
    </form>
  );
}
