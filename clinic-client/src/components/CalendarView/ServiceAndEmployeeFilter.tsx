// src/components/ServiceAndEmployeeFilter.tsx
import React, { useState, useRef, useEffect } from "react";
import { FunnelIcon } from "@heroicons/react/24/outline";
import { CalendarEmployee } from "../CalendarEmployeeSelector/CalendarEmployeeSelector";

interface Service {
  _id: string;
  serviceName: string;
}
interface Props {
  employees: CalendarEmployee[];
  selectedEmployee: string;
  onEmployeeChange: (id: string) => void;
  services: Service[];
  selectedService: string;
  onServiceChange: (id: string) => void;
  currentUserEmail: string;
  ownerEmail: string;
}

export const ServiceAndEmployeeFilter: React.FC<Props> = ({
  employees,
  selectedEmployee,
  onEmployeeChange,
  services,
  selectedService,
  onServiceChange,
  currentUserEmail,
  ownerEmail,
}) => {
  const ALL = "";
  const [open, setOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close sidebar on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        open &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <>
      {/* Toggle */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-3 left-3 z-50 p-2 bg-white border rounded-lg shadow hover:bg-gray-50"
      >
        <FunnelIcon className="w-6 h-6 text-yellow-600" />
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 z-50 h-full w-4/5 max-w-xs bg-white shadow-lg transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-yellow-700">Filtreler</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-600 text-xl"
          >
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
                    ? "bg-yellow-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                Hepsi
              </button>

              {employees.map((emp) => (
                <button
                  key={emp.email}
                  onClick={() => onEmployeeChange(emp.email)}
                  className={`w-full text-left p-2 rounded-md flex justify-between items-center ${
                    selectedEmployee === emp.email
                      ? "bg-yellow-600 text-white"
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

          {/* Service Filter */}
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-700">Hizmet</h3>
            <div className="space-y-2">
              <button
                onClick={() => onServiceChange(ALL)}
                className={`w-full text-left p-2 rounded-md ${
                  selectedService === ALL
                    ? "bg-yellow-600 text-white"
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
                    selectedService === svc._id
                      ? "bg-yellow-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {svc.serviceName}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
