// src/components/Dashboard/DashboardCard.tsx
import React from "react";

interface DashboardCardProps {
  icon: React.ReactNode;
  label: string;
  accent?: string; // e.g. "border-blue-500"
  onClick: () => void;
  countText?: string;
  showDot?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  icon,
  label,
  accent = "border-transparent",
  onClick,
  countText,
  showDot,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      relative flex flex-col items-center justify-center
      w-full aspect-square
      bg-white rounded-2xl shadow-sm border-l-4 ${accent}
      hover:shadow-md transition-shadow transform hover:-translate-y-0.5
    `}
  >
    {showDot && (
      <span className="absolute top-3 right-3 h-3 w-3 bg-red-500 rounded-full" />
    )}
    <div className="flex items-center justify-center h-12 w-12 rounded-full  mb-2">
      {icon}
    </div>
    <p className="mt-1 text-base font-medium text-gray-800">{label}</p>
    {countText && (
      <span className="mt-1 text-sm text-gray-500">{countText}</span>
    )}
  </button>
);

export default DashboardCard;
