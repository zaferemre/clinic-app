// src/components/AppointmentModal.tsx

import React, { useState, useEffect } from "react";
import { EventInput } from "@fullcalendar/core";

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

const COLOR_PALETTE = ["#34D399", "#93C5FD", "#FDBA74", "#F9A8D4", "#FCA5A5"];
function getEmployeeColor(email: string): string {
  let hash = 0;
  for (const ch of email) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return COLOR_PALETTE[Math.abs(hash) % COLOR_PALETTE.length];
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
    event.extendedProps?.serviceId ?? ""
  );
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setStartStr(toLocalInput(event.start));
    setEndStr(toLocalInput(event.end));
    setServiceId(event.extendedProps?.serviceId ?? "");
    setEditing(false);
    setError(null);
  }, [event]);

  const empEmailRaw = event.extendedProps?.employeeEmail ?? "";
  const empEmail = empEmailRaw.trim();
  const empName =
    employees.find((e) => e.email === empEmail)?.name ||
    (empEmail ? empEmail : "Bilinmeyen");

  const svcIdRaw = event.extendedProps?.serviceId ?? "";
  const svcId = svcIdRaw.trim();
  const svcName =
    services.find((s) => s._id === svcId)?.serviceName ||
    event.extendedProps?.serviceName ||
    "Bilinmeyen";

  const color = getEmployeeColor(empEmail || "default");

  const handleCancelEvt = async () => {
    setError(null);
    try {
      await onCancel(event.id as string);
      onClose();
    } catch (e: any) {
      setError(e.message || "İptal yapılamadı.");
    }
  };

  const handleUpdateEvt = async () => {
    setError(null);
    if (!startStr || !endStr) {
      setError("Başlangıç ve Bitiş zamanı gereklidir.");
      return;
    }
    try {
      await onUpdate(event.id as string, {
        start: new Date(startStr).toISOString(),
        end: new Date(endStr).toISOString(),
        serviceId: serviceId || undefined,
      });
      onClose();
    } catch (e: any) {
      setError(e.message || "Güncelleme başarısız.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-50 text-white font-semibold text-lg">
          Yükleniyor...
        </div>
      )}
      <div
        className={`w-full max-w-md relative ${
          loading ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <div
          className="bg-white rounded-lg shadow-lg overflow-hidden border-l-4"
          style={{ borderColor: color }}
        >
          <div className="px-6 py-4" style={{ backgroundColor: color }}>
            <h2 className="text-lg font-bold text-white">Randevu Detayları</h2>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-800">
              <span className="font-medium">Çalışan:</span> {empName}
            </p>
            {editing ? (
              <>
                {/* Editable fields */}
                <label className="block text-sm font-medium text-gray-700">
                  Başlangıç
                </label>
                <input
                  type="datetime-local"
                  value={startStr}
                  onChange={(e) => setStartStr(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  disabled={loading}
                />
                <label className="block text-sm font-medium text-gray-700">
                  Bitiş
                </label>
                <input
                  type="datetime-local"
                  value={endStr}
                  onChange={(e) => setEndStr(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  disabled={loading}
                />
                <label className="block text-sm font-medium text-gray-700">
                  Hizmet
                </label>
                <select
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  disabled={loading}
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
                {/* Read-only view */}
                <p className="text-sm text-gray-800">
                  <span className="font-medium">Başlangıç:</span>{" "}
                  {new Date(event.start as string).toLocaleString()}
                </p>
                <p className="text-sm text-gray-800">
                  <span className="font-medium">Bitiş:</span>{" "}
                  {new Date(event.end as string).toLocaleString()}
                </p>
                <p className="text-sm text-gray-800">
                  <span className="font-medium">Hizmet:</span> {svcName}
                </p>
              </>
            )}
            {error && <p className="text-sm text-red-500">Hata: {error}</p>}
          </div>
          <div className="px-6 py-4 bg-gray-50 flex space-x-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
            >
              Kapat
            </button>
            {editing ? (
              <button
                onClick={handleUpdateEvt}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
              >
                {loading ? "Kaydediliyor..." : "Kaydet"}
              </button>
            ) : (
              <button
                onClick={() => setEditing(true)}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm"
              >
                Düzenle
              </button>
            )}
            <button
              onClick={handleCancelEvt}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm"
            >
              {loading ? "İptal..." : "Randevuyu İptal Et"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
