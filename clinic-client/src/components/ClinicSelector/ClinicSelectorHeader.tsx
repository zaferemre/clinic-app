// src/components/ClinicSelector/ClinicSelectorHeader.tsx
import React from "react";

interface Props {
  companyName?: string | null;
}

const ClinicSelectorHeader: React.FC<Props> = ({ companyName }) => (
  <div className="relative mt-10 z-10 flex flex-col items-center justify-center select-none">
    <span className="text-3xl md:text-4xl font-extrabold text-white drop-shadow tracking-wider">
      randevy
    </span>
    <div className="flex items-center">
      <div className="w-2 h-2 rounded-full bg-white mx-3 my-3 drop-shadow"></div>
    </div>
    {companyName && (
      <span className="text-3xl md:text-4xl font-extrabold text-white drop-shadow tracking-wider">
        {companyName}
      </span>
    )}
  </div>
);

export default ClinicSelectorHeader;
