// src/components/HomeSearchBar/HomePatientSearchBar.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  UserIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import type { Patient, Group } from "../../types/sharedTypes";
import PatientCard from "../Cards/PatientCard/PatientCard";
import GroupCard from "../Cards/GroupCard/GroupCard";

// Normalize string for Turkish-friendly search
type NullableString = string | undefined | null;
function normalizeTR(str: NullableString = ""): string {
  const safeStr = str ?? "";
  return safeStr
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ü/g, "u")
    .replace(/ğ/g, "g")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ö/g, "o");
}

interface HomePatientSearchBarProps {
  patients: Patient[];
  groups?: Group[];
}

const HomePatientSearchBar: React.FC<HomePatientSearchBarProps> = ({
  patients,
  groups = [],
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setSelectedPatient(null);
        setSelectedGroup(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const normalizedQuery = normalizeTR(query.trim());
  const digitsOnly = query.replace(/\D/g, "");

  const filteredPatients = query
    ? patients.filter((p) => {
        const nameNorm = normalizeTR(p.name);
        const phoneNorm = (p.phone || "").replace(/\D/g, "");
        return (
          (normalizedQuery && nameNorm.includes(normalizedQuery)) ||
          (digitsOnly && phoneNorm.includes(digitsOnly))
        );
      })
    : [];

  const filteredGroups = query
    ? groups.filter((g) => {
        const nameNorm = normalizeTR(g.name);
        return normalizedQuery && nameNorm.includes(normalizedQuery);
      })
    : [];

  return (
    <>
      {/* Search trigger */}
      <button
        className="p-2 rounded-full bg-brand-main-100 hover:bg-brand-main-200 shadow transition"
        onClick={() => setOpen(true)}
        aria-label="Ara"
      >
        <MagnifyingGlassIcon className="w-6 h-6 text-brand-main-500" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative bg-white p-1 rounded-3xl shadow-xl  max-w-lg mx-auto animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input */}
            <div className="flex items-center border rounded-full px-3 py-2 shadow-sm ">
              <MagnifyingGlassIcon className="w-5 h-5 text-brand-main-300 mr-2" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-base"
                placeholder="Hasta veya grup adı ile ara..."
              />
              {query && (
                <button
                  className="ml-1 p-1 rounded-full hover:bg-brand-main-100"
                  onClick={() => setQuery("")}
                  aria-label="Temizle"
                >
                  <XMarkIcon className="w-5 h-5 text-brand-main-400" />
                </button>
              )}
            </div>

            {/* Results: no "Sonuç bulunamadı" state */}
            <div className="max-h-60 overflow-y-auto">
              <ul>
                {filteredPatients.slice(0, 10).map((p) => (
                  <li key={p._id}>
                    <button
                      className="w-full text-left px-3 py-2 rounded hover:bg-brand-main-50 flex items-center gap-2"
                      onClick={() => {
                        setSelectedPatient(p);
                        setOpen(false);
                      }}
                    >
                      <UserIcon className="h-5 w-5 text-brand-main flex-shrink-0" />
                      <span className="flex-1 text-base text-black truncate">
                        {p.name}
                      </span>
                      {p.phone && (
                        <span className="text-gray-500 text-sm">
                          ({p.phone})
                        </span>
                      )}
                    </button>
                  </li>
                ))}
                {filteredGroups.slice(0, 10).map((g) => (
                  <li key={g._id}>
                    <button
                      className="w-full text-left px-3 py-2 rounded hover:bg-brand-main-50 flex items-center gap-2"
                      onClick={() => {
                        setSelectedGroup(g);
                        setOpen(false);
                      }}
                    >
                      <UserGroupIcon className="h-5 w-5 text-brand-main-600 flex-shrink-0" />
                      <span className="flex-1 text-base text-black truncate">
                        {g.name}
                      </span>
                      <span className="text-gray-500 text-sm">
                        ({g.patients?.length}/{g.maxSize})
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedPatient(null)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <PatientCard
              patient={selectedPatient}
              groups={groups}
              isExpanded
              onToggleExpand={() => setSelectedPatient(null)}
              onDeletePatient={() => setSelectedPatient(null)}
            />
          </div>
        </div>
      )}

      {/* Group Detail Modal */}
      {selectedGroup && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedGroup(null)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <GroupCard
              group={selectedGroup}
              patients={patients}
              isExpanded
              onToggleExpand={() => setSelectedGroup(null)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default HomePatientSearchBar;
