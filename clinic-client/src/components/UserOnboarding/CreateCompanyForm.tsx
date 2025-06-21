// src/components/Forms/CreateCompanyForm.tsx
import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { createCompany, CreateCompanyPayload } from "../../api/companyApi";
import ToggleSwitch from "../../components/ToggleSwitch";

interface Props {
  readonly onCreated: (companyId: string) => void;
  readonly onCancel: () => void;
}

export default function CreateCompanyForm({ onCreated, onCancel }: Props) {
  const { idToken } = useAuth();
  const [name, setName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [allowPublicBooking, setAllowPublicBooking] = useState(false);
  const [inactivityThreshold, setInactivityThreshold] = useState(90);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Şirket adı zorunlu.");
      return;
    }
    if (!idToken) {
      setError("Giriş yapmanız gerekiyor.");
      return;
    }
    setLoading(true);
    setError(null);

    const payload: CreateCompanyPayload = {
      name,
      websiteUrl: websiteUrl || undefined,
      socialLinks:
        instagram || facebook || whatsapp
          ? { instagram, facebook, whatsapp }
          : undefined,
      settings: {
        allowPublicBooking,
        inactivityThresholdDays: inactivityThreshold,
      },
    };

    try {
      const created = await createCompany(idToken, payload);
      onCreated(created._id);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Oluşturma başarısız oldu.");
      } else {
        setError("Oluşturma başarısız oldu.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 p-8 max-w-lg mx-auto bg-white rounded-2xl shadow-lg"
    >
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-brand-main">👋 Hoşgeldiniz!</h2>
        <p className="text-gray-700 mt-2">
          İlk şirketinizi oluşturmadan önce, sadece gerekli bilgileri soracağız.
          Diğer tüm ayarları ve detayları{" "}
          <span className="font-semibold text-brand-main">
            daha sonra şirket ayarlarından
          </span>{" "}
          değiştirebilirsiniz.
        </p>
      </div>

      {error && (
        <div className="text-red-700 bg-red-100 border border-red-200 p-2 rounded mb-2">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="companyName" className="block mb-1 font-medium">
          Şirket Adı <span className="text-red-600">*</span>
        </label>
        <input
          id="companyName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
          placeholder="Örn: Acıbadem Tıp Merkezi"
        />
      </div>

      {/* Optional Fields */}
      <div className="mt-8 border-t pt-6">
        <div className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <span className="text-lg">Opsiyonel Bilgiler</span>
          <span className="text-xs text-gray-400">
            (İstediğiniz zaman doldurabilirsiniz)
          </span>
        </div>

        <div>
          <label className="block mb-1">
            Web Sitesi{" "}
            <span className="text-gray-400 text-xs">(opsiyonel)</span>
          </label>
          <input
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="https://..."
          />
        </div>

        <fieldset className="mt-2 space-y-2">
          <legend className="font-medium text-gray-600 mb-1">
            Sosyal Medya Bağlantıları{" "}
            <span className="text-gray-400 text-xs">(opsiyonel)</span>
          </legend>
          <input
            placeholder="Instagram URL"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          <input
            placeholder="Facebook URL"
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          <input
            placeholder="WhatsApp Link / Numara"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </fieldset>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-4">
          <label
            htmlFor="publicBooking"
            className="font-medium text-gray-700 flex-shrink-0"
          >
            Herkese açık rezervasyona izin ver
          </label>
          <div className="flex items-center gap-3">
            <ToggleSwitch
              id="publicBooking"
              checked={allowPublicBooking}
              onChange={setAllowPublicBooking}
            />
            <div className="text-xs text-gray-500 leading-snug max-w-xs">
              Kullanıcılar, randevu almak için sizi aramak veya üye olmak
              zorunda kalmaz.
            </div>
          </div>
        </div>

        <div className="mt-3">
          <label className="block mb-1">
            Pasif Hasta Eşik (gün){" "}
            <span className="block text-xs text-gray-500">
              Uzun süre randevu almayan hastaları otomatik belirler.
            </span>
          </label>
          <input
            type="number"
            min={1}
            value={inactivityThreshold}
            onChange={(e) => setInactivityThreshold(+e.target.value)}
            className="w-32 border rounded px-2 py-1"
          />
        </div>
      </div>

      <div className="flex flex-col items-end space-y-2 pt-4">
        <div className="text-xs text-gray-500 pb-2">
          <span className="font-medium text-brand-main">İpucu:</span>{" "}
          Ayarlarınızı{" "}
          <span className="font-semibold">Şirket Ayarları'ndan</span>{" "}
          güncelleyebilirsiniz.
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Vazgeç
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-brand-main text-white rounded hover:bg-brand-dark transition font-semibold"
          >
            {loading ? "Oluşturuluyor…" : "Şirketi Oluştur"}
          </button>
        </div>
      </div>
    </form>
  );
}
