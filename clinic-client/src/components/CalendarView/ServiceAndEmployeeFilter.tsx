import React, { useState } from "react";
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
}

export const ServiceAndEmployeeFilter: React.FC<Props> = ({
  employees,
  selectedEmployee,
  onEmployeeChange,
  services,
  selectedService,
  onServiceChange,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed top-4 left-4 z-50">
      <button
        onClick={() => setOpen(!open)}
        className="bg-white border shadow p-2 rounded-xl"
      >
        ☰
      </button>

      {open && (
        <div className="mt-2 w-64 bg-white shadow-xl border rounded-xl p-4 space-y-4">
          <div>
            <label className="block font-semibold mb-1 text-sm">Çalışan:</label>
            <div className="space-y-1">
              {employees.map((emp) => (
                <label key={emp.email} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedEmployee === emp.email}
                    onChange={() =>
                      onEmployeeChange(
                        selectedEmployee === emp.email ? "" : emp.email
                      )
                    }
                  />
                  <span>{emp.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-sm">Hizmet:</label>
            <div className="space-y-1">
              {services.map((svc) => (
                <label key={svc._id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedService === svc._id}
                    onChange={() =>
                      onServiceChange(
                        selectedService === svc._id ? "" : svc._id
                      )
                    }
                  />
                  <span>{svc.serviceName}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={() => setOpen(false)}
            className="w-full bg-gray-200 py-1 rounded text-sm"
          >
            Kapat
          </button>
        </div>
      )}
    </div>
  );
};
