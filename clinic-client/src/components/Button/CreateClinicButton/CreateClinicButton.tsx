// src/components/Button/CreateClinicButton/CreateClinicButton.tsx
import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import CreateClinicForm from "../../UserOnboarding/CreateClinicForm";
import AppModal from "../../Modals/AppModal";

interface Props {
  readonly onCreated: (clinicId: string, clinicName: string) => void;
}

export default function CreateClinicButton({ onCreated }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="
          flex items-center justify-center gap-2 w-full
          px-4 py-2 bg-brand-main text-white rounded-xl font-semibold
          shadow hover:bg-brand-green transition text-base
        "
      >
        <PlusIcon className="h-6 w-6" />
        Yeni Klinik
      </button>
      <AppModal
        open={open}
        onClose={() => setOpen(false)}
        title="Klinik Oluştur"
      >
        <CreateClinicForm
          onCreated={(id, name) => {
            setOpen(false);
            onCreated(id, name);
          }}
          onClose={() => setOpen(false)}
        />
      </AppModal>
    </>
  );
}
