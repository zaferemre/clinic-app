import React, { useState } from "react";
import CreateCompanyForm from "../../UserOnboarding/CreateCompanyForm";
import { PlusIcon } from "@heroicons/react/24/outline";
import AppModal from "../../Modals/AppModal";

const CreateCompanyButton: React.FC<{
  onCreated: (id: string, name: string) => void;
}> = ({ onCreated }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="
          flex-1 flex items-center justify-center gap-2 px-6 py-4
          rounded-2xl bg-brand-green-400 text-white shadow-xl font-semibold
          text-lg transition duration-150
          hover:bg-brand-green-500 hover:scale-[1.03] active:scale-95
          focus:outline-none focus:ring-2 focus:ring-brand-green-200
        "
      >
        <PlusIcon className="w-6 h-6" /> Şirket Oluştur
      </button>
      <AppModal
        open={open}
        onClose={() => setOpen(false)}
        title="Yeni Şirket Oluştur"
      >
        <CreateCompanyForm
          onCreated={(id, name) => {
            setOpen(false);
            onCreated(id, name);
          }}
          onClose={() => setOpen(false)}
        />
      </AppModal>
    </>
  );
};

export default CreateCompanyButton;
