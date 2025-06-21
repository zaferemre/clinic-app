import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const BackButton: React.FC<{ className?: string }> = ({ className = "" }) => {
  const navigate = useNavigate();
  return (
    <div className={`flex flex-row items-center gap-2 ${className}`}>
      <button
        onClick={() => navigate(-1)}
        className={`
          flex items-center justify-center w-10 h-10 rounded-full bg-white
          text-brand-main hover:bg-brand-main-50 active:bg-brand-main-100
          transition shadow-md border border-brand-main-100
          focus:outline-none focus:ring-2 focus:ring-brand-main-200
        `}
        aria-label="Geri"
      >
        <ArrowLeftIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

export default BackButton;
