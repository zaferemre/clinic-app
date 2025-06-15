import React from "react";
import {
  PlusIcon,
  UserPlusIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

interface QuickActionsRowProps {
  onAddAppointment: () => void;
  onAddPatient: () => void;
  onAddService: () => void;
}

export const QuickActionsRow: React.FC<QuickActionsRowProps> = ({
  onAddAppointment,
  onAddPatient,
  onAddService,
}) => (
  <div className="flex justify-between w-full py-3 rounded-2xl bg-brand-main my-3 px-4 shadow">
    {/* Yeni Randevu */}
    <button
      onClick={onAddAppointment}
      className="flex flex-col items-center group focus:outline-none flex-1"
    >
      <span className="flex items-center justify-center mb-1 group-active:scale-95 transition">
        <PlusIcon className="h-6 w-6 text-white" />
      </span>
      <span className="text-xs font-semibold text-white">Yeni Randevu</span>
    </button>

    {/* Divider */}
    <div className="w-px h-8 bg-white/40 mx-2 self-center" />

    {/* Hasta Ekle */}
    <button
      onClick={onAddPatient}
      className="flex flex-col items-center group focus:outline-none flex-1"
    >
      <span className="flex items-center justify-center mb-1 group-active:scale-95 transition">
        <UserPlusIcon className="h-6 w-6 text-white" />
      </span>
      <span className="text-xs font-semibold text-white">Hasta Ekle</span>
    </button>

    {/* Divider */}
    <div className="w-px h-8 bg-white/40 mx-2 self-center" />

    {/* Hizmet Ekle */}
    <button
      onClick={onAddService}
      className="flex flex-col items-center group focus:outline-none flex-1"
    >
      <span className="flex items-center justify-center mb-1 group-active:scale-95 transition">
        <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
      </span>
      <span className="text-xs font-semibold text-white">Hizmet Ekle</span>
    </button>
  </div>
);
