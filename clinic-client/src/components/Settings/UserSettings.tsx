// src/pages/Settings/UserSettings.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getCompanyByEmail, deleteUser } from "../../api/companyApi";
import { updateProfile } from "firebase/auth";
import { auth } from "../../firebase";
import { UserIcon, TrashIcon } from "@heroicons/react/24/outline";

export const UserSettings: React.FC = () => {
  const { user, idToken, signOut } = useAuth();
  const [displayName, setDisplayName] = useState(user?.name || "");
  const [photoURL, setPhotoURL] = useState(user?.imageUrl || "");
  const [saving, setSaving] = useState(false);
  const [companyOwned, setCompanyOwned] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    // check if this user owns a company
    async function check() {
      try {
        await getCompanyByEmail(idToken!);
        setCompanyOwned(true);
      } catch {
        setCompanyOwned(false);
      }
    }
    check();
  }, [idToken]);

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName,
        photoURL,
      });
      alert("Profil güncellendi.");
    } catch (e: any) {
      alert("Güncelleme hatası: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (companyOwned) {
      alert("Önce şirketinizi silin.");
      navigate("/settings/company");
      return;
    }
    if (!window.confirm("Hesabınızı silmek istediğinize emin misiniz?")) return;
    try {
      await deleteUser(idToken!);
      signOut();
      navigate("/login", { replace: true });
    } catch (e: any) {
      alert("Silme hatası: " + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-brand-gray-100 flex flex-col">
      <header className="px-6 py-4 bg-white flex items-center shadow-sm border-b">
        <UserIcon className="w-6 h-6 mr-2 text-brand-green-600" />
        <h1 className="text-xl font-semibold text-brand-black">
          Profil Ayarları
        </h1>
      </header>

      <main className="flex-1 p-6 space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <label className="block text-sm font-medium text-gray-700">
            Adınız
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-brand-green-300"
          />

          <label className="block text-sm font-medium text-gray-700 mt-4">
            Profil Fotoğrafı URL
          </label>
          <input
            type="text"
            value={photoURL}
            onChange={(e) => setPhotoURL(e.target.value)}
            className="mt-1 w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-brand-green-300"
          />

          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-6 bg-brand-green-500 hover:bg-brand-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow flex items-center space-x-3">
          <TrashIcon className="w-6 h-6 text-red-600" />
          <div>
            <p className="font-semibold text-red-600">Hesabı Sil</p>
            <p className="text-sm text-gray-500">
              Hesabınızı silerseniz tüm verileriniz kalıcı olarak silinir.
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

export default UserSettings;
