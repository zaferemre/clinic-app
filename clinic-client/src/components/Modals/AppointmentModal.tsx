// src/components/AppointmentModal.tsx

import React, { useState, useEffect } from "react";
import { EventInput } from "@fullcalendar/core";
import AppModal from "./AppModal";

interface Service {
  _id: string;
  serviceName: string;
}
interface Employee {
  email: string;
  name: string;
}

interface Props {
  event: EventInput & {
    extendedProps?: {
      employeeEmail?: string;
      serviceId?: string;
      serviceName?: string;
    };
  };
  services: Service[];
  employees: Employee[];
  onClose: () => void;
  onCancel: (id: string) => Promise<void>;
  onUpdate: (
    id: string,
    changes: { start: string; end: string; serviceId?: string }
  ) => Promise<void>;
  loading?: boolean;
}

/**
 * Convert a FullCalendar DateInput (string | Date | number) into
 * an HTML datetime-local input string (YYYY-MM-DDThh:mm).
 */
const toLocalInput = (date?: string | Date | number | number[]): string => {
  if (date == null) return "";
  // Handle array case (e.g., [year, month, day, ...])
  if (Array.isArray(date)) {
    // FullCalendar uses [year, month, day, ...] (month is 1-based)
    const [year, month, day, hour = 0, minute = 0] = date;
    const d = new Date(year, (month ?? 1) - 1, day ?? 1, hour, minute);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 16);
  }
  const d =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;
  if (isNaN(d.getTime())) return "";
  // slice to "YYYY-MM-DDTHH:mm"
  return d.toISOString().slice(0, 16);
};

export const AppointmentModal: React.FC<Props> = ({
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
  const [serviceId, setServiceId] = useState(
    event.extendedProps?.serviceId || ""
  );
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setStartStr(toLocalInput(event.start));
    setEndStr(toLocalInput(event.end));
    setServiceId(event.extendedProps?.serviceId || "");
    setEditing(false);
    setError(null);
  }, [event]);

  const empEmail = event.extendedProps?.employeeEmail || "";
  const empName =
    employees.find((e) => e.email === empEmail)?.name ||
    empEmail ||
    "Bilinmeyen";
  const svcName =
    services.find((s) => s._id === serviceId)?.serviceName ||
    event.extendedProps?.serviceName ||
    "Bilinmeyen";

  const handleCancelEvt = async () => {
    await onCancel(event.id as string);
    onClose();
  };
  const handleUpdateEvt = async () => {
    if (!startStr || !endStr) return setError("Başlangıç ve Bitiş gerekli.");
    await onUpdate(event.id as string, {
      start: new Date(startStr).toISOString(),
      end: new Date(endStr).toISOString(),
      serviceId,
    });
    onClose();
  };

  return (
    <AppModal
      open={!loading && !!event.id}
      onClose={onClose}
      title="Randevu Detayları"
    >
      {/* If loading show overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
          Yükleniyor…
        </div>
      )}
      <div className="space-y-4">
        {/* Employee & read/edit fields… */}
        <p>
          <strong>Çalışan:</strong> {empName}
        </p>
        {editing ? (
          <>
            <label className="block text-sm">Başlangıç</label>
            <input
              type="datetime-local"
              value={startStr}
              onChange={(e) => setStartStr(e.target.value)}
              className="w-full border rounded p-2"
            />
            <label className="block text-sm">Bitiş</label>
            <input
              type="datetime-local"
              value={endStr}
              onChange={(e) => setEndStr(e.target.value)}
              className="w-full border rounded p-2"
            />
            <label className="block text-sm">Hizmet</label>
            <select
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
              {new Date(event.start as string).toLocaleString()}
            </p>
            <p>
              <strong>Bitiş:</strong>{" "}
              {new Date(event.end as string).toLocaleString()}
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
          onClick={handleCancelEvt}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          İptal Et
        </button>
      </div>
    </AppModal>
  );
};
