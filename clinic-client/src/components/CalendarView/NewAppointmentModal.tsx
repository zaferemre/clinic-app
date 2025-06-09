// src/components/NewAppointmentModal.tsx
import React from "react";

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
  endStr,
  setStartStr,
  setEndStr,
  onSubmit,
  onAddPatient,
}) => {
  if (!show) return null;

  const handleSubmit = () => {
    const startDate = new Date(startStr);
    const endDate = new Date(endStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      alert("Tarih bilgisi geçersiz.");
      return;
    }

    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();
    const employeeEmailToUse = isOwner ? selectedEmployee : currentEmail;

    onSubmit(startISO, endISO, employeeEmailToUse);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Yeni Randevu Oluştur</h2>
          <button onClick={onClose} className="text-xl">
            ×
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Hasta:</label>
          <select
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="w-full border px-3 py-2 rounded"
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
            className="text-sm text-blue-600 underline mt-1"
          >
            + Yeni Hasta Ekle
          </button>
        </div>

        {isOwner && (
          <div>
            <label className="block text-sm font-medium mb-1">Çalışan:</label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full border px-3 py-2 rounded"
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
        {!isOwner && <input type="hidden" value={currentEmail} />}

        <div>
          <label className="block text-sm font-medium mb-1">Hizmet:</label>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Seçiniz</option>
            {services.map((s) => (
              <option key={s._id} value={s._id}>
                {s.serviceName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex space-x-2">
          <div className="flex-1">
            <label className="block text-sm mb-1">Başlangıç:</label>
            <input
              type="datetime-local"
              step="60"
              value={startStr ? startStr.slice(0, 16) : ""}
              onChange={(e) => setStartStr(e.target.value)}
              className="w-full border px-3 py-1 rounded"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm mb-1">Bitiş:</label>
            <input
              type="datetime-local"
              step="60"
              value={endStr ? endStr.slice(0, 16) : ""}
              onChange={(e) => setEndStr(e.target.value)}
              className="w-full border px-3 py-1 rounded"
            />
          </div>
        </div>

        <div className="flex space-x-2 pt-2">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-green-500 text-white py-2 rounded"
          >
            Oluştur
          </button>
          <button onClick={onClose} className="flex-1 bg-gray-300 py-2 rounded">
            İptal
          </button>
        </div>
      </div>
    </div>
  );
};
