// src/components/Button/CreateCompanyButton/CreateCompanyButton.tsx
import React, { useState } from "react";
import { BuildingOffice2Icon } from "@heroicons/react/24/outline";
import AppModal from "../../Modals/AppModal";
import CreateCompanyForm from "../../UserOnboarding/CreateCompanyForm";

const CreateCompanyButton: React.FC<{
  onCreated: (id: string, name: string) => void;
}> = ({ onCreated }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="
          w-full h-[170px] flex flex-col items-center justify-center
          rounded-2xl bg-gradient-to-br from-brand-main/95 to-brand-main/80
          text-white shadow-md font-semibold text-lg
          hover:scale-104 active:scale-98 transition-all
          border border-white/30
        "
      >
        <BuildingOffice2Icon className="w-12 h-12 mb-2 text-white opacity-90" />
        <div className="text-xl font-bold mb-1">Şirket Oluştur</div>
        <div className="text-xs font-medium text-white/70 text-center px-2">
          Klinikleri daha sonra ekleyeceksiniz.
        </div>
      </button>
      <AppModal
        open={open}
        onClose={() => setOpen(false)}
        title="Yeni Şirket Oluştur"
      >
        <CreateCompanyForm
          onCreated={(companyId: string) => {
            setOpen(false);
            onCreated(companyId, ""); // Passing empty string as name since the prop only receives companyId
          }}
          onCancel={() => setOpen(false)}
        />
      </AppModal>
    </>
  );
};

export default CreateCompanyButton;
