// src/components/Modals/AppModal.tsx
import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

export type SubmissionContextType = {
  submit: (fn: () => Promise<boolean>) => Promise<void>;
};
const SubmissionContext = React.createContext<SubmissionContextType | null>(
  null
);

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  onSuccess?: () => void;
};

export const ModalForm: React.FC<{
  onSubmit: () => Promise<boolean>;
  children: React.ReactNode;
}> = ({ onSubmit, children }) => {
  const ctx = React.useContext(SubmissionContext);
  if (!ctx) throw new Error("ModalForm must be used inside AppModal");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await ctx.submit(onSubmit);
  };
  return <form onSubmit={handleSubmit}>{children}</form>;
};

const AppModal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  onSuccess,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

  // handle outside click & escape with CSS pop-out
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && ref.current) {
        ref.current.classList.add("animate-pop-out");
        setTimeout(onClose, 200);
      }
    };
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        ref.current.classList.add("animate-pop-out");
        setTimeout(onClose, 200);
      }
    };
    window.addEventListener("keydown", handleEsc);
    window.addEventListener("mousedown", handleClick);
    return () => {
      window.removeEventListener("keydown", handleEsc);
      window.removeEventListener("mousedown", handleClick);
    };
  }, [open, onClose]);

  // submission via Framer Motion overlay
  const submit = useCallback(
    async (fn: () => Promise<boolean>) => {
      setStatus("submitting");
      try {
        const ok = await fn();
        if (ok) {
          setStatus("success");
          setTimeout(() => {
            setStatus("idle");
            onClose();
            onSuccess?.();
          }, 800);
        } else {
          setStatus("error");
          setTimeout(() => setStatus("idle"), 800);
        }
      } catch {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 800);
      }
    },
    [onClose, onSuccess]
  );

  const contextValue = useMemo(() => ({ submit }), [submit]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-filter backdrop-blur-md">
      <div
        ref={ref}
        className="w-full px-6 pt-8 pb-6 md:px-8 md:pt-10 md:pb-8 bg-white rounded-t-3xl md:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto relative animate-pop-in"
      >
        <button
          onClick={() => {
            ref.current?.classList.add("animate-pop-out");
            setTimeout(onClose, 200);
          }}
          aria-label="Kapat"
          className="absolute top-4 right-4 p-2 rounded-full bg-white/70 backdrop-filter backdrop-blur-sm shadow hover:scale-110 transition-transform duration-200"
        >
          <XMarkIcon className="w-6 h-6 text-gray-600" />
        </button>
        {title && (
          <div className="mb-4 text-center">
            <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
            <div className="mt-1 h-1 w-12 bg-brand-main mx-auto rounded-full" />
          </div>
        )}
        <SubmissionContext.Provider value={contextValue}>
          <div className="space-y-4">{children}</div>
          <AnimatePresence>
            {(status === "submitting" ||
              status === "success" ||
              status === "error") && (
              <motion.div
                className={
                  "absolute inset-0 flex items-center justify-center backdrop-blur-sm " +
                  (status === "error" ? "bg-red-100/70" : "bg-white/70")
                }
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  key={status}
                  initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  exit={{ scale: 0.5, rotate: 10, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 25,
                    mass: 0.5,
                  }}
                >
                  {status === "submitting" ? (
                    <motion.div
                      className="w-12 h-12 rounded-full border-4 border-brand-main"
                      style={{ borderTopColor: "transparent" }}
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 1.2,
                      }}
                    />
                  ) : status === "success" ? (
                    <CheckIcon className="w-16 h-16 text-green-500" />
                  ) : (
                    <XMarkIcon className="w-16 h-16 text-red-500" />
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </SubmissionContext.Provider>
      </div>
      <style>{`
        @keyframes pop-in {0%{transform:scale(0.9);opacity:0;}60%{transform:scale(1.02);opacity:1;}100%{transform:scale(1);opacity:1;}}
        @keyframes pop-out {0%{transform:scale(1);opacity:1;}100%{transform:scale(0.9);opacity:0;}}
        .animate-pop-in {animation:pop-in 0.25s cubic-bezier(.4,0,.2,1);}
        .animate-pop-out {animation:pop-out 0.2s ease-in forwards;}
      `}</style>
    </div>
  );
};

export default AppModal;
