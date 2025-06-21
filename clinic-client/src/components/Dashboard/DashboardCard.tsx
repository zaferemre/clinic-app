import React from "react";

interface DashboardCardProps {
  icon: React.ReactNode;
  label: string;
  colorClass?: string;
  onClick: () => void;
  countText?: string;
  showDot?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  icon,
  label,
  colorClass = "",
  onClick,
  countText,
  showDot,
}) => (
  <button
    type="button"
    className={`relative flex flex-col items-center justify-center bg-white hover:shadow-md transition rounded-xl shadow p-6 cursor-pointer ${colorClass}`}
    onClick={onClick}
  >
    {showDot && (
      <span className="absolute top-3 right-3 h-3 w-3 bg-red-500 rounded-full" />
    )}
    {icon}
    <p className={`mt-3 text-lg font-medium ${colorClass}`}>{label}</p>
    {countText && (
      <span className={`mt-1 text-sm ${colorClass}`}>{countText}</span>
    )}
  </button>
);

export default DashboardCard;
