import React from "react";
import type { Group, Patient } from "../../types/sharedTypes";
import GroupPreviewCard from "../Cards/GroupPreviewCard";

interface GroupPreviewListProps {
  groups: Group[];
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  patientsMap?: Record<string, Patient>;
}

const GroupPreviewList: React.FC<GroupPreviewListProps> = ({
  groups,
  selectedIds = [],
  onToggleSelect,
  patientsMap = {},
}) => {
  if (!groups.length)
    return (
      <div className="text-center text-brand-gray-400 py-6">
        Grup bulunamadı.
      </div>
    );

  return (
    <div className="flex flex-col gap-2">
      {groups.map((g) => (
        <GroupPreviewCard
          key={g._id}
          group={g}
          selected={selectedIds.includes(g._id)}
          onSelect={onToggleSelect ? () => onToggleSelect(g._id) : undefined}
          memberNames={g.patients
            .map((pid) => patientsMap[pid]?.name || "")
            .filter(Boolean)}
        />
      ))}
    </div>
  );
};

export default GroupPreviewList;
