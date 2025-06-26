// src/components/HomeSearchBar/HomePatientSearchBar.tsx
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

const modalBgVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const modalVariants = {
  initial: { scale: 0.95, opacity: 0, y: 32 },
  animate: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 260, damping: 22 },
  },
  exit: { scale: 0.95, opacity: 0, y: 32, transition: { duration: 0.15 } },
};

const inputVariants = {
  initial: { opacity: 0, y: -12 },
  animate: { opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.18 } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.1 } },
};

const listVariants = {
  animate: { transition: { staggerChildren: 0.03, delayChildren: 0.1 } },
  exit: {},
};

const itemVariants = {
  initial: { opacity: 0, x: 16 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { type: "spring" as const, stiffness: 250, damping: 22 },
  },
  exit: { opacity: 0, x: -16, transition: { duration: 0.14 } },
};

const detailVariants = {
  initial: { scale: 0.97, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 200, damping: 23 },
  },
  exit: { scale: 0.97, opacity: 0, transition: { duration: 0.16 } },
};

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
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
    else setQuery("");
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
      <motion.button
        className="p-2 rounded-full bg-brand-main-100 hover:bg-brand-main-200  transition"
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen(true)}
        aria-label="Ara"
      >
        <MagnifyingGlassIcon className="w-6 h-6 text-brand-main-500" />
      </motion.button>

      {/* Modal Overlay and Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm p-4"
            variants={modalBgVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="relative bg-white p-1 rounded-3xl shadow-xl max-w-lg mx-auto"
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              layoutId="searchModal"
            >
              {/* Input */}
              <motion.div
                className="flex items-center border rounded-full px-3 py-2 shadow-sm"
                variants={inputVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
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
              </motion.div>

              {/* Result List with Animation */}
              <motion.div
                className="max-h-60 overflow-y-auto mt-2"
                initial={{ opacity: 0, y: 16 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: 0.05, duration: 0.23 },
                }}
                exit={{ opacity: 0, y: 16, transition: { duration: 0.12 } }}
              >
                <motion.ul
                  variants={listVariants}
                  initial="exit"
                  animate="animate"
                  exit="exit"
                >
                  <AnimatePresence>
                    {filteredPatients.slice(0, 10).map((p) => (
                      <motion.li
                        key={p._id}
                        variants={itemVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        layout
                      >
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
                      </motion.li>
                    ))}
                    {filteredGroups.slice(0, 10).map((g) => (
                      <motion.li
                        key={g._id}
                        variants={itemVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        layout
                      >
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
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </motion.ul>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Patient Detail Modal with Framer Motion */}
      <AnimatePresence>
        {selectedPatient && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            variants={modalBgVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={() => setSelectedPatient(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              variants={detailVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              layoutId="patientDetail"
            >
              <PatientCard
                patient={selectedPatient}
                groups={groups}
                isExpanded
                onToggleExpand={() => setSelectedPatient(null)}
                onDeletePatient={() => setSelectedPatient(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Group Detail Modal with Framer Motion */}
      <AnimatePresence>
        {selectedGroup && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            variants={modalBgVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={() => setSelectedGroup(null)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              variants={detailVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              layoutId="groupDetail"
            >
              <GroupCard
                group={selectedGroup}
                patients={patients}
                isExpanded
                onToggleExpand={() => setSelectedGroup(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HomePatientSearchBar;
