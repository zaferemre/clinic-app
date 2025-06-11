import React, { useState, useEffect } from "react";
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
  const { idToken, user } = useAuth();
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

  useEffect(() => {
    if (user?.name) setOwnerName(user.name);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!name.trim() || !companyType.trim())
      return setMessage("Şirket adı ve türü zorunludur.");
    if (!idToken) return setMessage("Önce giriş yapmalısınız.");
    if (!isOnline && !location)
      return setMessage("Lütfen çevrimiçi ya da bir konum seçin.");

    // Only include location when creating a physical company
    const locationPayload:
      | { type: "Point"; coordinates: [number, number] }
      | undefined =
      !isOnline && location
        ? { type: "Point", coordinates: [location.lng, location.lat] }
        : undefined;

    try {
      const payload = {
        name: name.trim(),
        companyType: companyType.trim(),
        address: address.trim(),
        phoneNumber: phoneNumber.trim(),
        websiteUrl: websiteUrl.trim(),
        googleUrl: googleUrl.trim(),
        ...(locationPayload && { location: locationPayload }),
        workingHours,
        services: services.filter((s) => s.serviceName),
        employees: [],
      };

      const newCompany = await createCompany(idToken, payload);
      onCreated(newCompany._id, newCompany.name);
    } catch (err: unknown) {
      setMessage(
        "Hata: " + (err instanceof Error ? err.message : "Bilinmeyen")
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto mt-8 mb-20 border border-gray-200"
    >
      <h2 className="text-2xl font-semibold text-center text-brand-black">
        Yeni Şirket Oluştur
      </h2>

      {/* Owner & Basic Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Kurucu Adı*</label>
          <input
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            className="mt-1 w-full border px-3 py-2 rounded focus:ring-brand-green-300"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Şirket Adı*</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full border px-3 py-2 rounded focus:ring-brand-green-300"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Tür*</label>
          <input
            value={companyType}
            onChange={(e) => setCompanyType(e.target.value)}
            className="mt-1 w-full border px-3 py-2 rounded focus:ring-brand-green-300"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Telefon</label>
          <input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="mt-1 w-full border px-3 py-2 rounded focus:ring-brand-green-300"
          />
        </div>
      </div>

      {/* Address */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Adres</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="mt-1 w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Web Sitesi</label>
          <input
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            className="mt-1 w-full border px-3 py-2 rounded"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium">Google Maps Linki</label>
          <input
            value={googleUrl}
            onChange={(e) => setGoogleUrl(e.target.value)}
            className="mt-1 w-full border px-3 py-2 rounded"
          />
        </div>
      </div>

      {/* Online / Location Picker */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          checked={isOnline}
          onChange={() => {
            setIsOnline((v) => !v);
            if (!isOnline) setLocation(null);
          }}
        />
        <span className="text-sm">Çevrimiçi (Online Hizmet)</span>
      </div>
      {!isOnline && (
        <div className="h-60">
          <LocationPicker value={location} onChange={setLocation} />
        </div>
      )}

      {/* Working Hours */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Çalışma Saatleri
        </label>
        {workingHours.map((wh, idx) => (
          <div key={wh.day} className="flex items-center gap-3 mb-1 text-sm">
            <span className="w-24">{wh.day}</span>
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
              className="border rounded px-2 py-1"
            />
            <span>–</span>
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
              className="border rounded px-2 py-1"
            />
          </div>
        ))}
      </div>

      {/* Services */}
      <div>
        <label className="block text-sm font-medium mb-2">Hizmetler</label>
        {services.map((s, i) => (
          <div key={i} className="grid grid-cols-5 gap-2 mb-2">
            <input
              placeholder="Adı"
              value={s.serviceName}
              onChange={(e) =>
                setServices((arr) =>
                  arr.map((v, idx) =>
                    idx === i ? { ...v, serviceName: e.target.value } : v
                  )
                )
              }
              className="col-span-2 border px-2 py-1 rounded"
            />
            <input
              type="number"
              placeholder="Fiyat"
              value={s.servicePrice}
              min={0}
              onChange={(e) =>
                setServices((arr) =>
                  arr.map((v, idx) =>
                    idx === i
                      ? { ...v, servicePrice: Number(e.target.value) }
                      : v
                  )
                )
              }
              className="border px-2 py-1 rounded"
            />
            <input
              type="number"
              placeholder="Kapora"
              value={s.serviceKapora}
              min={0}
              onChange={(e) =>
                setServices((arr) =>
                  arr.map((v, idx) =>
                    idx === i
                      ? { ...v, serviceKapora: Number(e.target.value) }
                      : v
                  )
                )
              }
              className="border px-2 py-1 rounded"
            />
            <input
              type="number"
              placeholder="Süre"
              value={s.serviceDuration}
              min={1}
              onChange={(e) =>
                setServices((arr) =>
                  arr.map((v, idx) =>
                    idx === i
                      ? { ...v, serviceDuration: Number(e.target.value) }
                      : v
                  )
                )
              }
              className="border px-2 py-1 rounded"
            />
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
          className="text-sm text-green-700 hover:underline mt-1"
        >
          + Hizmet Ekle
        </button>
      </div>

      {/* Error */}
      {message && (
        <p className="text-sm text-red-600 bg-red-100 p-2 rounded">{message}</p>
      )}

      {/* Submit */}
      <button
        type="submit"
        className="w-full py-2 bg-brand-green-600 hover:bg-brand-green-700 text-white font-bold rounded"
        disabled={!name || !companyType || (!isOnline && !location)}
      >
        Oluştur
      </button>
    </form>
  );
}
