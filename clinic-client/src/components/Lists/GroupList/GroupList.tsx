// src/components/Lists/GroupsList/GroupsList.tsx
import React, { useState, useEffect } from "react";
import { listGroups } from "../../../api/groupApi";
import { getPatients } from "../../../api/patientApi";
import type { Group, Patient } from "../../../types/sharedTypes";
import GroupCard from "../../Cards/GroupCard/GroupCard";

export interface GroupsListProps {
  companyId: string;
  clinicId: string;
  idToken: string;
  refreshKey?: number;
  /** Optional callback to lift group list into parent */
  setGroups?: React.Dispatch<React.SetStateAction<Group[]>>;
}

export const GroupsList: React.FC<GroupsListProps> = ({
  companyId,
  clinicId,
  idToken,
  refreshKey,
  setGroups: liftGroups,
}) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNotFull, setShowNotFull] = useState(false);

  useEffect(() => {
    if (!idToken || !companyId || !clinicId) {
      setGroups([]);
      setPatients([]);
      liftGroups?.([]);
      return;
    }

    listGroups(idToken, companyId, clinicId)
      .then((apiData) => {
        const sorted = [...apiData].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setGroups(sorted);
        liftGroups?.(sorted);
      })
      .catch((err) => console.error("Failed to fetch groups:", err));

    getPatients(idToken, companyId, clinicId)
      .then(setPatients)
      .catch(() => setPatients([]));
  }, [idToken, companyId, clinicId, refreshKey, liftGroups]);

  const visibleGroups = showNotFull
    ? groups.filter((g) => (g.patients?.length ?? 0) < (g.size ?? Infinity))
    : groups;

  return (
    <div className="space-y-4">
      <div className="px-4 flex items-center justify-end mb-2">
        <button
          className={`px-3 py-1 rounded-full font-medium text-sm shadow transition
        ${
          showNotFull
            ? "bg-brand-main text-white"
            : "bg-brand-gray-100 text-brand-main hover:bg-brand-gray-200"
        }`}
          onClick={() => setShowNotFull((v) => !v)}
        >
          {showNotFull ? "Tümü" : "Yalnızca Dolu Olmayanlar"}
        </button>
      </div>
      {visibleGroups.map((grp) => (
        <GroupCard
          key={grp._id}
          group={grp}
          patients={patients}
          isExpanded={expandedId === grp._id}
          onToggleExpand={setExpandedId}
        />
      ))}
    </div>
  );
};

export default GroupsList;
