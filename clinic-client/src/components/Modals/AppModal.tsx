import React, { useEffect, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

const AppModal: React.FC<ModalProps> = ({ open, onClose, title, children }) => {
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click & Escape
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (open && ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      window.addEventListener("mousedown", handle);
      window.addEventListener("keydown", handleEscape);
    }
    return () => {
      window.removeEventListener("mousedown", handle);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40">
      <div
        ref={ref}
        className="w-full md:max-w-xl bg-white rounded-t-3xl md:rounded-2xl shadow-2xl p-6 pt-2 max-h-[96vh] overflow-y-auto relative animate-slide-up"
      >
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-red-400 bg-white/60 backdrop-blur p-2 rounded-xl shadow"
          onClick={onClose}
          aria-label="Kapat"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
        {title && (
          <div className="text-2xl mt-3 font-bold mb-6 text-center">
            {title}
          </div>
        )}
        {children}
      </div>
      <style>{`
          @keyframes slide-up {
            from { transform: translateY(100%);}
            to { transform: translateY(0);}
          }
          .animate-slide-up {
            animation: slide-up 0.25s cubic-bezier(.4,0,.2,1);
          }
        `}</style>
    </div>
  );
};
export default AppModal;
