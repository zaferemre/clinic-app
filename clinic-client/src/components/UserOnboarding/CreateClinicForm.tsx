import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { createClinic } from "../../api/clinicApi";
import turkeyGeo from "../../data/turkey-geo.json";
import LocationPicker from "../LocationPicker";
import CountryCodes from "../../data/CountryCodes.json";
import WorkingHoursField, { WorkingHour } from "../WorkingHoursField";

function countryCodeToFlag(code: string) {
  return code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}
function normalizeTR(str: string = ""): string {
  return (str ?? "")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ü/g, "u")
    .replace(/ğ/g, "g")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ö/g, "o");
}

type DayOfWeek = WorkingHour["day"];

const WEEK_DAYS_TR: DayOfWeek[] = [
  "Pazartesi",
  "Salı",
  "Çarşamba",
  "Perşembe",
  "Cuma",
  "Cumartesi",
  "Pazar",
];

const DEFAULT_WORKING_HOURS: WorkingHour[] = WEEK_DAYS_TR.map((d) => ({
  day: d,
  open: "10:00",
  close: "22:00",
  closed: false,
}));

interface PhoneInputProps {
  phone: string;
  setPhone: React.Dispatch<React.SetStateAction<string>>;
  phoneCode: { code: string; dial_code: string; name: string };
  setPhoneCode: React.Dispatch<
    React.SetStateAction<{ code: string; dial_code: string; name: string }>
  >;
}
function PhoneInput({
  phone,
  setPhone,
  phoneCode,
  setPhoneCode,
}: PhoneInputProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (open && ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const topList = CountryCodes.filter((c) =>
    ["TR", "US", "DE", "GB", "FR"].includes(c.code)
  );
  const restList = CountryCodes.filter((c) => !topList.includes(c));

  return (
    <div ref={ref} className="flex gap-2 items-center relative">
      <button
        type="button"
        className="flex items-center gap-1 border rounded-xl px-3 py-2 bg-white"
        onClick={() => setOpen((o) => !o)}
      >
        <span>{countryCodeToFlag(phoneCode.code)}</span>
        <span>{phoneCode.dial_code}</span>
        <svg width={16} height={16} fill="none" className="ml-1">
          <path d="M4 6l4 4 4-4" stroke="#333" strokeWidth={2} />
        </svg>
      </button>
      {open && (
        <div className="absolute top-10 left-0 bg-white border rounded shadow-lg z-10 w-64 max-h-60 overflow-auto">
          {[...topList, ...restList].map((c) => (
            <button
              key={c.code}
              type="button"
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer w-full text-left"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setPhoneCode(c);
                setOpen(false);
              }}
            >
              <span>{countryCodeToFlag(c.code)}</span>
              <span>{c.name}</span>
              <span className="ml-auto">{c.dial_code}</span>
            </button>
          ))}
        </div>
      )}
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
        placeholder="Telefon Numarası*"
        className="border rounded-xl px-3 py-2 flex-1"
        maxLength={15}
      />
    </div>
  );
}

export default function CreateClinicForm({
  onCreated,
  onClose,
}: {
  onCreated: (id: string, name: string) => void;
  onClose: () => void;
}) {
  const { idToken, selectedCompanyId } = useAuth();
  const [clinicName, setClinicName] = useState("");
  const [provQuery, setProvQuery] = useState("");
  const [provSug, setProvSug] = useState<string[]>([]);
  const [districtQuery, setDistrictQuery] = useState("");
  const [districtSug, setDistrictSug] = useState<string[]>([]);
  const [townQuery, setTownQuery] = useState("");
  const [townSug, setTownSug] = useState<string[]>([]);
  const [neighQuery, setNeighQuery] = useState("");
  const [neighSug, setNeighSug] = useState<string[]>([]);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [mapLocation, setMapLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [phoneCode, setPhoneCode] = useState(
    CountryCodes.find((c) => c.code === "TR")!
  );
  const [phone, setPhone] = useState("");
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>(
    DEFAULT_WORKING_HOURS
  );
  const [message, setMessage] = useState("");

  interface NeighbourhoodData {
    Province: string;
    Districts: {
      District: string;
      Towns: { Town: string; Neighbourhoods: string[] }[];
    }[];
  }
  const provinces: NeighbourhoodData[] = turkeyGeo;

  // Turkish-insensitive filtering
  useEffect(() => {
    setProvSug(
      provinces
        .map((p) => p.Province)
        .filter((n) => normalizeTR(n).includes(normalizeTR(provQuery)))
    );
    setDistrictSug([]);
    setTownSug([]);
    setNeighSug([]);
  }, [provQuery]);
  useEffect(() => {
    const p = provinces.find(
      (p) => normalizeTR(p.Province) === normalizeTR(provQuery)
    );
    const list = p?.Districts.map((d) => d.District) || [];
    setDistrictSug(
      list.filter((n) => normalizeTR(n).includes(normalizeTR(districtQuery)))
    );
    setTownSug([]);
    setNeighSug([]);
  }, [districtQuery, provQuery]);
  useEffect(() => {
    const p = provinces.find(
      (p) => normalizeTR(p.Province) === normalizeTR(provQuery)
    );
    const d = p?.Districts.find(
      (d) => normalizeTR(d.District) === normalizeTR(districtQuery)
    );
    const list = d?.Towns.map((t) => t.Town) || [];
    setTownSug(
      list.filter((n) => normalizeTR(n).includes(normalizeTR(townQuery)))
    );
    setNeighSug([]);
  }, [townQuery, districtQuery, provQuery]);
  useEffect(() => {
    const p = provinces.find(
      (p) => normalizeTR(p.Province) === normalizeTR(provQuery)
    );
    const d = p?.Districts.find(
      (d) => normalizeTR(d.District) === normalizeTR(districtQuery)
    );
    const t = d?.Towns.find(
      (t) => normalizeTR(t.Town) === normalizeTR(townQuery)
    );
    const list = t?.Neighbourhoods || [];
    setNeighSug(
      list.filter((n) => normalizeTR(n).includes(normalizeTR(neighQuery)))
    );
  }, [neighQuery, townQuery, districtQuery, provQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (!clinicName) return setMessage("Klinik adı gerekli.");
    if (!selectedCompanyId) return setMessage("Geçersiz şirket.");
    if (!provQuery || !districtQuery) return setMessage("Adres gerekli.");
    if (!mapLocation) return setMessage("Konum seçin.");
    if (!phone) return setMessage("Telefon gerekli.");

    try {
      const payload = {
        name: clinicName,
        address: {
          province: provQuery,
          district: districtQuery,
          town: townQuery,
          neighborhood: neighQuery,
        },
        phoneNumber: `${phoneCode.dial_code}${phone}`,
        location: {
          type: "Point" as const,
          coordinates: [mapLocation.lng, mapLocation.lat],
        },
        workingHours,
        services: newServices.map((svc) => svc.name),
      };
      const created = await createClinic(idToken!, selectedCompanyId!, payload);
      onCreated(created._id, created.name);
    } catch (err: unknown) {
      console.error(err);
      setMessage(err instanceof Error ? err.message : "Hata oluştu.");
    }
  };

  const fields = [
    {
      value: provQuery,
      setter: setProvQuery,
      suggestions: provSug,
      placeholder: "Şehir*",
    },
    {
      value: districtQuery,
      setter: setDistrictQuery,
      suggestions: districtSug,
      placeholder: "İlçe*",
    },
    {
      value: townQuery,
      setter: setTownQuery,
      suggestions: townSug,
      placeholder: "Semt",
    },
    {
      value: neighQuery,
      setter: setNeighQuery,
      suggestions: neighSug,
      placeholder: "Mahalle",
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input
        value={clinicName}
        onChange={(e) => setClinicName(e.target.value)}
        placeholder="Klinik Adı*"
        className="border p-2 rounded w-full"
      />
      <PhoneInput
        phone={phone}
        setPhone={setPhone}
        phoneCode={phoneCode}
        setPhoneCode={setPhoneCode}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((f, idx) => (
          <div key={idx} className="relative">
            <input
              value={f.value}
              onChange={(e) => {
                f.setter(e.target.value);
                setOpenIdx(idx);
              }}
              onFocus={() => setOpenIdx(idx)}
              placeholder={f.placeholder}
              className="border w-full px-2 py-1 rounded"
              autoComplete="off"
            />
            {openIdx === idx && f.suggestions.length > 0 && (
              <ul className="absolute bg-white border w-full max-h-32 overflow-auto mt-1 z-20 rounded shadow">
                {f.suggestions.map((s) => (
                  <li
                    key={s}
                    className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      f.setter(s);
                      setOpenIdx(null);
                    }}
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
      <div>
        <label className="block mb-1">Konum Seç</label>
        <LocationPicker value={mapLocation} onChange={setMapLocation} />
      </div>
      <div>
        <label className="block mb-2">Çalışma Saatleri</label>
        <WorkingHoursField
          workingHours={workingHours}
          setWorkingHours={setWorkingHours}
        />
      </div>

      {message && <p className="text-red-600">{message}</p>}
      <button
        type="submit"
        className="w-full py-2 bg-brand-main text-white rounded-xl font-semibold hover:bg-brand-green transition"
      >
        Oluştur
      </button>
      <button
        type="button"
        onClick={onClose}
        className="w-full mt-2 py-2 bg-gray-200 rounded-xl hover:bg-gray-300"
      >
        Vazgeç
      </button>
    </form>
  );
}
