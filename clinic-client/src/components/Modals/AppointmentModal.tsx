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
 * Convert FullCalendar DateInput into a local YYYY-MM-DDThh:mm string
 * using local getters to avoid UTC offset shifts
 */
const toLocalInput = (date?: string | Date | number | number[]): string => {
  if (date == null) return "";
  let d: Date;
  if (Array.isArray(date)) {
    const [y, m, day, h = 0, min = 0] = date;
    d = new Date(y, (m ?? 1) - 1, day ?? 1, h, min);
  } else {
    d =
      typeof date === "string" || typeof date === "number"
        ? new Date(date)
        : date;
  }
  if (isNaN(d.getTime())) return "";
  const pad2 = (n: number) => n.toString().padStart(2, "0");
  const YYYY = d.getFullYear();
  const MM = pad2(d.getMonth() + 1);
  const DD = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mm = pad2(d.getMinutes());
  return `${YYYY}-${MM}-${DD}T${hh}:${mm}`;
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
    if (!startStr || !endStr) {
      setError("Başlangıç ve Bitiş gerekli.");
      return;
    }
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
