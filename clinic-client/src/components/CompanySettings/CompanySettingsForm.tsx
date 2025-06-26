import React from "react";
import {
  HashtagIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import {
  AiOutlineWhatsApp,
  AiOutlineFacebook,
  AiOutlineInstagram,
} from "react-icons/ai";
import { FaMapMarkerAlt } from "react-icons/fa";

interface CompanySettingsFormValues {
  name: string;
  websiteUrl: string;
  instagram: string;
  facebook: string;
  whatsapp: string;
  allowPublicBooking: boolean;
  inactivityThreshold: number;
}

interface Props {
  form: CompanySettingsFormValues;
  saving: boolean;
  error: string | null;
  success: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckbox: (v: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const iconClasses =
  "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-main";

const CompanySettingsForm: React.FC<Props> = ({
  form,
  saving,
  error,
  success,
  onChange,
  onCheckbox,
  onSubmit,
}) => (
  <form onSubmit={onSubmit} className="space-y-7 max-w-xl mx-auto px-2">
    {/* Alerts */}
    {error && (
      <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-2">
        <XCircleIcon className="w-5 h-5" />
        <span>{error}</span>
      </div>
    )}
    {success && (
      <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-2">
        <CheckCircleIcon className="w-5 h-5" />
        <span>{success}</span>
      </div>
    )}

    {/* Section: Şirket Bilgileri */}
    <div>
      <h2 className="text-lg font-bold text-brand-main mb-3">
        Şirket Bilgileri
      </h2>
      <label htmlFor="company-name" className="block mb-1 font-medium text-sm">
        Şirket Adı
      </label>
      <div className="relative">
        <UserGroupIcon className={iconClasses} />
        <input
          id="company-name"
          name="name"
          value={form.name}
          onChange={onChange}
          className="w-full border border-brand-main/30 focus:border-brand-main focus:ring-1 focus:ring-brand-main/30 rounded-xl pl-10 pr-4 py-2 transition"
          required
          autoComplete="off"
          placeholder="Örn. Hayat Klinik"
        />
      </div>
    </div>

    {/* Section: Website */}
    <div>
      <label htmlFor="website-url" className="block mb-1 font-medium text-sm">
        Google Maps URL
      </label>
      <div className="relative">
        <FaMapMarkerAlt className={iconClasses} />
        <input
          id="website-url"
          name="websiteUrl"
          value={form.websiteUrl}
          onChange={onChange}
          className="w-full border border-brand-main/30 focus:border-brand-main focus:ring-1 focus:ring-brand-main/30 rounded-xl pl-10 pr-4 py-2 transition"
          type="url"
          placeholder="https://..."
        />
      </div>
    </div>

    {/* Section: Sosyal Medya */}
    <div>
      <span className="block font-medium text-sm mb-1">Sosyal Medya</span>
      <div className="bg-brand-gray-50 rounded-2xl px-4 py-4 space-y-3 shadow-sm border border-brand-main/10">
        {/* Instagram */}
        <div className="relative">
          <AiOutlineInstagram className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-500" />
          <input
            name="instagram"
            placeholder="Instagram profil linki"
            value={form.instagram}
            onChange={onChange}
            className="w-full border border-gray-200 focus:border-pink-400 focus:ring-1 focus:ring-pink-200 rounded-xl pl-10 pr-4 py-2 transition"
          />
        </div>
        {/* Facebook */}
        <div className="relative">
          <AiOutlineFacebook className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-700" />
          <input
            name="facebook"
            placeholder="Facebook profil linki"
            value={form.facebook}
            onChange={onChange}
            className="w-full border border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-200 rounded-xl pl-10 pr-4 py-2 transition"
          />
        </div>
        {/* WhatsApp */}
        <div className="relative">
          <AiOutlineWhatsApp className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
          <input
            name="whatsapp"
            placeholder="WhatsApp numarası veya linki"
            value={form.whatsapp}
            onChange={onChange}
            className="w-full border border-gray-200 focus:border-green-400 focus:ring-1 focus:ring-green-200 rounded-xl pl-10 pr-4 py-2 transition"
          />
        </div>
      </div>
    </div>

    {/* Section: Booking Settings */}
    <div className="space-y-3 pt-2">
      <div className="flex items-center gap-3">
        <label
          htmlFor="allowPublicBooking"
          className="font-medium text-gray-700 flex-1 cursor-pointer"
        >
          Herkese açık rezervasyon
        </label>
        <input
          id="allowPublicBooking"
          type="checkbox"
          checked={form.allowPublicBooking}
          onChange={(e) => onCheckbox(e.target.checked)}
          className="h-5 w-5 accent-brand-main rounded transition"
        />
      </div>
      <span className="block text-xs text-gray-500 pl-1">
        Kullanıcılar, randevu almak için üye olmak veya sizi aramak zorunda
        kalmaz.
      </span>
    </div>

    {/* Section: Inactivity */}
    <div>
      <label
        htmlFor="inactivity-threshold"
        className="block mb-1 text-sm font-medium"
      >
        Pasif Hasta Eşik (gün)
      </label>
      <span className="block text-xs text-gray-500 mb-2">
        <span className="font-semibold text-brand-main">Pasif hasta</span>, uzun
        süre randevu almamış hastaları otomatik olarak belirler.
      </span>
      <div className="relative w-36">
        <HashtagIcon className={iconClasses} />
        <input
          id="inactivity-threshold"
          name="inactivityThreshold"
          type="number"
          min={1}
          value={form.inactivityThreshold}
          onChange={onChange}
          className="w-full border border-gray-200 focus:border-brand-main focus:ring-1 focus:ring-brand-main/30 rounded-xl pl-10 pr-2 py-2 transition"
        />
      </div>
    </div>

    {/* Save Button */}
    <div className="pt-4 flex justify-end">
      <button
        type="submit"
        disabled={saving}
        className="flex items-center gap-2 px-7 py-3 bg-brand-main text-white font-bold rounded-2xl shadow hover:bg-brand-dark transition text-base disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {saving ? (
          <>
            <svg
              className="animate-spin w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-20"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-80"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Kaydediliyor...
          </>
        ) : (
          <>Kaydet</>
        )}
      </button>
    </div>
  </form>
);

export default CompanySettingsForm;
