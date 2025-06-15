// src/components/ServiceAndEmployeeFilter.tsx
import React, { useRef, useEffect, useMemo } from "react";
import { CalendarEmployee } from "../CalendarEmployeeSelector/CalendarEmployeeSelector";

interface Props {
  employees: CalendarEmployee[];
  selectedEmployee: string;
  onEmployeeChange: (id: string) => void;

  currentUserEmail: string;
  ownerEmail: string;
  open: boolean;
  onClose: () => void;
}

export const ServiceAndEmployeeFilter: React.FC<Props> = ({
  employees,
  selectedEmployee,
  onEmployeeChange,

  currentUserEmail,
  ownerEmail,
  open,
  onClose,
}) => {
  const ALL = "";
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Dedupe employees by email (case-insensitive)
  const uniqueEmployees = useMemo(() => {
    const map = new Map<string, CalendarEmployee>();
    employees.forEach((e) => {
      const key = e.email.toLowerCase().trim();
      if (!map.has(key)) map.set(key, e);
    });
    return Array.from(map.values());
  }, [employees]);

  // Close sidebar on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        open &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      )}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 z-50 h-full w-4/5 max-w-xs bg-white shadow-lg transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-yellow-700">Filtreler</h2>
          <button onClick={onClose} className="text-gray-600 text-xl">
            ×
          </button>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto h-full">
          {/* Employee Filter */}
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-700">Çalışan</h3>
            <div className="space-y-2">
              {/* All */}
              <button
                onClick={() => onEmployeeChange(ALL)}
                className={`w-full text-left p-2 rounded-md ${
                  selectedEmployee === ALL
                    ? "bg-brand-main text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                Hepsi
              </button>
              {uniqueEmployees.map((emp) => (
                <button
                  key={emp.email}
                  onClick={() => onEmployeeChange(emp.email)}
                  className={`w-full text-left p-2 rounded-md flex justify-between items-center ${
                    selectedEmployee === emp.email
                      ? "bg-brand-main text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <span>{emp.name}</span>
                  {emp.email === currentUserEmail && (
                    <span className="text-xs italic">(Siz)</span>
                  )}
                  {emp.email === ownerEmail && (
                    <span className="text-xs italic">(Yönetici)</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
