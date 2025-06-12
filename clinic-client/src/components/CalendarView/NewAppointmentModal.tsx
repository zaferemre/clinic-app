// src/components/NewAppointmentModal.tsx
import React from "react";
import AppModal from "../Modals/AppModal";

interface Patient {
  _id: string;
  name: string;
  credit: number;
}

interface Employee {
  email: string;
  name: string;
}

interface Service {
  _id: string;
  serviceName: string;
  serviceDuration: number;
}

interface NewAppointmentModalProps {
  show: boolean;
  onClose: () => void;
  patients: Patient[];
  employees: Employee[];
  services: Service[];
  isOwner: boolean;
  currentEmail: string;
  selectedPatient: string;
  setSelectedPatient: (id: string) => void;
  selectedEmployee: string;
  setSelectedEmployee: (email: string) => void;
  selectedService: string;
  setSelectedService: (id: string) => void;
  startStr: string;
  endStr: string;
  setStartStr: (val: string) => void;
  setEndStr: (val: string) => void;
  onSubmit: (startISO: string, endISO: string, employeeEmail: string) => void;
  onAddPatient: () => void;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  show,
  onClose,
  patients,
  employees,
  services,
  isOwner,
  currentEmail,
  selectedPatient,
  setSelectedPatient,
  selectedEmployee,
  setSelectedEmployee,
  selectedService,
  setSelectedService,
  startStr,
  setStartStr,
  endStr,
  setEndStr,
  onSubmit,
  onAddPatient,
}) => {
  if (!show) return null;

  const handle = () => {
    if (!startStr || !endStr) return alert("Geçerli tarih girin.");
    onSubmit(
      new Date(startStr).toISOString(),
      new Date(endStr).toISOString(),
      isOwner ? selectedEmployee : currentEmail
    );
  };

  return (
    <AppModal open={show} onClose={onClose} title="Yeni Randevu Oluştur">
      <div className="space-y-4">
        {/* Patient */}
        <div>
          <label className="block text-sm">Hasta</label>
          <div className="flex space-x-2">
            <select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="flex-1 border rounded p-2"
            >
              <option value="">Seçiniz</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} (Kredi: {p.credit})
                </option>
              ))}
            </select>
            <button
              onClick={onAddPatient}
              className="text-sm text-blue-600 underline"
            >
              + Yeni
            </button>
          </div>
        </div>
        {/* Employee */}
        {isOwner && (
          <div>
            <label className="block text-sm">Çalışan</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="">Seçiniz</option>
              {employees.map((e) => (
                <option key={e.email} value={e.email}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {/* Service */}
        <div>
          <label className="block text-sm">Hizmet</label>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="w-full border rounded p-2"
          >
            <option value="">Seçiniz</option>
            {services.map((s) => (
              <option key={s._id} value={s._id}>
                {s.serviceName}
              </option>
            ))}
          </select>
        </div>
        {/* Times */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm">Başlangıç</label>
            <input
              type="datetime-local"
              value={startStr.slice(0, 16)}
              onChange={(e) => setStartStr(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm">Bitiş</label>
            <input
              type="datetime-local"
              value={endStr.slice(0, 16)}
              onChange={(e) => setEndStr(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">
            İptal
          </button>
          <button
            onClick={handle}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Oluştur
          </button>
        </div>
      </div>
    </AppModal>
  );
};
