// src/components/SuccessCheck.tsx

import { useEffect } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  message?: string;
  subMessage?: string;
  onDone?: () => void;
};

export default function SuccessCheck({
  message = "Kayıt başarılı!",
  subMessage = "Klinik kaydınız alındı.",
  onDone,
}: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDone?.();
    }, 1700);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <AnimatePresence>
      <motion.div
        className="flex flex-col items-center justify-center min-h-[350px] py-10"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 340, damping: 22 }}
      >
        <motion.div
          className="mb-6"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1.12, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 350,
            damping: 15,
            duration: 0.5,
          }}
        >
          <CheckCircleIcon className="w-24 h-24 text-[#16b47f] drop-shadow-lg" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.44 }}
        >
          <div className="text-2xl font-bold text-[#16b47f] mb-2 text-center">
            {message}
          </div>
          <div className="text-base text-gray-500 text-center">
            {subMessage}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
