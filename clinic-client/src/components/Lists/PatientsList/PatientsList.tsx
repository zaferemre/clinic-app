// src/components/Lists/PatientsList/PatientsList.tsx
import React, { useState, useEffect } from "react";
import PatientCard from "../../Cards/PatientCard/PatientCard";
import { getPatients } from "../../../api/patientApi";
import { listGroups } from "../../../api/groupApi";
import type { Patient, Group } from "../../../types/sharedTypes";

export interface PatientsListProps {
  companyId: string;
  clinicId: string;
  idToken: string;
  refreshKey?: number;
  /** Optional callback to lift patient list into parent */
  setPatients?: React.Dispatch<React.SetStateAction<Patient[]>>;
}

const filterButtons = [
  { key: 0, label: "Tümü" },
  { key: 1, label: "Ödenmedi" },
  { key: 2, label: "Az Kredi" },
  { key: 3, label: "Pasif" },
];

export const PatientsList: React.FC<PatientsListProps> = ({
  companyId,
  clinicId,
  idToken,
  refreshKey,
  setPatients: liftPatients,
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<0 | 1 | 2 | 3>(0);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    if (!idToken || !companyId || !clinicId) {
      setPatients([]);
      setGroups([]);
      liftPatients?.([]);
      return;
    }

    getPatients(idToken, companyId, clinicId)
      .then((apiData) => {
        const sorted = [...apiData].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setPatients(sorted);
        liftPatients?.(sorted);
      })
      .catch((err) => console.error("Failed to fetch patients:", err));

    listGroups(idToken, companyId, clinicId)
      .then(setGroups)
      .catch(() => setGroups([]));
  }, [idToken, companyId, clinicId, refreshKey, liftPatients]);

  const handleToggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const filteredPatients = patients
    .filter((p) =>
      p.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
    )
    .filter((p) => {
      const latest =
        p.paymentHistory.length > 0
          ? p.paymentHistory[p.paymentHistory.length - 1].method
          : "Unpaid";
      if (filterMode === 1) return latest === "Unpaid";
      if (filterMode === 2) return p.credit < 3;
      if (filterMode === 3) return p.status === "inactive";
      return true;
    });

  // Extracted handler to reduce nesting
  const handleDeletePatient = (patientId: string) => {
    setPatients((prev) => {
      const next = prev.filter((p) => p._id !== patientId);
      liftPatients?.(next);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="px-4 space-y-3">
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-max">
            {filterButtons.map((btn) => (
              <button
                key={btn.key}
                className={`px-5 py-1.5 rounded-full whitespace-nowrap text-sm font-medium shadow transition
                  ${
                    filterMode === btn.key
                      ? "bg-brand-main text-white"
                      : "bg-brand-gray-100 text-brand-main hover:bg-brand-gray-200"
                  }`}
                onClick={() => setFilterMode(btn.key as 0 | 1 | 2 | 3)}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
        <input
          type="text"
          placeholder="Hasta adı ara..."
          className="w-full border border-brand-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="px-4">
        {filteredPatients.map((pat) => (
          <PatientCard
            key={pat._id}
            patient={pat}
            isExpanded={expandedId === pat._id}
            onToggleExpand={handleToggleExpand}
            groups={groups}
            onDeletePatient={() => handleDeletePatient(pat._id)}
          />
        ))}
      </div>
    </div>
  );
};

export default PatientsList;
