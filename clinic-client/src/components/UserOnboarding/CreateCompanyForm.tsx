// src/components/CreateCompanyForm.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { createCompany } from "../../api/companyApi";
import turkeyGeo from "../../data/turkey-geo.json";
import CountryCodes from "../../data/CountryCodes.json";
import LocationPicker from "../LocationPicker";

// Flag emoji util
function countryCodeToFlag(code: string) {
  if (!code) return "🏳️";
  return code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

interface WorkingHour {
  day: DayOfWeek;
  open: string;
  close: string;
}
const DEFAULT_WORKING_HOURS: WorkingHour[] = [
  { day: "Monday", open: "09:00", close: "17:00" },
  { day: "Tuesday", open: "09:00", close: "17:00" },
  { day: "Wednesday", open: "09:00", close: "17:00" },
  { day: "Thursday", open: "09:00", close: "17:00" },
  { day: "Friday", open: "09:00", close: "17:00" },
];

interface Service {
  serviceName: string;
  servicePrice: string;
  serviceDuration: string;
}
type LatLng = { lat: number; lng: number };

// PhoneInput (no changes)
type PhoneInputProps = {
  phone: string;
  setPhone: React.Dispatch<React.SetStateAction<string>>;
  phoneCode: { code: string; dial_code: string; name: string };
  setPhoneCode: React.Dispatch<
    React.SetStateAction<{ code: string; dial_code: string; name: string }>
  >;
};

function PhoneInput({
  phone,
  setPhone,
  phoneCode,
  setPhoneCode,
}: PhoneInputProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  // Click outside closes dropdown
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (
        open &&
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    window.addEventListener("mousedown", handle);
    return () => window.removeEventListener("mousedown", handle);
  }, [open]);

  const topCountries = ["TR", "US", "DE", "GB", "FR"];
  const topList = CountryCodes.filter((c) => topCountries.includes(c.code));
  const restList = CountryCodes.filter((c) => !topCountries.includes(c.code));

  return (
    <div className="flex gap-2 items-center relative" ref={wrapperRef}>
      <button
        type="button"
        className="flex items-center gap-1 border rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-white min-w-[80px]"
        onClick={() => setOpen((v) => !v)}
        aria-label="Ülke kodu seç"
      >
        <span>{countryCodeToFlag(phoneCode.code || "TR")}</span>
        <span className="ml-1">{phoneCode.dial_code}</span>
        <svg width="16" height="16" className="ml-1" fill="none">
          <path d="M4 6l4 4 4-4" stroke="#333" strokeWidth="2" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-12 left-0 bg-white border z-50 rounded-lg w-64 max-h-60 overflow-auto shadow">
          {topList.map((c) => (
            <div
              key={c.code}
              className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 cursor-pointer"
              onMouseDown={() => {
                setPhoneCode(c);
                setOpen(false);
              }}
            >
              <span>{countryCodeToFlag(c.code)}</span>
              <span>{c.name}</span>
              <span className="ml-auto">{c.dial_code}</span>
            </div>
          ))}
          <hr />
          {restList.map((c) => (
            <div
              key={c.code}
              className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 cursor-pointer"
              onMouseDown={() => {
                setPhoneCode(c);
                setOpen(false);
              }}
            >
              <span>{countryCodeToFlag(c.code)}</span>
              <span>{c.name}</span>
              <span className="ml-auto">{c.dial_code}</span>
            </div>
          ))}
        </div>
      )}
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
        placeholder="Telefon Numarası*"
        className="border rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 flex-1"
        maxLength={15}
      />
    </div>
  );
}

// Main Form
export default function CreateCompanyForm({
  onCreated,
  onClose,
}: {
  onCreated: (id: string, name: string) => void;
  onClose: () => void;
}) {
  const { idToken, user } = useAuth();
  const IST_CENTER: LatLng = { lat: 41.0082, lng: 28.9784 };

  const [ownerName, setOwnerName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [isOnline, setIsOnline] = useState(false);

  const defaultCountry =
    CountryCodes.find((c) => c.code === "TR") || CountryCodes[0];
  const [phoneCode, setPhoneCode] = useState(defaultCountry);
  const [phone, setPhone] = useState("");

  type Neighbourhood = string;
  type Town = {
    Town: string;
    Neighbourhoods: Neighbourhood[];
  };
  type District = {
    District: string;
    Towns: Town[];
  };
  type Province = {
    Province: string;
    Districts: District[];
  };
  const provinces = turkeyGeo as Province[];
  const [provQuery, setProvQuery] = useState("");
  const [provSug, setProvSug] = useState<string[]>([]);
  const [districtQuery, setDistrictQuery] = useState("");
  const [districtSug, setDistrictSug] = useState<string[]>([]);
  const [townQuery, setTownQuery] = useState("");
  const [townSug, setTownSug] = useState<string[]>([]);
  const [neighQuery, setNeighQuery] = useState("");
  const [neighSug, setNeighSug] = useState<string[]>([]);
  const [openDropdown, setOpenDropdown] = useState<null | number>(null);

  const [mapLocation, setMapLocation] = useState<LatLng | null>(null);
  const [workingHours, setWorkingHours] = useState(DEFAULT_WORKING_HOURS);
  const [services, setServices] = useState<Service[]>([]);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (user?.name) setOwnerName(user.name);
  }, [user]);

  // --- autocomplete logic (same as before) ---
  useEffect(() => {
    if (provQuery) {
      setProvSug(
        provinces
          .map((p) => p.Province)
          .filter((n) => n.toLowerCase().includes(provQuery.toLowerCase()))
      );
    } else setProvSug([]);
    setDistrictQuery("");
    setDistrictSug([]);
    setTownQuery("");
    setTownSug([]);
    setNeighQuery("");
    setNeighSug([]);
  }, [provQuery]);
  useEffect(() => {
    if (provQuery && districtQuery) {
      const p = provinces.find((p) => p.Province === provQuery);
      const list = p?.Districts.map((d: any) => d.District) || [];
      setDistrictSug(
        list.filter((n) =>
          n.toLowerCase().includes(districtQuery.toLowerCase())
        )
      );
    } else setDistrictSug([]);
    setTownQuery("");
    setTownSug([]);
    setNeighQuery("");
    setNeighSug([]);
  }, [districtQuery, provQuery]);
  useEffect(() => {
    if (provQuery && districtQuery && townQuery) {
      const p = provinces.find((p) => p.Province === provQuery);
      const d = p?.Districts.find((d: any) => d.District === districtQuery);
      const list = d?.Towns.map((t: any) => t.Town) || [];
      setTownSug(
        list.filter((n) => n.toLowerCase().includes(townQuery.toLowerCase()))
      );
    } else setTownSug([]);
    setNeighQuery("");
    setNeighSug([]);
  }, [townQuery, districtQuery, provQuery]);
  useEffect(() => {
    if (provQuery && districtQuery && townQuery && neighQuery) {
      const p = provinces.find((p) => p.Province === provQuery);
      const d = p?.Districts.find((d: any) => d.District === districtQuery);
      const t = d?.Towns.find((t: any) => t.Town === townQuery);
      const list = t?.Neighbourhoods || [];
      setNeighSug(
        list.filter((n: string) =>
          n.toLowerCase().includes(neighQuery.toLowerCase())
        )
      );
    } else setNeighSug([]);
  }, [neighQuery, townQuery, districtQuery, provQuery]);
  useEffect(() => {
    if (!isOnline && provQuery && districtQuery && townQuery && neighQuery) {
      const query = `${neighQuery}, ${townQuery}, ${districtQuery}, ${provQuery}, Turkey`;
      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=1`
      )
        .then((r) => r.json())
        .then((data: any[]) => {
          if (data[0]) setMapLocation({ lat: +data[0].lat, lng: +data[0].lon });
        });
    }
  }, [provQuery, districtQuery, townQuery, neighQuery, isOnline]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (!ownerName || !companyName || !companyType)
      return setMessage("Temel alanlar zorunludur.");
    if (!idToken) return;
    if (!isOnline) {
      if (!provQuery || !districtQuery || !townQuery || !neighQuery)
        return setMessage("Adres bilgisi gerekli.");
      if (!mapLocation) return setMessage("Konum seçin.");
    }
    if (!phone || !phoneCode.dial_code) return setMessage("Telefon gerekli.");
    const finalLoc = isOnline ? IST_CENTER : mapLocation!;
    const payload = {
      name: companyName,
      ownerName,
      companyType,
      phone: phoneCode.dial_code + phone,
      address: `${neighQuery}, ${townQuery}, ${districtQuery}, ${provQuery}`,
      location: {
        type: "Point" as const,
        coordinates: [finalLoc.lng, finalLoc.lat] as [number, number],
      },
      workingHours,
      services: services.map((s) => ({
        serviceName: s.serviceName,
        servicePrice: Number(s.servicePrice) || 0,
        serviceKapora: 0,
        serviceDuration: Number(s.serviceDuration) || 0,
      })),
      employees: [],
    };
    try {
      const created = await createCompany(idToken, payload);
      onCreated(created._id, created.name);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "message" in err) {
        setMessage((err as { message?: string }).message || "Hata oluştu.");
      } else {
        setMessage("Hata oluştu.");
      }
    }
  };

  const fieldConfigs = [
    {
      value: provQuery,
      setValue: setProvQuery,
      suggestions: provSug,
      placeholder: "Şehir*",
      idx: 0,
    },
    {
      value: districtQuery,
      setValue: setDistrictQuery,
      suggestions: districtSug,
      placeholder: "İlçe*",
      idx: 1,
    },
    {
      value: townQuery,
      setValue: setTownQuery,
      suggestions: townSug,
      placeholder: "Town*",
      idx: 2,
    },
    {
      value: neighQuery,
      setValue: setNeighQuery,
      suggestions: neighSug,
      placeholder: "Mahalle*",
      idx: 3,
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          placeholder="Kurucu Adı*"
          className="border p-2 rounded-xl focus:ring-2 focus:ring-blue-500"
        />
        <input
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Şirket Adı*"
          className="border p-2 rounded-xl focus:ring-2 focus:ring-blue-500"
        />
        <input
          value={companyType}
          onChange={(e) => setCompanyType(e.target.value)}
          placeholder="Tür*"
          className="border p-2 rounded-xl focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {/* Phone with flag country code */}
      <PhoneInput
        phone={phone}
        setPhone={setPhone}
        phoneCode={phoneCode}
        setPhoneCode={setPhoneCode}
      />
      {/* Toggle */}
      <div className="flex items-center gap-4 my-2">
        <span className="mr-3 text-sm">Çevrimiçi Hizmet</span>
        <button
          type="button"
          aria-pressed={isOnline}
          onClick={() => setIsOnline((v) => !v)}
          className={`w-12 h-6 flex items-center rounded-full transition-colors duration-300 
              ${isOnline ? "bg-blue-500" : "bg-gray-300"} relative`}
        >
          <span
            className={`h-6 w-6 bg-white rounded-full shadow transition-transform duration-300 absolute 
                ${isOnline ? "translate-x-6" : "translate-x-0"}`}
            style={{ left: 0, top: 0 }}
          ></span>
        </button>
      </div>
      {/* Address Autocomplete */}
      {!isOnline && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fieldConfigs.map(
              ({ value, setValue, suggestions, placeholder, idx }) => (
                <div key={idx} className="relative">
                  <input
                    value={value}
                    onChange={(e) => {
                      setValue(e.target.value);
                      setOpenDropdown(idx);
                    }}
                    onFocus={() => setOpenDropdown(idx)}
                    placeholder={placeholder}
                    className="border w-full px-3 py-2 rounded-xl focus:ring-2 focus:ring-blue-500"
                    autoComplete="off"
                    onBlur={() => setTimeout(() => setOpenDropdown(null), 120)}
                  />
                  {openDropdown === idx && suggestions.length > 0 && (
                    <ul className="absolute bg-white border w-full max-h-32 overflow-auto mt-1 z-20 rounded-lg shadow">
                      {suggestions.map((s) => (
                        <li
                          key={s}
                          className="px-3 py-1 hover:bg-blue-100 cursor-pointer transition"
                          onClick={(e) => {
                            e.stopPropagation();
                            setValue(s);
                            setOpenDropdown(null);
                          }}
                        >
                          {s}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            )}
          </div>
          <div>
            <label className="block mb-1">Konum Seç</label>
            <LocationPicker value={mapLocation} onChange={setMapLocation} />
          </div>
        </>
      )}
      {/* Working Hours */}
      <div>
        <label className="block mb-2">Çalışma Saatleri</label>
        {workingHours.map((wh, idx) => (
          <div key={wh.day} className="flex items-center gap-3 mb-2">
            <span className="w-24 text-sm">{wh.day}</span>
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
              className="border px-2 py-1 rounded focus:ring-2 focus:ring-blue-500"
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
              className="border px-2 py-1 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
      </div>
      {/* Services */}
      <div>
        <label className="block mb-2">Hizmetler</label>
        {services.map((s, idx) => (
          <div key={idx} className="grid grid-cols-3 gap-2 mb-2">
            <input
              placeholder="Adı"
              value={s.serviceName}
              onChange={(e) =>
                setServices((arr) =>
                  arr.map((v, i) =>
                    i === idx ? { ...v, serviceName: e.target.value } : v
                  )
                )
              }
              className="border px-2 py-1 rounded focus:ring-2 focus:ring-blue-500 col-span-1"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Fiyat"
              value={s.servicePrice}
              onChange={(e) =>
                setServices((arr) =>
                  arr.map((v, i) =>
                    i === idx ? { ...v, servicePrice: e.target.value } : v
                  )
                )
              }
              className="border px-2 py-1 rounded focus:ring-2 focus:ring-blue-500 col-span-1"
            />
            <input
              type="number"
              min="1"
              step="1"
              placeholder="Süre (dk)"
              value={s.serviceDuration}
              onChange={(e) =>
                setServices((arr) =>
                  arr.map((v, i) =>
                    i === idx ? { ...v, serviceDuration: e.target.value } : v
                  )
                )
              }
              className="border px-2 py-1 rounded focus:ring-2 focus:ring-blue-500 col-span-1"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setServices((arr) => [
              ...arr,
              { serviceName: "", servicePrice: "", serviceDuration: "" },
            ])
          }
          className="text-sm text-blue-600 hover:underline"
        >
          + Hizmet Ekle
        </button>
      </div>
      {/* Message & Submit */}
      {message && (
        <p className="text-sm text-red-600 bg-red-100 p-2 rounded">{message}</p>
      )}
      <button
        type="submit"
        className="w-full py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
      >
        Oluştur
      </button>
      <button
        type="button"
        onClick={onClose}
        className="w-full mt-2 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition"
      >
        Vazgeç
      </button>
    </form>
  );
}
