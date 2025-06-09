import React, { useState } from "react";
import { EventInput } from "@fullcalendar/core";

interface Props {
  event: EventInput;
  onClose: () => void;
  onCancel: (id: string) => Promise<void>;
  onUpdate: (
    id: string,
    changes: { start: string; end: string }
  ) => Promise<void>; // you can extend this to include service/employee
}

export const AppointmentModal: React.FC<Props> = ({
  event,
  onClose,
  onCancel,
  onUpdate,
}) => {
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [startStr, setStartStr] = useState(
    (event.start as string).slice(0, 16)
  );
  const [endStr, setEndStr] = useState((event.end as string).slice(0, 16));
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    setLoading(true);
    setError(null);
    try {
      await onCancel(event.id as string);
      onClose();
    } catch (err: any) {
      setError(err.message || "İptal yapılamadı.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    setError(null);
    try {
      await onUpdate(event.id as string, {
        start: new Date(startStr).toISOString(),
        end: new Date(endStr).toISOString(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "Güncelleme başarısız.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
        <h2 className="text-xl font-semibold text-brand-black">
          Randevu Detayları
        </h2>

        {editing ? (
          <>
            <label className="text-sm font-medium text-gray-700">
              Başlangıç:
            </label>
            <input
              type="datetime-local"
              value={startStr}
              onChange={(e) => setStartStr(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
            <label className="text-sm font-medium text-gray-700">Bitiş:</label>
            <input
              type="datetime-local"
              value={endStr}
              onChange={(e) => setEndStr(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </>
        ) : (
          <>
            <p className="text-sm text-brand-gray-700">
              <span className="font-medium">Başlık:</span> {event.title}
            </p>
            <p className="text-sm text-brand-gray-700">
              <span className="font-medium">Başlangıç:</span>{" "}
              {new Date(event.start as string).toLocaleString()}
            </p>
            <p className="text-sm text-brand-gray-700">
              <span className="font-medium">Bitiş:</span>{" "}
              {new Date(event.end as string).toLocaleString()}
            </p>
          </>
        )}

        {error && <p className="text-sm text-red-500">Hata: {error}</p>}

        <div className="flex justify-between space-x-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm"
            disabled={loading}
          >
            Kapat
          </button>
          {editing ? (
            <button
              onClick={handleUpdate}
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
              disabled={loading}
            >
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </button>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm"
              disabled={loading}
            >
              Düzenle
            </button>
          )}
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm"
            disabled={loading}
          >
            {loading ? "İptal..." : "Randevuyu İptal Et"}
          </button>
        </div>
      </div>
    </div>
  );
};
