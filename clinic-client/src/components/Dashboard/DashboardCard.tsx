// src/components/Dashboard/DashboardCard.tsx
import React from "react";

interface DashboardCardProps {
  icon: React.ReactNode;
  label: string;
  colorClass?: string;
  onClick?: () => void;
  countText?: string;
  showDot?: boolean;
  disabled?: boolean;
  soonText?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  icon,
  label,
  colorClass = "",
  onClick,
  countText,
  showDot,
  disabled,
  soonText,
}) => {
  if (disabled) {
    return (
      <div
        className={`
          flex flex-col items-center justify-center rounded-2xl bg-gray-100
          border border-gray-200 p-6 opacity-60 cursor-not-allowed relative min-h-[110px]
        `}
      >
        {icon}
        <div className="mt-2 text-base font-bold text-gray-400">{label}</div>
        {soonText && <div className=" text-xs text-gray-500  ">{soonText}</div>}
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center rounded-2xl bg-white border border-gray-200
        p-6 hover:shadow-md transition relative min-h-[110px] ${colorClass}
      `}
      type="button"
    >
      {icon}
      <div className="mt-2 text-base font-bold">{label}</div>
      {countText && (
        <div className="mt-1 text-xs text-gray-500">{countText}</div>
      )}
      {showDot && (
        <span className="absolute top-3 right-3 w-3 h-3 rounded-full bg-red-500" />
      )}
    </button>
  );
};

export default DashboardCard;
