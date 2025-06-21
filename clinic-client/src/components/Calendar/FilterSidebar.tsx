// src/components/CalendarView/FilterSidebar.tsx
import React, { useRef, useEffect, useMemo } from "react";
import type { EmployeeInfo, ServiceInfo, Group } from "../../types/sharedTypes";

export interface FilterSidebarProps {
  open: boolean;
  onClose: () => void;

  employees: EmployeeInfo[];
  selectedEmployee: string;
  onEmployeeChange: (email: string) => void;

  services: ServiceInfo[];
  selectedService: string;
  onServiceChange: (id: string) => void;

  groups: Group[];
  selectedGroup: string;
  onGroupChange: (id: string) => void;

  currentUserEmail: string;
  ownerEmail: string;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  open,
  onClose,
  employees,
  selectedEmployee,
  onEmployeeChange,
  services,
  selectedService,
  onServiceChange,
  groups,
  selectedGroup,
  onGroupChange,
  currentUserEmail,
  ownerEmail,
}) => {
  const sidebarRef = useRef<HTMLDivElement>(null);

  const uniqueEmployees = useMemo(() => {
    const map = new Map<string, EmployeeInfo>();
    employees.forEach((e) => {
      const key = e.email.toLowerCase().trim();
      if (!map.has(key)) map.set(key, e);
    });
    return Array.from(map.values());
  }, [employees]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        open &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

  const ALL = "";

  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 bg-black/40 z-40"
          aria-label="Kapat"
          onClick={onClose}
          style={{
            outline: "none",
            border: "none",
            padding: 0,
            margin: 0,
            background: "transparent",
          }}
        />
      )}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 z-50 h-full w-4/5 max-w-xs bg-white shadow-lg transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
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
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-700">Çalışan</h3>
            <div className="space-y-2">
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
                  className={`w-full flex justify-between items-center text-left p-2 rounded-md ${
                    selectedEmployee === emp.email
                      ? "bg-brand-main text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <span>{emp.name}</span>
                  {emp.email === currentUserEmail && (
                    <span className="text-xs italic ml-2">(Siz)</span>
                  )}
                  {emp.email === ownerEmail && (
                    <span className="text-xs italic ml-2">(Yönetici)</span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-700">Hizmet</h3>
            <div className="space-y-2">
              <button
                onClick={() => onServiceChange(ALL)}
                className={`w-full text-left p-2 rounded-md ${
                  selectedService === ALL
                    ? "bg-brand-main text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                Hepsi
              </button>
              {services.map((svc) => (
                <button
                  key={svc._id}
                  onClick={() => onServiceChange(svc._id ?? "")}
                  className={`w-full text-left p-2 rounded-md ${
                    selectedService === svc._id
                      ? "bg-brand-main text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {svc.serviceName}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-700">Grup</h3>
            <div className="space-y-2">
              <button
                onClick={() => onGroupChange(ALL)}
                className={`w-full text-left p-2 rounded-md ${
                  selectedGroup === ALL
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
                    selectedGroup === g._id
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
