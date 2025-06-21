// src/components/Button/JoinCompanyButton/JoinCompanyButton.tsx
import React, { useState } from "react";
import { UserGroupIcon } from "@heroicons/react/24/outline";
import AppModal from "../../Modals/AppModal";
import JoinCompanyForm from "../../UserOnboarding/JoinCompanyForm";

const JoinCompanyButton: React.FC<{
  onJoined: (id: string, name: string) => void;
}> = ({ onJoined }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="
          w-full h-[170px] flex flex-col items-center justify-center
          rounded-2xl bg-white text-brand-main shadow-md font-semibold text-lg
          hover:scale-104 active:scale-98 transition-all
          border border-brand-main/15
        "
      >
        <UserGroupIcon className="w-12 h-12 mb-2 text-brand-main opacity-85" />
        <div className="text-xl font-bold mb-1">Şirkete Katıl</div>
        <div className="text-xs font-medium text-brand-main/60 text-center px-2">
          Katılmak için şirket kodunu kullan.
        </div>
      </button>
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
    </>
  );
};

export default JoinCompanyButton;
