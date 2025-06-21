// src/components/Modals/ServiceModal/ServiceModal.tsx
import React, { useState, useEffect } from "react";
import AppModal from "../AppModal";
import { useAuth } from "../../../contexts/AuthContext";
import type { ServiceInfo } from "../../../types/sharedTypes";
import {
  createService,
  updateService,
  deleteService,
} from "../../../api/servicesApi";

interface Props {
  show: boolean;
  serviceToEdit?: ServiceInfo;
  onClose: () => void;
  onSaved?: (service: ServiceInfo) => void;
}

export const ServiceModal: React.FC<Props> = ({
  show,
  serviceToEdit,
  onClose,
  onSaved,
}) => {
  const { idToken, selectedCompanyId, selectedClinicId } = useAuth();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (serviceToEdit) {
      setName(serviceToEdit.serviceName ?? "");
      setPrice(String(serviceToEdit.servicePrice ?? ""));
      setDuration(String(serviceToEdit.serviceDuration ?? ""));
    } else {
      setName("");
      setPrice("");
      setDuration("");
    }
  }, [serviceToEdit, show]);

  const handleSave = async () => {
    if (!idToken || !selectedCompanyId || !selectedClinicId) return;
    const p = parseFloat(price);
    const d = parseInt(duration, 10);
    if (!name || isNaN(p) || isNaN(d) || p < 0 || d < 1) {
      return alert("Lütfen tüm alanları doğru doldurun.");
    }

    setSaving(true);
    try {
      let result: ServiceInfo;
      if (serviceToEdit?._id) {
        result = await updateService(
          idToken,
          selectedCompanyId,
          selectedClinicId,
          serviceToEdit._id,
          {
            serviceName: name,
            servicePrice: p,
            serviceDuration: d,
          }
        );
      } else {
        result = await createService(
          idToken,
          selectedCompanyId,
          selectedClinicId,
          {
            serviceName: name,
            servicePrice: p,
            serviceDuration: d,
          }
        );
      }
      onSaved?.(result);
      onClose();
    } catch (err: unknown) {
      console.error("[ServiceModal] Save error:", err);
      if (err instanceof Error) {
        alert(err.message ?? "Hata oluştu");
      } else {
        alert("Hata oluştu");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !idToken ||
      !selectedCompanyId ||
      !selectedClinicId ||
      !serviceToEdit?._id
    )
      return;
    if (!window.confirm("Bu hizmeti silmek istediğinize emin misiniz?")) return;
    try {
      await deleteService(
        idToken,
        selectedCompanyId,
        selectedClinicId,
        serviceToEdit._id
      );
      onClose();
      onSaved?.(serviceToEdit);
    } catch (err: unknown) {
      console.error("[ServiceModal] Delete error:", err);
      if (err instanceof Error) {
        alert(err.message ?? "Silme başarısız");
      } else {
        alert("Silme başarısız");
      }
    }
  };

  return (
    <AppModal
      open={show}
      onClose={onClose}
      title={serviceToEdit ? "Hizmeti Düzenle" : "Yeni Hizmet"}
    >
      <div className="space-y-4">
        <div>
          <label
            htmlFor="service-name"
            className="block text-sm font-semibold text-brand-main mb-1"
          >
            Hizmet Adı
          </label>
          <input
            id="service-name"
            className="mt-1 w-full border px-3 py-2 rounded-xl"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label
            htmlFor="service-price"
            className="block text-sm font-semibold text-brand-main mb-1"
          >
            Ücret (TL)
          </label>
          <input
            id="service-price"
            type="number"
            min="0"
            className="mt-1 w-full border px-3 py-2 rounded-xl"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>
        <div>
          <label
            htmlFor="service-duration"
            className="block text-sm font-semibold text-brand-main mb-1"
          >
            Süre (dk)
          </label>
          <input
            id="service-duration"
            type="number"
            min="1"
            className="mt-1 w-full border px-3 py-2 rounded-xl"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
          />
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300"
            disabled={saving}
          >
            İptal
          </button>
          {serviceToEdit && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600"
              disabled={saving}
            >
              Sil
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-brand-main text-white rounded-xl hover:bg-green-600 disabled:opacity-50"
            disabled={saving}
          >
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </div>
    </AppModal>
  );
};

export default ServiceModal;
