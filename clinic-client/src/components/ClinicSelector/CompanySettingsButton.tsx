import React from "react";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";

interface Props {
  onClick: () => void;
}

const CompanySettingsButton: React.FC<Props> = ({ onClick }) => (
  <div className="fixed inset-x-0 bottom-0 pb-7 pt-3 flex justify-center bg-gradient-to-t from-white/95 via-white/70 to-transparent z-20">
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-8 py-3 rounded-full bg-brand-main text-white font-semibold text-lg shadow-lg hover:bg-brand-dark transition active:scale-95"
    >
      <Cog6ToothIcon className="w-6 h-6" />
      Şirket Ayarları
    </button>
  </div>
);

export default CompanySettingsButton;
