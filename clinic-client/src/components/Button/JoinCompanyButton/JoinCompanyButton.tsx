import React, { useState } from "react";
import JoinCompanyForm from "../../UserOnboarding/JoinCompanyForm";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import AppModal from "../../Modals/AppModal";

const JoinCompanyButton: React.FC<{
  onJoined: (id: string, name: string) => void;
}> = ({ onJoined }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="
          flex-1 flex items-center justify-center gap-2 px-6 py-4
          rounded-2xl bg-blue-500 text-white shadow-xl font-semibold
          text-lg transition duration-150
          hover:bg-blue-600 hover:scale-[1.03] active:scale-95
          focus:outline-none focus:ring-2 focus:ring-blue-300
        "
      >
        <UserPlusIcon className="w-6 h-6" /> Şirkete Katıl
      </button>
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
            <div className="flex items-center justify-between mt-2 mb-4">
              <span className="text-lg font-semibold">
                Şirket Kodu ile Katıl
              </span>
              <button
                className="text-2xl text-gray-400 hover:text-red-400 px-2"
                onClick={() => setOpen(false)}
                aria-label="Kapat"
              >
                ×
              </button>
            </div>
            <AppModal
              open={open}
              onClose={() => setOpen(false)}
              title="Şirkete Katıl"
            >
              <JoinCompanyForm
                onJoined={(id, name) => {
                  setOpen(false);
                  onJoined(id, name);
                }}
              />
            </AppModal>
          </div>
        </div>
      )}
    </>
  );
};

export default JoinCompanyButton;
