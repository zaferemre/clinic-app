// src/components/Button/ProfileCreateClinicButton/ProfileCreateClinicButton.tsx
import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import AppModal from "../Modals/AppModal";
import CreateClinicForm from "../UserOnboarding/CreateClinicForm";

interface Props {
  readonly onCreated: (clinicId: string, clinicName: string) => void;
}

export default function ProfileCreateClinicButton({ onCreated }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-brand-main text-white rounded-xl shadow hover:bg-brand-green transition text-sm flex items-center gap-2"
      >
        <PlusIcon className="h-5 w-5" /> Yeni Klinik
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
