import { motion } from "framer-motion";

export function AuthTabs({
  active,
  onChange,
}: {
  active: "login" | "signup";
  onChange: (mode: "login" | "signup") => void;
}) {
  return (
    <div className="flex w-full justify-center space-x-2 mb-6 select-none">
      {["login", "signup"].map((mode) => (
        <motion.button
          key={mode}
          onClick={() => onChange(mode as "login" | "signup")}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all
            ${
              active === mode
                ? "bg-white shadow text-[#e2725b]"
                : "bg-transparent text-white/80"
            }
          `}
          aria-current={active === mode}
          whileTap={{ scale: 0.95 }}
        >
          {mode === "login" ? "Giriş Yap" : "Kayıt Ol"}
        </motion.button>
      ))}
    </div>
  );
}
