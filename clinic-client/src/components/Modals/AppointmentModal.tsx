// src/components/AppointmentModal.tsx
import React, { useState, useEffect } from "react";
import AppModal from "./AppModal";
import type {
  EnrichedAppointment,
  EmployeeInfo,
  ServiceInfo,
} from "../../types/sharedTypes";

interface Props {
  event: EnrichedAppointment;
  services: ServiceInfo[];
  employees: EmployeeInfo[];
  onClose: () => void;
  onCancel: (id: string) => Promise<void>;
  onUpdate: (
    id: string,
    changes: { start: string; end: string; serviceId?: string }
  ) => Promise<void>;
  loading?: boolean;
}

const toLocalInput = (iso?: string): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

const AppointmentModal: React.FC<Props> = ({
  event,
  services,
  employees,
  onClose,
  onCancel,
  onUpdate,
  loading = false,
}) => {
  const [startStr, setStartStr] = useState(toLocalInput(event.start));
  const [endStr, setEndStr] = useState(toLocalInput(event.end));
  const [serviceId, setServiceId] = useState(event.serviceId || "");
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStartStr(toLocalInput(event.start));
    setEndStr(toLocalInput(event.end));
    setServiceId(event.serviceId || "");
    setEditing(false);
    setError(null);
  }, [event]);

  const emp = employees.find((e) => e.email === event.employeeEmail);
  const empName = emp?.name ?? event.employeeEmail ?? "Bilinmeyen";

  const svc = services.find((s) => s._id === serviceId);
  const svcName = svc?.serviceName ?? event.serviceName ?? "Bilinmeyen";

  const handleCancel = async () => {
    await onCancel(event.id);
    onClose();
  };

  const handleUpdateEvt = async () => {
    if (!startStr || !endStr) {
      setError("Başlangıç ve Bitiş gerekli.");
      return;
    }
    await onUpdate(event.id, {
      start: new Date(startStr).toISOString(),
      end: new Date(endStr).toISOString(),
      serviceId: serviceId || undefined,
    });
    onClose();
  };

  return (
    <AppModal open={!loading} onClose={onClose} title="Randevu Detayları">
      {loading && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
          Yükleniyor…
        </div>
      )}
      <div className="space-y-4">
        <p>
          <strong>Çalışan:</strong> {empName}
        </p>
        {editing ? (
          <>
            <label htmlFor="appointment-start" className="block text-sm">
              Başlangıç
            </label>
            <input
              id="appointment-start"
              type="datetime-local"
              value={startStr}
              onChange={(e) => setStartStr(e.target.value)}
              className="w-full border rounded p-2"
            />
            <label htmlFor="appointment-end" className="block text-sm">
              Bitiş
            </label>
            <input
              id="appointment-end"
              type="datetime-local"
              value={endStr}
              onChange={(e) => setEndStr(e.target.value)}
              className="w-full border rounded p-2"
            />
            <label htmlFor="appointment-service" className="block text-sm">
              Hizmet
            </label>
            <select
              id="appointment-service"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="">Seçiniz</option>
              {services.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.serviceName}
                </option>
              ))}
            </select>
          </>
        ) : (
          <>
            <p>
              <strong>Başlangıç:</strong>{" "}
              {new Date(event.start).toLocaleString()}
            </p>
            <p>
              <strong>Bitiş:</strong> {new Date(event.end).toLocaleString()}
            </p>
            <p>
              <strong>Hizmet:</strong> {svcName}
            </p>
          </>
        )}
        {error && <p className="text-red-500">{error}</p>}
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">
          Kapat
        </button>
        {editing ? (
          <button
            onClick={handleUpdateEvt}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Güncelle
          </button>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-yellow-500 text-white rounded"
          >
            Düzenle
          </button>
        )}
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          İptal Et
        </button>
      </div>
    </AppModal>
  );
};

export default AppointmentModal;
