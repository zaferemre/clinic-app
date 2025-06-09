// src/components/Services/ServiceModal.tsx
import React, { useState, useEffect } from "react";
import { Service } from "../../../api/servicesApi";

interface Props {
  show: boolean;
  serviceToEdit?: Service;
  onClose: () => void;
  onSubmit: (data: {
    serviceName: string;
    servicePrice: number;
    serviceKapora: number;
    serviceDuration: number;
    _id?: string;
  }) => void;
}

export const ServiceModal: React.FC<Props> = ({
  show,
  serviceToEdit,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [kapora, setKapora] = useState("");
  const [duration, setDuration] = useState("");

  useEffect(() => {
    if (serviceToEdit) {
      setName(serviceToEdit.serviceName);
      setPrice(serviceToEdit.servicePrice.toString());
      setKapora(serviceToEdit.serviceKapora.toString());
      setDuration(serviceToEdit.serviceDuration.toString());
    } else {
      setName("");
      setPrice("");
      setKapora("");
      setDuration("");
    }
  }, [serviceToEdit]);

  if (!show) return null;

  const handle = () => {
    const p = parseFloat(price);
    const k = parseFloat(kapora);
    const d = parseInt(duration, 10);
    if (!name || isNaN(p) || p < 0 || isNaN(k) || k < 0 || isNaN(d) || d < 1) {
      return alert("Lütfen tüm alanları geçerli şekilde doldurun.");
    }
    onSubmit({
      serviceName: name,
      servicePrice: p,
      serviceKapora: k,
      serviceDuration: d,
      _id: serviceToEdit?._id,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md space-y-4">
        <h2 className="text-lg font-semibold">
          {serviceToEdit ? "Hizmeti Düzenle" : "Yeni Hizmet"}
        </h2>
        <div>
          <label className="block text-sm mb-1">Hizmet Adı:</label>
          <input
            className="w-full border px-3 py-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Ücret (TL):</label>
          <input
            type="number"
            min="0"
            className="w-full border px-3 py-2 rounded"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Kapora (TL):</label>
          <input
            type="number"
            min="0"
            className="w-full border px-3 py-2 rounded"
            value={kapora}
            onChange={(e) => setKapora(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Süre (dakika):</label>
          <input
            type="number"
            min="1"
            className="w-full border px-3 py-2 rounded"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>
        <div className="flex space-x-2 pt-2">
          <button
            onClick={handle}
            className="flex-1 bg-green-500 text-white py-2 rounded"
          >
            Kaydet
          </button>
          <button onClick={onClose} className="flex-1 bg-gray-300 py-2 rounded">
            İptal
          </button>
        </div>
      </div>
    </div>
  );
};
