// src/components/ClinicSelector/ClinicList.tsx
import React from "react";
import { Clinic } from "../../types/sharedTypes";
import ClinicPreviewCard from "../Cards/ClinicPreviewCard";
import CreateClinicButton from "../Button/CreateClinicButton/CreateClinicButton";

interface Props {
  clinics: Clinic[];
  onSelect: (cl: Clinic) => void;
  onCreate: (id: string) => void;
}

const ClinicList: React.FC<Props> = ({ clinics, onSelect, onCreate }) => (
  <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-5">
    {clinics.map((cl) => (
      <div
        key={cl._id}
        className="rounded-2xl shadow bg-white/90 hover:shadow-xl transition-shadow duration-200"
      >
        <ClinicPreviewCard clinic={cl} onSelect={() => onSelect(cl)} />
      </div>
    ))}
    <div className="rounded-2xl border-2 border-dashed border-brand-main/30 bg-white/60 hover:border-brand-main transition-all">
      <CreateClinicButton onCreated={onCreate} />
    </div>
  </div>
);

export default ClinicList;
