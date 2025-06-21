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
  <div className="flex justify-between items-center w-full px-4 py-2 rounded-xl bg-brand-main-50   shadow-sm ">
    {/* Yeni Randevu */}
    <button
      onClick={onAddAppointment}
      className="flex flex-col items-center group focus:outline-none flex-1 px-1 py-2 transition hover:bg-brand-main-100 active:bg-brand-main-200 rounded-lg"
    >
      <span className="flex items-center justify-center mb-1 group-active:scale-95 transition">
        <PlusIcon className="h-6 w-6 text-brand-main-500" />
      </span>
      <span className="text-xs font-semibold text-brand-main-600">
        Yeni Randevu
      </span>
    </button>

    {/* Divider */}
    <div className="w-px h-8 bg-brand-main-100 mx-2 self-center" />

    {/* Hasta Ekle */}
    <button
      onClick={onAddPatient}
      className="flex flex-col items-center group focus:outline-none flex-1 px-1 py-2 transition hover:bg-brand-main-100 active:bg-brand-main-200 rounded-lg"
    >
      <span className="flex items-center justify-center mb-1 group-active:scale-95 transition">
        <UserPlusIcon className="h-6 w-6 text-brand-main-500" />
      </span>
      <span className="text-xs font-semibold text-brand-main-600">
        Hasta Ekle
      </span>
    </button>

    {/* Divider */}
    <div className="w-px h-8 bg-brand-main-100 mx-2 self-center" />

    {/* Hizmet Ekle */}
    <button
      onClick={onAddService}
      className="flex flex-col items-center group focus:outline-none flex-1 px-1 py-2 transition hover:bg-brand-main-100 active:bg-brand-main-200 rounded-lg"
    >
      <span className="flex items-center justify-center mb-1 group-active:scale-95 transition">
        <ClipboardDocumentListIcon className="h-6 w-6 text-brand-main-500" />
      </span>
      <span className="text-xs font-semibold text-brand-main-600">
        Hizmet Ekle
      </span>
    </button>
  </div>
);
