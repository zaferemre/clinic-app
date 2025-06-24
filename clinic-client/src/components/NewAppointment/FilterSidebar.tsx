// src/components/CalendarView/FilterSidebar.tsx
import React, { useRef, useEffect, useMemo } from "react";
import type { CalendarEmployee } from "../CalendarEmployeeSelector/CalendarEmployeeSelector";

// --- Updated prop types ---
export interface FilterSidebarProps {
  open: boolean;
  onClose: () => void;

  // Employees (with userId)
  employees: CalendarEmployee[];
  selectedEmployeeId: string; // CHANGED from email to userId
  onEmployeeChange: (userId: string) => void;

  // Services
  services: { _id: string; serviceName: string }[];
  selectedServiceId: string;
  onServiceChange: (id: string) => void;

  // Groups
  groups: { _id: string; name: string }[];
  selectedGroupId: string;
  onGroupChange: (id: string) => void;

  // Auth info (ids)
  currentUserId: string; // CHANGED from email to userId
  ownerUserId: string; // CHANGED from email to userId
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  open,
  onClose,

  employees,
  selectedEmployeeId,
  onEmployeeChange,

  services,
  selectedServiceId,
  onServiceChange,

  groups,
  selectedGroupId,
  onGroupChange,

  currentUserId,
  ownerUserId,
}) => {
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Deduplicate employees by userId
  const uniqueEmployees = useMemo(() => {
    const map = new Map<string, CalendarEmployee>();
    employees.forEach((e) => {
      if (!map.has(e.userId)) map.set(e.userId, e);
    });
    return Array.from(map.values());
  }, [employees]);

  // Close when clicking outside
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (
        open &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open, onClose]);

  const ALL = "";

  return (
    <>
      {/* backdrop */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      )}

      {/* sidebar panel */}
      <div
        ref={sidebarRef}
        className={`
          fixed top-0 left-0 z-50 h-full w-4/5 max-w-xs
          bg-white shadow-lg transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-brand-main">Filtreler</h2>
          <button
            onClick={onClose}
            className="text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto h-full">
          {/* Employee filter */}
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-700">Çalışan</h3>
            <div className="space-y-2">
              <button
                onClick={() => onEmployeeChange(ALL)}
                className={`w-full text-left p-2 rounded-md ${
                  selectedEmployeeId === ALL
                    ? "bg-brand-main text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                Hepsi
              </button>
              {uniqueEmployees.map((emp) => (
                <button
                  key={emp.userId}
                  onClick={() => onEmployeeChange(emp.userId)}
                  className={`w-full flex justify-between items-center text-left p-2 rounded-md ${
                    selectedEmployeeId === emp.userId
                      ? "bg-brand-main text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <span>{emp.name}</span>
                  {emp.userId === currentUserId && (
                    <span className="text-xs italic">(Siz)</span>
                  )}
                  {emp.userId === ownerUserId && (
                    <span className="text-xs italic">(Yönetici)</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Service filter */}
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-700">Hizmet</h3>
            <div className="space-y-2">
              <button
                onClick={() => onServiceChange(ALL)}
                className={`w-full text-left p-2 rounded-md ${
                  selectedServiceId === ALL
                    ? "bg-brand-main text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                Hepsi
              </button>
              {services.map((svc) => (
                <button
                  key={svc._id}
                  onClick={() => onServiceChange(svc._id)}
                  className={`w-full text-left p-2 rounded-md ${
                    selectedServiceId === svc._id
                      ? "bg-brand-main text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {svc.serviceName}
                </button>
              ))}
            </div>
          </div>

          {/* Group filter */}
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-700">Grup</h3>
            <div className="space-y-2">
              <button
                onClick={() => onGroupChange(ALL)}
                className={`w-full text-left p-2 rounded-md ${
                  selectedGroupId === ALL
                    ? "bg-brand-main text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                Hepsi
              </button>
              {groups.map((g) => (
                <button
                  key={g._id}
                  onClick={() => onGroupChange(g._id)}
                  className={`w-full text-left p-2 rounded-md ${
                    selectedGroupId === g._id
                      ? "bg-brand-main text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
