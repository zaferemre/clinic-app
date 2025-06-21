import React from "react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { AiFillBank } from "react-icons/ai";

const CompanySettingsHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-2 mb-5">
      <button
        className="flex items-center gap-1 text-brand-main font-medium hover:underline"
        onClick={() => navigate(-1)}
      >
        <ArrowLeftIcon className="w-5 h-5" />
        Geri
      </button>
      <h2 className="text-2xl font-bold text-brand-main flex items-center gap-2 ml-4">
        <AiFillBank className="text-brand-main text-2xl" />
        Şirket Ayarları
      </h2>
    </div>
  );
};

export default CompanySettingsHeader;
