import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmationButtonProps {
  /** Function to call when confirming; should return a boolean Promise: true on success, false on failure */
  onConfirm: () => Promise<boolean>;
}

const ConfirmationButton: React.FC<ConfirmationButtonProps> = ({
  onConfirm,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleClick = async () => {
    if (isLoading || isConfirmed) return;

    setIsLoading(true);
    setIsError(false);
    try {
      const ok = await onConfirm();
      if (ok) {
        setIsConfirmed(true);
      } else {
        setIsError(true);
      }
    } catch (error) {
      console.error("Confirmation failed", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // auto-clear error after 2 seconds
  useEffect(() => {
    if (isError) {
      const t = setTimeout(() => setIsError(false), 2000);
      return () => clearTimeout(t);
    }
  }, [isError]);

  const variants = {
    idle: { backgroundColor: "#1f2937" }, // bg-gray-800
    confirmed: { backgroundColor: "#10b981" }, // bg-green-500
    error: { backgroundColor: "#ef4444" }, // bg-red-500
  };

  return (
    <motion.button
      onClick={handleClick}
      initial={false}
      animate={isError ? "error" : isConfirmed ? "confirmed" : "idle"}
      variants={variants}
      whileTap={{ scale: 0.95 }}
      className="px-4 py-2 text-white rounded focus:outline-none"
    >
      <AnimatePresence mode="wait">
        {isError ? (
          <motion.svg
            key="error"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </motion.svg>
        ) : isConfirmed ? (
          <motion.svg
            key="check"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </motion.svg>
        ) : (
          <motion.span
            key="label"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {isLoading ? "Processing..." : "Confirm"}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default ConfirmationButton;
