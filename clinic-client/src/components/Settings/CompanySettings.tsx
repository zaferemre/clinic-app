// src/pages/Settings/CompanySettings.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BuildingStorefrontIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import {
  getCompanyById,
  updateCompany,
  deleteCompany,
} from "../../api/companyApi";
import { RoleSettings } from "./RoleSettings";
import type { Company as ApiCompany } from "../../types/sharedTypes";

interface AddressFields {
  province: string;
  district: string;
  town: string;
  neighborhood: string;
}

interface CompanyFormFields {
  name: string;
  address: AddressFields;
  phoneNumber: string;
  websiteUrl: string;
  googleUrl: string;
}

export const CompanySettings: React.FC = () => {
  const { idToken, companyId } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<CompanyFormFields>({
    name: "",
    address: { province: "", district: "", town: "", neighborhood: "" },
    phoneNumber: "",
    websiteUrl: "",
    googleUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!idToken || !companyId) return;
    getCompanyById(idToken, companyId)
      .then((c: ApiCompany) => {
        setFormData({
          name: c.name,
          address: c.address ?? {
            province: "",
            district: "",
            town: "",
            neighborhood: "",
          },
          phoneNumber: c.phoneNumber ?? "",
          websiteUrl: c.websiteUrl ?? "",
          googleUrl: c.googleUrl ?? "",
        });
      })
      .catch((error: unknown) => {
        const msg = error instanceof Error ? error.message : String(error);
        alert("Yükleme hatası: " + msg);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [idToken, companyId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCompany(idToken!, companyId!, {
        name: formData.name,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        websiteUrl: formData.websiteUrl,
        googleUrl: formData.googleUrl,
      });
      alert("Şirket güncellendi.");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      alert("Hata: " + msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Şirketi silmek istediğinize emin misiniz?")) return;
    try {
      await deleteCompany(idToken!, companyId!);
      navigate("/", { replace: true });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      alert("Hata: " + msg);
    }
  };

  if (loading) {
    return <p className="p-6">Yükleniyor…</p>;
  }

  return (
    <div className="min-h-screen bg-brand-gray-100 flex flex-col">
      <header className="px-6 py-4 bg-white flex items-center shadow-sm border-b">
        <BuildingStorefrontIcon className="w-6 h-6 mr-2 text-brand-green-600" />
        <h1 className="text-xl font-semibold text-brand-black">
          Şirket Ayarları
        </h1>
      </header>

      <main className="flex-1 p-6 space-y-6">
        <div className="bg-white p-6 rounded-lg shadow grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="company-name"
              className="block text-sm font-medium text-gray-700"
            >
              Şirket Adı
            </label>
            <input
              id="company-name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="mt-1 w-full border px-3 py-2 rounded focus:ring-2 focus:ring-brand-green-300"
            />
          </div>

          {/* Address fields */}
          <div>
            <label
              htmlFor="address-province"
              className="block text-sm font-medium text-gray-700"
            >
              İl (Province)
            </label>
            <input
              id="address-province"
              type="text"
              value={formData.address.province}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address, province: e.target.value },
                })
              }
              className="mt-1 w-full border px-3 py-2 rounded focus:ring-2 focus:ring-brand-green-300"
            />

            <label
              htmlFor="address-district"
              className="block text-sm font-medium text-gray-700 mt-2"
            >
              İlçe (District)
            </label>
            <input
              id="address-district"
              type="text"
              value={formData.address.district}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address, district: e.target.value },
                })
              }
              className="mt-1 w-full border px-3 py-2 rounded focus:ring-2 focus:ring-brand-green-300"
            />

            <label
              htmlFor="address-town"
              className="block text-sm font-medium text-gray-700 mt-2"
            >
              Semt (Town)
            </label>
            <input
              id="address-town"
              type="text"
              value={formData.address.town}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address, town: e.target.value },
                })
              }
              className="mt-1 w-full border px-3 py-2 rounded focus:ring-2 focus:ring-brand-green-300"
            />

            <label
              htmlFor="address-neighborhood"
              className="block text-sm font-medium text-gray-700 mt-2"
            >
              Mahalle (Neighborhood)
            </label>
            <input
              id="address-neighborhood"
              type="text"
              value={formData.address.neighborhood}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: {
                    ...formData.address,
                    neighborhood: e.target.value,
                  },
                })
              }
              className="mt-1 w-full border px-3 py-2 rounded focus:ring-2 focus:ring-brand-green-300"
            />
          </div>

          <div>
            <label
              htmlFor="company-phone"
              className="block text-sm font-medium text-gray-700"
            >
              Telefon
            </label>
            <input
              id="company-phone"
              type="text"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
              className="mt-1 w-full border px-3 py-2 rounded focus:ring-2 focus:ring-brand-green-300"
            />
          </div>

          <div>
            <label
              htmlFor="company-website"
              className="block text-sm font-medium text-gray-700"
            >
              Web Sitesi
            </label>
            <input
              id="company-website"
              type="text"
              value={formData.websiteUrl}
              onChange={(e) =>
                setFormData({ ...formData, websiteUrl: e.target.value })
              }
              className="mt-1 w-full border px-3 py-2 rounded focus:ring-2 focus:ring-brand-green-300"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor="company-google"
              className="block text-sm font-medium text-gray-700"
            >
              Google URL
            </label>
            <input
              id="company-google"
              type="text"
              value={formData.googleUrl}
              onChange={(e) =>
                setFormData({ ...formData, googleUrl: e.target.value })
              }
              className="mt-1 w-full border px-3 py-2 rounded focus:ring-2 focus:ring-brand-green-300"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-brand-green-500 hover:bg-brand-green-600 text-white px-6 py-2 rounded disabled:opacity-50"
        >
          {saving ? "Kaydediliyor..." : "Kaydet"}
        </button>

        <RoleSettings />

        <div className="bg-white p-6 rounded-lg shadow flex items-center space-x-3">
          <TrashIcon className="w-6 h-6 text-red-600" />
          <div>
            <p className="font-semibold text-red-600">Şirketi Sil</p>
            <p className="text-sm text-gray-500">
              Bu işlem tüm verileri geri döndürülemez şekilde siler.
            </p>
          </div>
          <button
            onClick={handleDelete}
            className="ml-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Sil
          </button>
        </div>
      </main>
    </div>
  );
};

export default CompanySettings;
