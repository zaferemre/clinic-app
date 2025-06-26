// src/pages/Settings/ClinicSettings.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import { getClinicById, updateClinic, deleteClinic } from "../../api/clinicApi";
import { NavigationBar } from "../../components/NavigationBar/NavigationBar";
import type { Clinic } from "../../types/sharedTypes";
import GreetingHeader from "../GreetingHeader/GreetingHeader";

interface AddressFields {
  province: string;
  district: string;
  town: string;
  neighborhood: string;
}

interface ClinicFormFields {
  name: string;
  address: AddressFields;
  phoneNumber: string;
  websiteUrl?: string;
}

const DEFAULT_ADDRESS: AddressFields = {
  province: "",
  district: "",
  town: "",
  neighborhood: "",
};

const ClinicSettings: React.FC = () => {
  const { idToken, selectedCompanyId, selectedClinicId, user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ClinicFormFields>({
    name: "",
    address: DEFAULT_ADDRESS,
    phoneNumber: "",
    websiteUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load clinic data
  useEffect(() => {
    if (!idToken || !selectedCompanyId || !selectedClinicId) return;
    getClinicById(idToken, selectedCompanyId, selectedClinicId)
      .then((c: Clinic) => {
        setFormData({
          name: c.name,
          address: c.address ?? DEFAULT_ADDRESS,
          phoneNumber: c.phoneNumber ?? "",
          websiteUrl: c.websiteUrl ?? "",
        });
      })
      .catch((err) => {
        console.error("Yükleme hatası:", err);
        alert("Yükleme hatası: " + (err as Error).message);
      })
      .finally(() => setLoading(false));
  }, [idToken, selectedCompanyId, selectedClinicId]);

  // Save updates
  const handleSave = async () => {
    if (!idToken || !selectedCompanyId || !selectedClinicId) return;
    setSaving(true);
    try {
      await updateClinic(idToken, selectedCompanyId, selectedClinicId, {
        name: formData.name,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        websiteUrl: formData.websiteUrl,
      });
      alert("Klinik güncellendi.");
    } catch (err) {
      console.error("Güncelleme hatası:", err);
      alert("Güncelleme hatası: " + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // Delete clinic
  const handleDelete = async () => {
    if (
      !window.confirm(
        "Bu kliniği silmek istediğinize emin misiniz? Tüm veriler silinecek."
      )
    )
      return;
    try {
      await deleteClinic(idToken!, selectedCompanyId!, selectedClinicId!);
      navigate(`/clinics`, { replace: true });
    } catch (err) {
      console.error("Silme hatası:", err);
      alert("Silme hatası: " + (err as Error).message);
    }
  };

  if (loading) {
    return (
      <p className="flex-1 flex items-center justify-center text-brand-gray-500">
        Yükleniyor…
      </p>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg">
      <div className="p-4">
        <GreetingHeader
          userAvatarUrl={user?.photoUrl}
          clinicName={formData.name ?? ""}
          pageTitle="Klinik Ayarları"
          showBackButton
        />
      </div>
      <main className="flex-1 max-w-4xl mx-auto px-4 pb-24 space-y-6">
        <div className="bg-accent-bg p-6 rounded-lg shadow">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-brand-gray-700">
                Klinik Adı
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full border border-brand-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-brand-main"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-brand-gray-700">
                Telefon
              </label>
              <input
                type="text"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                className="w-full border border-brand-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-brand-main"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-brand-gray-700">
                Web Sitesi
              </label>
              <input
                type="text"
                value={formData.websiteUrl}
                onChange={(e) =>
                  setFormData({ ...formData, websiteUrl: e.target.value })
                }
                className="w-full border border-brand-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-brand-main"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <label className="block text-sm font-medium text-brand-gray-700">
                Adres (İl, İlçe)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="İl"
                  value={formData.address.province}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: {
                        ...formData.address,
                        province: e.target.value,
                      },
                    })
                  }
                  className="w-full border border-brand-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-brand-main"
                />
                <input
                  type="text"
                  placeholder="İlçe"
                  value={formData.address.district}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: {
                        ...formData.address,
                        district: e.target.value,
                      },
                    })
                  }
                  className="w-full border border-brand-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-brand-main"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto bg-brand-main hover:bg-brand-red text-white px-6 py-3 rounded-lg font-medium transition disabled:opacity-50"
        >
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>

        <div className="bg-accent-bg p-6 rounded-lg shadow flex items-center space-x-4">
          <TrashIcon className="w-6 h-6 text-red-600" />
          <div>
            <p className="font-semibold text-red-600">Kliniği Sil</p>
            <p className="text-sm text-brand-gray-600">
              Tüm klinik verileri geri alınamaz şekilde silinecek.
            </p>
          </div>
          <button
            onClick={handleDelete}
            className="ml-auto bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition"
          >
            Sil
          </button>
        </div>
      </main>

      <NavigationBar />
    </div>
  );
};

export default ClinicSettings;
