import React from "react";
import { Clinic } from "../../types/sharedTypes";
import {
  BuildingOffice2Icon,
  MapPinIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

// Address formatter (put this at top or import it)
function formatAddress(address: any) {
  if (!address) return "";
  const { neighborhood, town, district, province, street, building, zip } =
    address;
  return [neighborhood, town, district, province, street, building, zip]
    .filter(Boolean)
    .join(", ");
}

interface ClinicPreviewCardProps {
  clinic: Clinic;
  onSelect: () => void;
}

const ClinicPreviewCard: React.FC<ClinicPreviewCardProps> = ({
  clinic,
  onSelect,
}) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="
        w-full relative group
        rounded-2xl border border-brand-main/30 bg-white
        hover:bg-brand-main/10 hover:shadow-xl transition
        flex flex-col items-stretch px-5 py-5 gap-2
        shadow-sm
        text-left
        focus:outline-none focus:ring-2 focus:ring-brand-main
      "
      style={{
        minHeight: "120px",
        boxShadow:
          "0 2px 8px 0 rgba(226, 114, 91, 0.08), 0 1.5px 5px 0 rgba(184, 108, 255, 0.06)",
      }}
    >
      <div className="flex items-center gap-3 mb-1">
        <span className="inline-flex items-center justify-center rounded-full bg-brand-main/20 p-2">
          <BuildingOffice2Icon className="w-7 h-7 text-brand-main" />
        </span>
        <span className="text-xl font-bold text-brand-black truncate group-hover:text-brand-main transition">
          {clinic.name}
        </span>
      </div>
      <div className="flex items-center gap-2 text-brand-black/80 text-sm mb-1">
        <MapPinIcon className="w-5 h-5 text-brand-main/70" />
        <span className="truncate">
          {formatAddress(clinic.address) || (
            <span className="text-gray-400">Adres eklenmemiş</span>
          )}
        </span>
      </div>
      {clinic.phoneNumber && (
        <div className="flex items-center gap-2 text-brand-black/70 text-sm">
          <PhoneIcon className="w-5 h-5 text-brand-main/70" />
          <span>{clinic.phoneNumber}</span>
        </div>
      )}
      {/* Add a subtle highlight border on hover */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none transition-all group-hover:ring-2 group-hover:ring-brand-main/50" />
    </button>
  );
};

export default ClinicPreviewCard;
