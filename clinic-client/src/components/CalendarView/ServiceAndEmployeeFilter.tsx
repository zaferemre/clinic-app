import React, { useEffect, useRef, useState } from "react";
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

  // Reset filters when sidebar opens
  useEffect(() => {
    if (open) {
      onEmployeeChange(
        currentUserEmail === ownerEmail ? ALL : currentUserEmail
      );
      onServiceChange(ALL);
    }
  }, [open, currentUserEmail, ownerEmail, onEmployeeChange, onServiceChange]);

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
      {/* FunnelIcon icon button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-3 left-3 z-50 p-2 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-50 focus:outline-none"
        aria-label="Filtreleri Aç"
      >
        <FunnelIcon className="w-6 h-6 text-yellow-600" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
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
            aria-label="Kapat"
            className="text-gray-600 hover:text-gray-800 text-xl"
          >
            ×
          </button>
        </div>

        <div className="p-4 flex flex-col space-y-6 h-full overflow-y-auto">
          {/* Employee Filter */}
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-700">Çalışan</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="employee"
                  checked={selectedEmployee === ALL}
                  onChange={() => onEmployeeChange(ALL)}
                  className="form-radio text-yellow-600"
                />
                <span className="text-gray-800">Hepsi</span>
              </label>
              {employees.map((emp) => (
                <label key={emp.email} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="employee"
                    checked={selectedEmployee === emp.email}
                    onChange={() => onEmployeeChange(emp.email)}
                    className="form-radio text-yellow-600"
                  />
                  <span className="text-gray-800">
                    {emp.name}
                    {emp.email === currentUserEmail && (
                      <span className="ml-1 text-xs text-yellow-500">
                        (Siz)
                      </span>
                    )}
                    {emp.email === ownerEmail && (
                      <span className="ml-1 text-xs text-yellow-600">
                        (Yönetici)
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Service Filter */}
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-700">Hizmet</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="service"
                  checked={selectedService === ALL}
                  onChange={() => onServiceChange(ALL)}
                  className="form-radio text-yellow-600"
                />
                <span className="text-gray-800">Hepsi</span>
              </label>
              {services.map((svc) => (
                <label key={svc._id} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="service"
                    checked={selectedService === svc._id}
                    onChange={() => onServiceChange(svc._id)}
                    className="form-radio text-yellow-600"
                  />
                  <span className="text-gray-800">{svc.serviceName}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
