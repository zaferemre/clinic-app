// src/components/Lists/PatientPreviewCard.tsx
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
  selected = false,
  onSelect,
}) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex items-center w-full px-4 py-3 rounded-lg border transition shadow-sm hover:shadow-lg focus:outline-none
        ${
          selected
            ? "border-brand-main bg-brand-main-50"
            : "border-gray-200 bg-white hover:bg-gray-50"
        }`}
    >
      <div className="flex-shrink-0 p-2 bg-brand-main-50 rounded-full">
        <UserIcon className="h-6 w-6 text-brand-main-500" />
      </div>

      <div className="flex-1 text-left ml-3">
        <div className="text-base font-medium text-gray-900 truncate">
          {patient.name}
        </div>
        <div className="text-sm text-gray-500 truncate">
          {patient.phone ?? "—"}
        </div>
      </div>

      {typeof patient.credit === "number" && (
        <span className="ml-3 text-xs font-semibold bg-opacity-20 text-success px-2 py-1 rounded-full">
          Seans Kredisi {patient.credit}
        </span>
      )}
    </button>
  );
};

export default PatientPreviewCard;
