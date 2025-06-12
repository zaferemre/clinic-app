// src/components/Services/ServiceModal.tsx
import React, { useState, useEffect } from "react";
import AppModal from "../../Modals/AppModal";
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
      setPrice(String(serviceToEdit.servicePrice));
      setKapora(String(serviceToEdit.serviceKapora));
      setDuration(String(serviceToEdit.serviceDuration));
    } else {
      setName("");
      setPrice("");
      setKapora("");
      setDuration("");
    }
  }, [serviceToEdit]);

  const handleSave = () => {
    const p = parseFloat(price),
      k = parseFloat(kapora),
      d = parseInt(duration, 10);
    if (!name || isNaN(p) || isNaN(k) || isNaN(d) || p < 0 || k < 0 || d < 1) {
      return alert("Lütfen tüm alanları doğru doldurun.");
    }
    onSubmit({
      serviceName: name,
      servicePrice: p,
      serviceKapora: k,
      serviceDuration: d,
      _id: serviceToEdit?._id,
    });
    onClose();
  };

  return (
    <AppModal
      open={show}
      onClose={onClose}
      title={serviceToEdit ? "Hizmeti Düzenle" : "Yeni Hizmet"}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm">Hizmet Adı</label>
          <input
            className="mt-1 w-full border px-3 py-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm">Ücret (TL)</label>
          <input
            type="number"
            min="0"
            className="mt-1 w-full border px-3 py-2 rounded"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm">Kapora (TL)</label>
          <input
            type="number"
            min="0"
            className="mt-1 w-full border px-3 py-2 rounded"
            value={kapora}
            onChange={(e) => setKapora(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm">Süre (dk)</label>
          <input
            type="number"
            min="1"
            className="mt-1 w-full border px-3 py-2 rounded"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Kaydet
          </button>
        </div>
      </div>
    </AppModal>
  );
};
