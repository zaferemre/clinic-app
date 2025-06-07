// src/components/UserOnboarding/CreateCompanyForm.tsx
import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { createCompany } from "../../api/companyApi";

import LocationPicker from "../LocationPicker";

type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";
type WorkingHour = { day: DayOfWeek; open: string; close: string };

const DEFAULT_WORKING_HOURS: WorkingHour[] = [
  { day: "Monday", open: "09:00", close: "17:00" },
  { day: "Tuesday", open: "09:00", close: "17:00" },
  { day: "Wednesday", open: "09:00", close: "17:00" },
  { day: "Thursday", open: "09:00", close: "17:00" },
  { day: "Friday", open: "09:00", close: "17:00" },
];

export default function CreateCompanyForm({
  onCreated,
}: {
  onCreated: (id: string, name: string) => void;
}) {
  const { idToken } = useAuth();
  const [name, setName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [googleUrl, setGoogleUrl] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [workingHours, setWorkingHours] = useState(DEFAULT_WORKING_HOURS);
  const [services, setServices] = useState([
    { serviceName: "", servicePrice: 0, serviceKapora: 0, serviceDuration: 30 },
  ]);
  const [message, setMessage] = useState<string>("");

  // For demo, ignore employees on creation

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!name.trim() || !companyType.trim()) {
      setMessage("Şirket adı ve türü zorunludur.");
      return;
    }
    if (!idToken) {
      setMessage("Önce giriş yapmalısınız.");
      return;
    }
    if (!isOnline && !location) {
      setMessage("Lütfen çevrimiçi ya da bir konum seçin.");
      return;
    }

    // Build location object per schema
    let locationField: any = null;
    if (isOnline) {
      locationField = { type: "Online" };
    } else if (location) {
      locationField = {
        type: "Point",
        coordinates: [location.lng, location.lat],
      };
    }

    try {
      const newCompany = await createCompany(idToken, {
        name: name.trim(),
        ownerName: ownerName.trim(),
        companyType: companyType.trim(),
        address: address.trim(),
        phoneNumber: phoneNumber.trim(),
        websiteUrl: websiteUrl.trim(),
        googleUrl: googleUrl.trim(),
        location: locationField,
        workingHours,
        services: services.filter((s) => s.serviceName), // Only valid ones
        employees: [],
      });
      onCreated(newCompany._id, newCompany.name);
    } catch (err: unknown) {
      setMessage(
        "Hata: " + (err instanceof Error ? err.message : "Bilinmeyen")
      );
    }
  };

  // Minimal UI for mobile, with toggle for online/location and services add
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-white rounded-lg shadow fixed inset-x-0 bottom-0 z-50 max-h-[95vh] overflow-y-auto"
      style={{ maxWidth: 500, margin: "0 auto" }}
    >
      <h2 className="text-lg font-semibold text-center">Yeni Şirket Oluştur</h2>
      <div>
        <label className="block text-sm mb-1">Şirket Kurucu Adı*</label>
        <input
          value={name}
          onChange={(e) => setOwnerName(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div></div>
      <div>
        <label className="block text-sm mb-1">Şirket Adı*</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Şirket Türü*</label>
        <input
          value={companyType}
          onChange={(e) => setCompanyType(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Telefon</label>
        <input
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Adres</label>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Web Sitesi</label>
        <input
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Google Maps Linki</label>
        <input
          value={googleUrl}
          onChange={(e) => setGoogleUrl(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="flex items-center gap-2 mt-3">
        <input
          type="checkbox"
          checked={isOnline}
          id="online-checkbox"
          onChange={() => {
            setIsOnline((v) => !v);
            if (!isOnline) setLocation(null);
          }}
        />
        <label htmlFor="online-checkbox" className="text-sm">
          Çevrimiçi (Online Hizmet)
        </label>
      </div>

      {!isOnline && (
        <div>
          <LocationPicker value={location} onChange={setLocation} />
        </div>
      )}

      {/* Working Hours (basic) */}
      <div>
        <label className="block text-sm mb-1">Çalışma Saatleri</label>
        {workingHours.map((wh, idx) => (
          <div key={wh.day} className="flex gap-2 items-center text-xs mb-1">
            <span className="w-20">{wh.day}</span>
            <input
              type="time"
              value={wh.open}
              onChange={(e) =>
                setWorkingHours((arr) =>
                  arr.map((w, i) =>
                    i === idx ? { ...w, open: e.target.value } : w
                  )
                )
              }
              className="border p-1 rounded"
              style={{ width: 70 }}
            />
            <input
              type="time"
              value={wh.close}
              onChange={(e) =>
                setWorkingHours((arr) =>
                  arr.map((w, i) =>
                    i === idx ? { ...w, close: e.target.value } : w
                  )
                )
              }
              className="border p-1 rounded"
              style={{ width: 70 }}
            />
          </div>
        ))}
      </div>

      {/* Services */}
      <div>
        <label className="block text-sm mb-1">Hizmetler</label>
        {services.map((s, i) => (
          <div key={i} className="flex gap-2 mb-1">
            <input
              type="text"
              placeholder="Hizmet Adı"
              value={s.serviceName}
              onChange={(e) =>
                setServices((arr) =>
                  arr.map((v, idx) =>
                    idx === i ? { ...v, serviceName: e.target.value } : v
                  )
                )
              }
              className="w-1/3 border p-1 rounded"
            />
            <input
              type="number"
              placeholder="Fiyat"
              value={s.servicePrice}
              onChange={(e) =>
                setServices((arr) =>
                  arr.map((v, idx) =>
                    idx === i
                      ? { ...v, servicePrice: Number(e.target.value) }
                      : v
                  )
                )
              }
              className="w-1/4 border p-1 rounded"
              min={0}
            />
            <input
              type="number"
              placeholder="Kapora"
              value={s.serviceKapora}
              onChange={(e) =>
                setServices((arr) =>
                  arr.map((v, idx) =>
                    idx === i
                      ? { ...v, serviceKapora: Number(e.target.value) }
                      : v
                  )
                )
              }
              className="w-1/4 border p-1 rounded"
              min={0}
            />
            <input
              type="number"
              placeholder="Süre (dk)"
              value={s.serviceDuration}
              onChange={(e) =>
                setServices((arr) =>
                  arr.map((v, idx) =>
                    idx === i
                      ? { ...v, serviceDuration: Number(e.target.value) }
                      : v
                  )
                )
              }
              className="w-1/4 border p-1 rounded"
              min={1}
            />
            <button
              type="button"
              onClick={() =>
                setServices((arr) => arr.filter((_, idx) => idx !== i))
              }
              className="text-red-500"
              disabled={services.length === 1}
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setServices((arr) => [
              ...arr,
              {
                serviceName: "",
                servicePrice: 0,
                serviceKapora: 0,
                serviceDuration: 30,
              },
            ])
          }
          className="mt-2 w-full bg-green-100 text-green-800 rounded p-1 text-xs"
        >
          + Hizmet Ekle
        </button>
      </div>

      {message && (
        <div className="text-red-600 text-sm p-1 bg-red-50 rounded">
          {message}
        </div>
      )}

      <button
        type="submit"
        className="w-full py-2 bg-brand-green-300 hover:bg-brand-green-400 text-white font-semibold rounded-full"
        disabled={!name || !companyType || (!isOnline && !location)}
      >
        Oluştur
      </button>
    </form>
  );
}
