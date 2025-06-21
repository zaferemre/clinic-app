// src/components/Modals/AppModal.tsx
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
    function handleClickOutside(e: MouseEvent) {
      if (open && ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      window.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("keydown", handleEscape);
    }
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="
        fixed inset-0 z-50 flex items-end md:items-center justify-center
        bg-black/50 backdrop-filter backdrop-blur-md
      "
    >
      <div
        ref={ref}
        className="
          w-full px-6 pt-8 pb-6 md:px-8 md:pt-10 md:pb-8
          bg-white rounded-t-3xl md:rounded-2xl shadow-xl
          max-h-[90vh] overflow-y-auto relative
          animate-pop-in
        "
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Kapat"
          className="
            absolute top-4 right-4 p-2 rounded-full bg-white/70
            backdrop-filter backdrop-blur-sm shadow hover:scale-110
            transition-transform duration-200
          "
        >
          <XMarkIcon className="w-6 h-6 text-gray-600" />
        </button>

        {/* Title */}
        {title && (
          <div className="mb-4 text-center">
            <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
            <div className="mt-1 h-1 w-12 bg-brand-main mx-auto rounded-full" />
          </div>
        )}

        {/* Content */}
        <div className="space-y-4">{children}</div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes pop-in {
          0%   { transform: scale(0.9); opacity: 0; }
          60%  { transform: scale(1.02); opacity: 1; }
          100% { transform: scale(1); }
        }
        .animate-pop-in {
          animation: pop-in 0.25s cubic-bezier(.4,0,.2,1);
        }
      `}</style>
    </div>
  );
};

export default AppModal;
