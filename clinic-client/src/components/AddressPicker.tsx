// src/components/AddressPicker.tsx
import { useState, useEffect } from "react";
import geo from "../data/turkey-geo.json";

export interface Address {
  province: string;
  district: string;
  town: string;
  neighborhood: string;
  street: string;
}

interface Props {
  onSelect: (addr: Address) => void;
}

export default function AddressPicker({ onSelect }: Props) {
  // Full geo structure from turkey-geo.json
  interface GeoTown {
    Town: string;
    Neighbourhoods: string[];
  }
  interface GeoDistrict {
    District: string;
    Towns: GeoTown[];
  }
  interface GeoProvince {
    Province: string;
    Districts: GeoDistrict[];
  }

  const provinces = geo as GeoProvince[];

  const [districts, setDistricts] = useState<GeoDistrict[]>([]);
  const [towns, setTowns] = useState<GeoTown[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);

  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [town, setTown] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [street, setStreet] = useState("");

  // cascade province → districts
  useEffect(() => {
    const p = provinces.find((p) => p.Province === province);
    setDistricts(p?.Districts || []);
    setDistrict("");
    setTowns([]);
    setTown("");
    setNeighborhoods([]);
    setNeighborhood("");
    setStreet("");
  }, [province]);

  // cascade district → towns
  useEffect(() => {
    const d = districts.find((d) => d.District === district);
    setTowns(d?.Towns || []);
    setTown("");
    setNeighborhoods([]);
    setNeighborhood("");
    setStreet("");
  }, [district]);

  // cascade town → neighborhoods
  useEffect(() => {
    const t = towns.find((t) => t.Town === town);
    setNeighborhoods(t?.Neighbourhoods || []);
    setNeighborhood("");
    setStreet("");
  }, [town]);

  // whenever all four selected, notify parent
  useEffect(() => {
    if (province && district && town && neighborhood) {
      onSelect({ province, district, town, neighborhood, street });
    }
  }, [province, district, town, neighborhood, street, onSelect]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Province */}
      <div>
        <label className="block text-sm font-medium">Şehir (İl)</label>
        <select
          className="mt-1 w-full border px-3 py-2 rounded"
          value={province}
          onChange={(e) => setProvince(e.target.value)}
        >
          <option value="">Seçiniz…</option>
          {provinces.map((p) => (
            <option key={p.Province} value={p.Province}>
              {p.Province}
            </option>
          ))}
        </select>
      </div>

      {/* District */}
      <div>
        <label className="block text-sm font-medium">İlçe</label>
        <select
          className="mt-1 w-full border px-3 py-2 rounded"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          disabled={!province}
        >
          <option value="">Seçiniz…</option>
          {districts.map((d) => (
            <option key={d.District} value={d.District}>
              {d.District}
            </option>
          ))}
        </select>
      </div>

      {/* Town */}
      <div>
        <label className="block text-sm font-medium">Bucak / Town</label>
        <select
          className="mt-1 w-full border px-3 py-2 rounded"
          value={town}
          onChange={(e) => setTown(e.target.value)}
          disabled={!district}
        >
          <option value="">Seçiniz…</option>
          {towns.map((t) => (
            <option key={t.Town} value={t.Town}>
              {t.Town}
            </option>
          ))}
        </select>
      </div>

      {/* Neighborhood */}
      <div>
        <label className="block text-sm font-medium">Mahalle</label>
        <select
          className="mt-1 w-full border px-3 py-2 rounded"
          value={neighborhood}
          onChange={(e) => setNeighborhood(e.target.value)}
          disabled={!town}
        >
          <option value="">Seçiniz…</option>
          {neighborhoods.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      {/* Street (free text) */}
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium">Sokak / Cadde</label>
        <input
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          className="mt-1 w-full border px-3 py-2 rounded"
          placeholder="Sokak adı"
          disabled={!neighborhood}
        />
      </div>
    </div>
  );
}
