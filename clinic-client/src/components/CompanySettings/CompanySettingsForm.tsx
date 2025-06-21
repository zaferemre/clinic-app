import React from "react";
import {
  AiOutlineGlobal,
  AiFillInstagram,
  AiFillFacebook,
  AiOutlineWhatsApp,
} from "react-icons/ai";

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

const CompanySettingsForm: React.FC<Props> = ({
  form,
  saving,
  error,
  success,
  onChange,
  onCheckbox,
  onSubmit,
}) => (
  <form onSubmit={onSubmit} className="space-y-5">
    {error && (
      <div className="text-red-600 bg-red-100 p-2 rounded mb-2">{error}</div>
    )}
    {success && (
      <div className="text-green-700 bg-green-100 p-2 rounded mb-2">
        {success}
      </div>
    )}
    {/* Company Name */}
    <div>
      <label htmlFor="company-name" className="block mb-1 font-medium">
        Şirket Adı
      </label>
      <div className="relative">
        <input
          id="company-name"
          name="name"
          value={form.name}
          onChange={onChange}
          className="w-full border rounded px-9 py-2"
          required
        />
      </div>
    </div>
    {/* Website */}
    <div>
      <label htmlFor="website-url" className="block mb-1 font-medium">
        Web Sitesi
      </label>
      <div className="relative">
        <AiOutlineGlobal className="absolute left-3 top-3 text-blue-400 text-xl" />
        <input
          id="website-url"
          name="websiteUrl"
          value={form.websiteUrl}
          onChange={onChange}
          className="w-full border rounded px-9 py-2"
          type="url"
          placeholder="https://..."
        />
      </div>
    </div>
    {/* Social Media */}
    <fieldset className="space-y-2">
      <legend className="font-medium text-gray-700 mb-1">
        Sosyal Medya Bağlantıları
      </legend>
      <div className="relative">
        <AiFillInstagram className="absolute left-3 top-3 text-pink-500 text-xl" />
        <input
          name="instagram"
          placeholder="Instagram URL"
          value={form.instagram}
          onChange={onChange}
          className="w-full border rounded px-9 py-2"
        />
      </div>
      <div className="relative">
        <AiFillFacebook className="absolute left-3 top-3 text-blue-600 text-xl" />
        <input
          name="facebook"
          placeholder="Facebook URL"
          value={form.facebook}
          onChange={onChange}
          className="w-full border rounded px-9 py-2"
        />
      </div>
      <div className="relative">
        <AiOutlineWhatsApp className="absolute left-3 top-3 text-green-500 text-xl" />
        <input
          name="whatsapp"
          placeholder="WhatsApp Link / Numara"
          value={form.whatsapp}
          onChange={onChange}
          className="w-full border rounded px-9 py-2"
        />
      </div>
    </fieldset>
    {/* Public Booking */}
    <div className="flex items-center gap-4 mt-3">
      <label className="font-medium text-gray-700" htmlFor="allowPublicBooking">
        Herkese açık rezervasyona izin ver
      </label>
      <input
        id="allowPublicBooking"
        type="checkbox"
        checked={form.allowPublicBooking}
        onChange={(e) => onCheckbox(e.target.checked)}
        className="h-5 w-5"
      />
      <span className="text-xs text-gray-500">
        Kullanıcılar, randevu almak için sizi aramak veya üye olmak zorunda
        kalmaz.
      </span>
    </div>
    {/* Inactivity Threshold */}
    <div>
      <label htmlFor="inactivity-threshold" className="block mb-1">
        Pasif Hasta Eşik (gün)
      </label>
      <span className="block text-xs text-gray-500 mb-2">
        <span className="font-semibold text-brand-main">Pasif hasta</span> ,
        uzun süre randevu almamış olan hastaları otomatik olarak belirler.
      </span>
      <input
        id="inactivity-threshold"
        name="inactivityThreshold"
        type="number"
        min={1}
        value={form.inactivityThreshold}
        onChange={onChange}
        className="w-32 border rounded px-2 py-1"
      />
    </div>
    {/* Save Button */}
    <div className="pt-2 flex justify-end">
      <button
        type="submit"
        disabled={saving}
        className="px-6 py-2 bg-brand-main text-white font-semibold rounded-lg shadow hover:bg-brand-dark transition"
      >
        {saving ? "Kaydediliyor..." : "Kaydet"}
      </button>
    </div>
  </form>
);

export default CompanySettingsForm;
