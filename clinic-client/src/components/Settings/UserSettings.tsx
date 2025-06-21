// src/components/UserSettings/UserSettings.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { deleteUser, leaveCompany } from "../../api/companyApi";
import { updateProfile } from "firebase/auth";
import { auth } from "../../firebase";
import {
  UserIcon,
  TrashIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { NavigationBar } from "../../components/NavigationBar/NavigationBar";
import type { Company } from "../../types/sharedTypes";

export const UserSettings: React.FC = () => {
  const { user, idToken, companies, selectedCompanyId, signOut } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(user?.name ?? "");
  const [photoURL, setPhotoURL] = useState(user?.imageUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [loadingLeave, setLoadingLeave] = useState(false);

  const currentCompany: Company | null =
    companies.find((c) => c._id === selectedCompanyId) ?? null;
  const companyOwned = currentCompany?.ownerEmail === user?.email;

  useEffect(() => {
    setDisplayName(user?.name ?? "");
    setPhotoURL(user?.imageUrl ?? "");
  }, [user]);

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    try {
      await updateProfile(auth.currentUser, { displayName, photoURL });
      alert("Profil güncellendi.");
    } catch (e: unknown) {
      alert(
        e instanceof Error
          ? `Güncelleme hatası: ${e.message}`
          : "Güncelleme hatası: Bilinmeyen hata"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLeaveCompany = async () => {
    if (!currentCompany || companyOwned) {
      alert(
        companyOwned
          ? "Şirket sahibi olarak ayrılamazsınız. Önce şirketi silin."
          : "Hiçbir şirkete bağlı değilsiniz."
      );
      return;
    }
    if (!window.confirm("Şirketten ayrılmak istediğinize emin misiniz?"))
      return;
    setLoadingLeave(true);
    try {
      await leaveCompany(idToken!, currentCompany._id);
      await signOut();
      navigate("/login", { replace: true });
    } catch (e: unknown) {
      alert(
        e instanceof Error
          ? `Ayrılma hatası: ${e.message}`
          : "Ayrılma hatası: Bilinmeyen hata"
      );
    } finally {
      setLoadingLeave(false);
    }
  };

  const handleDelete = async () => {
    if (companyOwned) {
      alert("Önce şirketinizi silmelisiniz.");
      navigate("/settings/company");
      return;
    }
    if (!window.confirm("Hesabınızı silmek istediğinize emin misiniz?")) return;
    try {
      await deleteUser(idToken!);
      await signOut();
      navigate("/login", { replace: true });
    } catch (e: unknown) {
      alert(
        e instanceof Error
          ? `Silme hatası: ${e.message}`
          : "Silme hatası: Bilinmeyen hata"
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg">
      <header className="px-6 py-4 bg-accent-bg shadow-md">
        <div className="max-w-4xl mx-auto flex items-center">
          <UserIcon className="w-6 h-6 text-brand-main mr-2" />
          <h1 className="text-2xl font-semibold text-brand-black">
            Profil Ayarları
          </h1>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto p-6 space-y-6">
        {/* Profile Edit */}
        <div className="bg-accent-bg p-6 rounded-lg shadow">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brand-gray-700">
                Adınız
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 w-full border border-brand-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-brand-main"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-gray-700">
                Profil Fotoğrafı URL
              </label>
              <input
                type="text"
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                className="mt-1 w-full border border-brand-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-brand-main"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-brand-main hover:bg-brand-red text-white px-6 py-3 rounded-lg font-medium transition disabled:opacity-50"
            >
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </div>

        {/* Leave Company */}
        {currentCompany && (
          <div className="bg-accent-bg p-6 rounded-lg shadow flex items-center space-x-4">
            <ArrowLeftOnRectangleIcon className="w-6 h-6 text-warn" />
            <div>
              <p className="font-semibold text-warn">Şirketten Ayrıl</p>
              <p className="text-sm text-brand-gray-600">
                Üyeliğiniz silinecek. Sahipiyseniz önce şirketi silin.
              </p>
            </div>
            <button
              onClick={handleLeaveCompany}
              disabled={companyOwned || loadingLeave}
              className="ml-auto bg-warn hover:bg-brand-orange text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
            >
              {loadingLeave ? "Ayrılıyor..." : "Ayrıl"}
            </button>
          </div>
        )}

        {/* Delete Account */}
        <div className="bg-accent-bg p-6 rounded-lg shadow flex items-center space-x-4">
          <TrashIcon className="w-6 h-6 text-red-600" />
          <div>
            <p className="font-semibold text-red-600">Hesabı Sil</p>
            <p className="text-sm text-brand-gray-600">
              Tüm verileriniz kalıcı olarak silinecek.
            </p>
          </div>
          <button
            onClick={handleDelete}
            className="ml-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            Sil
          </button>
        </div>
      </main>

      <NavigationBar />
    </div>
  );
};

export default UserSettings;
