// src/components/Button/BackButton.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

const BackButton: React.FC<{ className?: string }> = ({ className = "" }) => {
  const navigate = useNavigate();

  return (
    <>
      <button
        onClick={() => navigate(-1)}
        className={`
        flex items-center gap-1  p-2 rounded-full bg-white
        text-brand-main hover:bg-brand-main/10 active:bg-brand-main/20
        transition text-xs font-bold shadow-none border-none
        ${className}
      `}
        style={{ boxShadow: "none", border: "none" }}
        aria-label="Geri Dön"
      >
        <ArrowLeftIcon className="h-4 w-4" />
      </button>
      <button
        onClick={() => navigate(+1)}
        className={`
      flex items-center gap-1 ml-4 p-2 rounded-full bg-white
      text-brand-main hover:bg-brand-main/10 active:bg-brand-main/20
      transition text-xs font-bold shadow-none border-none
      ${className}
    `}
        style={{ boxShadow: "none", border: "none" }}
        aria-label="Geri Dön"
      >
        <ArrowRightIcon className="h-4 w-4" />
      </button>
    </>
  );
};

export default BackButton;
