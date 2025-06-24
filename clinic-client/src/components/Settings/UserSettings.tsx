// src/components/UserSettings/UserSettings.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  deleteUser as apiDeleteUser,
  updateUserProfile,
} from "../../api/userApi";
import { leaveCompany } from "../../api/companyApi";
import { updateProfile } from "firebase/auth";
import { auth } from "../../firebase";
import {
  TrashIcon,
  ArrowLeftStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { NavigationBar } from "../../components/NavigationBar/NavigationBar";
import GreetingHeader from "../../components/GreetingHeader/GreetingHeader";
import AppModal from "../Modals/AppModal";
import doodles from "../../data/doodles.json";

// Color options for doodle backgrounds
const COLOR_OPTIONS = [
  "F28AB2",
  "FF6B6B",
  "FFD93D",
  "5D8AA8",
  "4ECDC4",
  "00B894",
  "6366F1",
  "E17055",
];

export const UserSettings: React.FC = () => {
  const {
    user,
    idToken,
    companies,
    selectedCompanyId,
    selectedClinicName,
    signOut,
  } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name ?? "");
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl ?? "");
  const [bgColor, setBgColor] = useState("F28AB2");
  const [saving, setSaving] = useState(false);
  const [loadingLeave, setLoadingLeave] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  // Build avatar list: include custom then doodles
  const avatars = useMemo(() => {
    const custom =
      user?.photoUrl && !doodles.includes(user.photoUrl) ? [user.photoUrl] : [];
    return [...custom, ...doodles];
  }, [user]);

  // Current company
  const currentCompany =
    companies.find((c) => c._id === selectedCompanyId) || null;
  const companyOwned =
    !!currentCompany && user?.uid === currentCompany.ownerUserId;

  // Update name/photo when user changes
  useEffect(() => {
    setName(user?.name ?? "");
    setPhotoUrl(user?.photoUrl ?? "");
    // extract bg color from current doodle URL
    if (photoUrl.includes("doodleipsum.com") && photoUrl.includes("bg=")) {
      const match = photoUrl.match(/bg=([0-9A-Fa-f]+)/);
      if (match) setBgColor(match[1]);
    }
  }, [user]);

  // Helper to apply bgColor to doodle URLs
  function withBg(url: string) {
    if (url.includes("doodleipsum.com")) {
      return url.replace(/bg=[^&]*/, `bg=${bgColor}`);
    }
    return url;
  }

  const handleSave = async () => {
    if (!auth.currentUser || !idToken) return;
    setSaving(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName: name,
        photoURL: photoUrl,
      });
      await updateUserProfile(idToken, { name, photoUrl });
      alert("Profil güncellendi.");
    } catch (e) {
      alert(
        e instanceof Error
          ? `Güncelleme hatası: ${e.message}`
          : "Güncelleme hatası: Bilinmeyen hata"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLeave = async () => {
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
      signOut();
      navigate("/login", { replace: true });
    } catch (e) {
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
      await apiDeleteUser(idToken!);
      signOut();
      navigate("/login", { replace: true });
    } catch (e) {
      alert(
        e instanceof Error
          ? `Silme hatası: ${e.message}`
          : "Silme hatası: Bilinmeyen hata"
      );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-gray-100 pb-16">
      <GreetingHeader
        userAvatarUrl={photoUrl}
        clinicName={selectedClinicName ?? ""}
        pageTitle="Hesap Ayarları"
        showBackButton
      />

      <main className="flex-1 max-w-4xl mx-auto p-6 space-y-6">
        {/* Avatar & Name Section */}
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <div className="flex items-center space-x-6">
            <img
              src={withBg(photoUrl)}
              alt={user?.name}
              className="w-24 h-24 rounded-full object-cover"
            />
            <button
              onClick={() => setShowImageModal(true)}
              className="px-4 py-2 bg-brand-main text-white rounded-lg text-sm hover:bg-brand-dark transition"
            >
              Resim Değiştir
            </button>
          </div>
          {/* Name field below */}
          <div>
            <label className="block text-sm font-medium text-brand-gray-700">
              Adınız
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-brand-gray-300 rounded focus:ring-2 focus:ring-brand-main"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-brand-main text-white py-3 rounded-lg font-semibold hover:bg-brand-red transition disabled:opacity-50"
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>

        {/* Image Selection Modal */}
        <AppModal
          open={showImageModal}
          onClose={() => setShowImageModal(false)}
          title="Profil Resmi Seç"
        >
          <div className="grid grid-cols-4 gap-4 p-4">
            {avatars.map((url, idx) => (
              <button
                key={idx}
                onClick={() => setPhotoUrl(withBg(url))}
                className="w-16 h-16 rounded-full overflow-hidden border-2 border-transparent hover:border-brand-main transition"
              >
                <img
                  src={withBg(url)}
                  alt="avatar option"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
          {/* Bg Color Picker */}
          <div className="flex items-center gap-2 p-4">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                onClick={() => setBgColor(c)}
                className={`w-8 h-8 rounded-full border-2 transition ${
                  bgColor === c
                    ? "border-brand-main scale-110"
                    : "border-gray-200"
                }`}
                style={{ backgroundColor: `#${c}` }}
              />
            ))}
          </div>
        </AppModal>

        {/* Leave Company */}
        {currentCompany && (
          <div className="bg-white p-6 rounded-lg shadow flex items-center space-x-4">
            <ArrowLeftStartOnRectangleIcon className="w-6 h-6 text-warn" />
            <div>
              <p className="font-semibold text-warn">Şirketten Ayrıl</p>
              <p className="text-sm text-gray-600">
                Üyeliğiniz silinecek. Sahibiyseniz önce şirketi silin.
              </p>
            </div>
            <button
              onClick={handleLeave}
              disabled={companyOwned || loadingLeave}
              className="ml-auto bg-warn hover:bg-brand-orange text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50"
            >
              {loadingLeave ? "Ayrılıyor..." : "Ayrıl"}
            </button>
          </div>
        )}

        {/* Delete Account */}
        <div className="bg-white p-6 rounded-lg shadow flex items-center space-x-4">
          <TrashIcon className="w-6 h-6 text-red-600" />
          <div>
            <p className="font-semibold text-red-600">Hesabı Sil</p>
            <p className="text-sm text-gray-600">
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
