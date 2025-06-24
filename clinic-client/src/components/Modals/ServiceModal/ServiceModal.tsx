import React, { useState, useEffect } from "react";
import AppModal, { ModalForm } from "../AppModal";
import { useAuth } from "../../../contexts/AuthContext";
import type { ServiceInfo } from "../../../types/sharedTypes";
import {
  createService,
  updateService,
  deleteService,
} from "../../../api/servicesApi";
import { XCircleIcon } from "@heroicons/react/24/solid";

interface Props {
  show: boolean;
  serviceToEdit?: ServiceInfo;
  onClose: () => void;
  onSaved?: (service: ServiceInfo) => void;
}

const COMMON_DURATIONS = [15, 30, 45, 60];

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
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
  }, [serviceToEdit, show]);

  const handleSubmit = async (): Promise<boolean> => {
    setError(null);
    if (!idToken || !selectedCompanyId || !selectedClinicId) {
      setError("Yetkilendirme bilgisi eksik.");
      return false;
    }
    const p = parseFloat(price);
    const d = parseInt(duration, 10);
    if (!name.trim() || isNaN(p) || isNaN(d) || p < 0 || d < 1) {
      setError("Lütfen tüm alanları doğru doldurun.");
      return false;
    }
    try {
      const payload = {
        serviceName: name.trim(),
        servicePrice: p,
        serviceDuration: d,
      };
      let result: ServiceInfo;
      if (serviceToEdit?._id) {
        result = await updateService(
          idToken,
          selectedCompanyId,
          selectedClinicId,
          serviceToEdit._id,
          payload
        );
      } else {
        result = await createService(
          idToken,
          selectedCompanyId,
          selectedClinicId,
          payload
        );
      }
      onSaved?.(result);
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sunucu hatası.");
      return false;
    }
  };

  const handleDelete = async () => {
    if (!serviceToEdit?._id) return;
    if (!window.confirm("Bu hizmeti silmek istediğinize emin misiniz?")) return;
    try {
      await deleteService(
        idToken!,
        selectedCompanyId!,
        selectedClinicId!,
        serviceToEdit._id
      );
      onSaved?.(serviceToEdit);
      onClose();
    } catch {
      setError("Silme işlemi başarısız.");
    }
  };

  return (
    <AppModal
      open={show}
      onClose={onClose}
      title={serviceToEdit ? "Hizmeti Düzenle" : "Yeni Hizmet"}
    >
      <ModalForm onSubmit={handleSubmit}>
        <div className="bg-white p-6 rounded-2xl shadow-lg max-w-md mx-auto space-y-6">
          {error && (
            <div className="flex items-center text-red-600 text-sm">
              <XCircleIcon className="h-5 w-5 mr-2" /> {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-1 space-y-1">
              <label
                htmlFor="service-name"
                className="text-sm font-medium text-gray-700"
              >
                Hizmet Adı
              </label>
              <input
                id="service-name"
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-main transition"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: Masaj Terapisi"
              />
            </div>

            <div className="col-span-1 space-y-1">
              <label
                htmlFor="service-price"
                className="text-sm font-medium text-gray-700"
              >
                Ücret (TL)
              </label>
              <input
                id="service-price"
                type="number"
                min="0"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-main transition"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-sm font-medium text-gray-700">
              Yaygın Süreler
            </span>
            <div className="flex gap-2 flex-wrap">
              {COMMON_DURATIONS.map((min) => (
                <button
                  key={min}
                  type="button"
                  onClick={() => setDuration(String(min))}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium transition
                    ${
                      duration === String(min)
                        ? "bg-brand-main text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }
                  `}
                >
                  {min} dk
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="service-duration"
              className="text-sm font-medium text-gray-700"
            >
              Süre (dk)
            </label>
            <input
              id="service-duration"
              type="number"
              min="1"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-main transition"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Örn: 30"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              İptal
            </button>
            {serviceToEdit && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Sil
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-2 bg-brand-main text-white rounded-lg hover:bg-brand-main-dark transition"
            >
              {serviceToEdit ? "Güncelle" : "Kaydet"}
            </button>
          </div>
        </div>
      </ModalForm>
    </AppModal>
  );
};

export default ServiceModal;
