import React from "react";
import PatientPreviewCard from "../Cards/PatientPreviewCard";
import type { Patient } from "../../types/sharedTypes";

interface PatientPreviewListProps {
  patients: Patient[];
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
}

const PatientPreviewList: React.FC<PatientPreviewListProps> = ({
  patients,
  selectedIds = [],
  onToggleSelect,
}) => {
  if (!patients.length)
    return (
      <div className="text-center text-brand-gray-400 py-6">
        Hasta bulunamadı.
      </div>
    );

  return (
    <div className="flex flex-col gap-2">
      {patients.map((pat) => (
        <PatientPreviewCard
          key={pat._id}
          patient={pat}
          selected={selectedIds.includes(pat._id)}
          onSelect={onToggleSelect ? () => onToggleSelect(pat._id) : undefined}
        />
      ))}
    </div>
  );
};

export default PatientPreviewList;
