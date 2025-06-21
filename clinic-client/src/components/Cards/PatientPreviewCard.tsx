import React from "react";
import { UserIcon } from "@heroicons/react/24/outline";
import type { Patient } from "../../types/sharedTypes";

interface PatientPreviewCardProps {
  patient: Patient;
  selected?: boolean;
  onSelect?: () => void;
}

const PatientPreviewCard: React.FC<PatientPreviewCardProps> = ({
  patient,
  selected,
  onSelect,
}) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl border transition shadow-sm hover:shadow-lg hover:bg-brand-main/10
        ${
          selected
            ? "bg-brand-main/10 border-brand-main"
            : "bg-white border-brand-gray-200"
        }`}
      style={{ minHeight: 56 }}
    >
      <div className="bg-brand-main/10 rounded-full p-2">
        <UserIcon className="h-6 w-6 text-brand-main" />
      </div>
      <div className="flex-1 text-left">
        <div className="text-base font-semibold text-brand-black truncate">
          {patient.name}
        </div>
        <div className="text-xs text-brand-gray-500">
          {patient.phone || "—"}
        </div>
      </div>
      <div className="flex flex-col items-end">
        {typeof patient.credit === "number" && (
          <span className="text-xs px-2 py-1 bg-brand-lime/30 rounded-xl font-semibold text-brand-green">
            Kredi: {patient.credit}
          </span>
        )}
      </div>
    </button>
  );
};

export default PatientPreviewCard;
