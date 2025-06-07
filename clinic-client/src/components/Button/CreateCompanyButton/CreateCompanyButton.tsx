// src/components/Button/CreateCompanyButton/CreateCompanyButton.tsx
import React, { useState } from "react";
import CreateCompanyForm from "../../UserOnboarding/CreateCompanyForm";
import { IoAdd } from "react-icons/io5";

const CreateCompanyButton: React.FC<{
  onCreated: (id: string, name: string) => void;
}> = ({ onCreated }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="
          w-full md:w-auto flex items-center justify-center gap-2 px-5 py-3
          rounded-full bg-brand-green-400 text-white shadow-lg
          hover:bg-brand-green-500 active:scale-95 transition
          font-bold text-lg md:fixed md:bottom-6 md:right-6 md:z-30
        "
      >
        <IoAdd className="text-2xl" /> Şirket Oluştur
      </button>
      {/* Bottom Sheet Modal */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 flex justify-center items-end md:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full md:max-w-md bg-white rounded-t-3xl md:rounded-2xl shadow-lg p-6 pt-2
            animate-slide-up max-h-[96vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-lg font-semibold">Yeni Şirket Oluştur</span>
              <button
                className="text-2xl text-gray-400 hover:text-red-400 px-2"
                onClick={() => setOpen(false)}
                aria-label="Kapat"
              >
                ×
              </button>
            </div>
            <CreateCompanyForm
              onCreated={(id, name) => {
                setOpen(false);
                onCreated(id, name);
              }}
            />
          </div>
          <style>{`
            @keyframes slide-up {
              from { transform: translateY(100%);}
              to { transform: translateY(0);}
            }
            .animate-slide-up {
              animation: slide-up 0.3s cubic-bezier(.4,0,.2,1);
            }
          `}</style>
        </div>
      )}
    </>
  );
};

export default CreateCompanyButton;
