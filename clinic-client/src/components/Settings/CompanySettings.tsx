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

export const CompanySettings: React.FC = () => {
  const { idToken, companyId } = useAuth();
  const navigate = useNavigate();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!companyId) return;
    getCompanyById(idToken!, companyId).then((c) => {
      setCompany(c);
      setLoading(false);
    });
  }, [idToken, companyId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCompany(idToken!, {
        name: company.name,
        address: company.address,
        phoneNumber: company.phoneNumber,
        websiteUrl: company.websiteUrl,
        googleUrl: company.googleUrl,
      });
      alert("Şirket güncellendi.");
    } catch (e: any) {
      alert("Hata: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Şirketi silmek istediğinize emin misiniz?")) return;
    try {
      await deleteCompany(idToken!, companyId!);
      navigate("/", { replace: true });
    } catch (e: any) {
      alert("Hata: " + e.message);
    }
  };

  if (loading) return <p className="p-6">Yükleniyor…</p>;

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
            <label className="block text-sm font-medium text-gray-700">
              Şirket Adı
            </label>
            <input
              type="text"
              value={company.name}
              onChange={(e) => setCompany({ ...company, name: e.target.value })}
              className="mt-1 w-full border px-3 py-2 rounded focus:ring-2 focus:ring-brand-green-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Adres
            </label>
            <input
              type="text"
              value={company.address || ""}
              onChange={(e) =>
                setCompany({ ...company, address: e.target.value })
              }
              className="mt-1 w-full border px-3 py-2 rounded focus:ring-2 focus:ring-brand-green-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Telefon
            </label>
            <input
              type="text"
              value={company.phoneNumber || ""}
              onChange={(e) =>
                setCompany({ ...company, phoneNumber: e.target.value })
              }
              className="mt-1 w-full border px-3 py-2 rounded focus:ring-2 focus:ring-brand-green-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Web Sitesi
            </label>
            <input
              type="text"
              value={company.websiteUrl || ""}
              onChange={(e) =>
                setCompany({ ...company, websiteUrl: e.target.value })
              }
              className="mt-1 w-full border px-3 py-2 rounded focus:ring-2 focus:ring-brand-green-300"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Google URL
            </label>
            <input
              type="text"
              value={company.googleUrl || ""}
              onChange={(e) =>
                setCompany({ ...company, googleUrl: e.target.value })
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
