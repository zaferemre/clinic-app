// src/components/AppointmentModal.tsx

import React, { useState } from "react";
import { EventInput } from "@fullcalendar/core";

interface Props {
  event: EventInput;
  onClose: () => void;
  onCancel: (id: string) => Promise<void>;
}

export const AppointmentModal: React.FC<Props> = ({
  event,
  onClose,
  onCancel,
}) => {
  const startStr = new Date(event.start as string).toLocaleString();
  const endStr = new Date(event.end as string).toLocaleString();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    setLoading(true);
    setError(null);
    try {
      await onCancel(event.id as string);
      onClose();
    } catch (err: any) {
      console.error("Error cancelling appointment:", err);
      setError(err.message || "İptal yapılamadı.");
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
        <p className="text-sm text-brand-gray-700">
          <span className="font-medium">Başlık:</span> {event.title}
        </p>
        <p className="text-sm text-brand-gray-700">
          <span className="font-medium">Başlangıç:</span> {startStr}
        </p>
        <p className="text-sm text-brand-gray-700">
          <span className="font-medium">Bitiş:</span> {endStr}
        </p>
        {error && <p className="text-sm text-brand-red-500">Hata: {error}</p>}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="
              px-4 py-2 bg-brand-gray-200 hover:bg-brand-gray-300
              text-brand-black rounded-lg text-sm
              focus:outline-none focus:ring-2 focus:ring-brand-gray-300
            "
            disabled={loading}
          >
            Kapat
          </button>
          <button
            onClick={handleCancel}
            className="
              px-4 py-2 bg-brand-red-500 hover:bg-brand-red-600
              text-white rounded-lg text-sm
              focus:outline-none focus:ring-2 focus:ring-brand-red-300
              disabled:opacity-50
            "
            disabled={loading}
          >
            {loading ? "İptal Ediliyor…" : "Randevuyu İptal Et"}
          </button>
        </div>
      </div>
    </div>
  );
};
