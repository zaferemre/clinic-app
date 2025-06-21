// src/components/Lists/GroupPreviewCard.tsx
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
  selected = false,
  onSelect,
  memberNames,
}) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex items-center w-full px-4 py-3 rounded-lg border transition shadow-sm hover:shadow-lg focus:outline-none
        ${
          selected
            ? "border-brand-main bg-brand-main-50"
            : "border-gray-200 bg-white hover:bg-gray-50"
        }`}
    >
      <div className="flex-shrink-0 p-2 bg-brand-main-50 rounded-full">
        <UserGroupIcon className="h-6 w-6 text-brand-main-500" />
      </div>

      <div className="flex-1 text-left ml-3">
        <div className="text-base font-medium text-gray-900 truncate">
          {group.name}
        </div>
        <div className="text-sm text-gray-500 truncate">
          {memberNames && memberNames.length > 0
            ? memberNames.join(", ")
            : `${group.patients.length} üye`}
        </div>
      </div>

      {typeof group.credit === "number" && (
        <span className="ml-3 text-xs font-semibold bg-brand-main-100 text-brand-main-600 px-2 py-1 rounded-full">
          Kredi {group.credit}
        </span>
      )}
    </button>
  );
};

export default GroupPreviewCard;
