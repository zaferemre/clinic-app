import React from "react";
import { UserGroupIcon } from "@heroicons/react/24/outline";
import type { Group } from "../../types/sharedTypes";

interface GroupPreviewCardProps {
  group: Group;
  selected?: boolean;
  onSelect?: () => void;
  memberNames?: string[];
}

const GroupPreviewCard: React.FC<GroupPreviewCardProps> = ({
  group,
  selected,
  onSelect,
  memberNames,
}) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl border transition shadow-sm hover:shadow-lg hover:bg-brand-purple/10
        ${
          selected
            ? "bg-brand-purple/10 border-brand-purple"
            : "bg-white border-brand-gray-200"
        }`}
      style={{ minHeight: 56 }}
    >
      <div className="bg-brand-purple/20 rounded-full p-2">
        <UserGroupIcon className="h-6 w-6 text-brand-purple" />
      </div>
      <div className="flex-1 text-left">
        <div className="text-base font-semibold text-brand-black truncate">
          {group.name}
        </div>
        <div className="text-xs text-brand-gray-500">
          {memberNames?.length
            ? memberNames.join(", ")
            : `${group.patients.length} üye`}
        </div>
      </div>
      <div className="flex flex-col items-end">
        {typeof group.credit === "number" && (
          <span className="text-xs px-2 py-1 bg-brand-lime/30 rounded-xl font-semibold text-brand-green">
            Kredi: {group.credit}
          </span>
        )}
      </div>
    </button>
  );
};

export default GroupPreviewCard;
