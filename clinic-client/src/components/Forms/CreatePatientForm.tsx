// src/components/Forms/CreatePatientForm.tsx
import React, { useState, useEffect, useRef } from "react";
import AppModal, { ModalForm } from "../Modals/AppModal";
import { createPatient } from "../../api/patientApi";
import { listGroups } from "../../api/groupApi";
import type { Patient, Group } from "../../types/sharedTypes";
import GroupPreviewList from "../Lists/GroupPreviewList";
import CountryCodes from "../../data/CountryCodes.json";

// helper to render flag emoji from country code
function countryCodeToFlag(code: string) {
  return code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));
}

interface PhoneInputProps {
  phone: string;
  setPhone: React.Dispatch<React.SetStateAction<string>>;
  phoneCode: (typeof CountryCodes)[number];
  setPhoneCode: React.Dispatch<
    React.SetStateAction<(typeof CountryCodes)[number]>
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
    function onClickOutside(e: MouseEvent) {
      if (open && ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    window.addEventListener("mousedown", onClickOutside);
    return () => window.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const topList = CountryCodes.filter((c) =>
    ["TR", "US", "DE", "GB", "FR"].includes(c.code)
  );
  const rest = CountryCodes.filter(
    (c) => !topList.some((t) => t.code === c.code)
  );

  return (
    <div ref={ref} className="flex items-center relative min-w-0">
      <button
        type="button"
        className="flex items-center gap-1 border rounded-l-xl px-2 py-2 bg-white"
        onClick={() => setOpen((o) => !o)}
      >
        <span>{countryCodeToFlag(phoneCode.code)}</span>
        <span>{phoneCode.dial_code}</span>
      </button>
      {open && (
        <div className="absolute top-12 left-0 bg-white border rounded shadow-lg z-20 w-64 max-h-60 overflow-auto">
          {[...topList, ...rest].map((c) => (
            <button
              key={c.code}
              type="button"
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer w-full text-left"
              onMouseDown={(e) => {
                e.preventDefault();
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
        placeholder="Telefon*"
        className="border rounded-r-xl px-3 py-2 flex-1 min-w-0"
        maxLength={15}
      />
    </div>
  );
}

export interface CreatePatientFormProps {
  show: boolean;
  onClose: () => void;
  idToken: string;
  companyId: string;
  clinicId: string;
  onCreated?: () => void;
}

export default function CreatePatientForm({
  show,
  onClose,
  idToken,
  companyId,
  clinicId,
  onCreated,
}: CreatePatientFormProps) {
  const [form, setForm] = useState({
    name: "",
    age: "",
    credit: "",
    note: "",
    status: "active",
    groups: [] as string[],
  });
  const [groups, setGroups] = useState<Group[]>([]);
  const [phoneCode, setPhoneCode] = useState(
    CountryCodes.find((c) => c.code === "TR")!
  );
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createdRef = useRef<Patient | null>(null);

  useEffect(() => {
    if (show) {
      listGroups(idToken, companyId, clinicId)
        .then(setGroups)
        .catch(() => setGroups([]));
    }
  }, [show, idToken, companyId, clinicId]);

  const handleToggleGroup = (gid: string) => {
    setForm((f) => ({
      ...f,
      groups: f.groups.includes(gid)
        ? f.groups.filter((id) => id !== gid)
        : [...f.groups, gid],
    }));
  };

  const handleSubmit = async (): Promise<boolean> => {
    setError(null);
    if (!form.name.trim()) {
      setError("İsim zorunlu.");
      return false;
    }
    const payload: Omit<Patient, "_id" | "companyId" | "clinicId"> = {
      name: form.name,
      age: form.age ? Number(form.age) : undefined,
      phone: `${phoneCode.dial_code}${phone}`,
      credit: form.credit ? Number(form.credit) : 0,
      note: form.note,
      status: form.status,
      createdAt: new Date().toISOString(),
      services: [],
      paymentHistory: [],
    };
    try {
      const created = await createPatient(
        idToken,
        companyId,
        clinicId,
        payload
      );
      createdRef.current = created;
      return true;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Oluşturma başarısız.";
      setError(errorMessage);
      return false;
    }
  };

  return (
    <AppModal
      open={show}
      onClose={onClose}
      title="Yeni Müşteri Oluştur"
      onSuccess={() => {
        onCreated?.();
      }}
    >
      <ModalForm onSubmit={handleSubmit}>
        <div className="space-y-4">
          {error && <div className="text-red-600 text-sm">{error}</div>}

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-brand-main mb-1">
              İsim
            </label>
            <input
              value={form.name}
              required
              placeholder="İsim"
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full border px-3 py-2 rounded-xl"
            />
          </div>

          {/* Age & Phone */}
          <div className="flex gap-3 flex-wrap">
            <div className="flex-shrink-0 w-24">
              <label className="block text-sm font-semibold text-brand-main mb-1">
                Yaş
              </label>
              <input
                value={form.age}
                type="number"
                min={0}
                onChange={(e) =>
                  setForm((f) => ({ ...f, age: e.target.value }))
                }
                className="w-full border px-3 py-2 rounded-xl"
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-semibold text-brand-main mb-1">
                Telefon
              </label>
              <PhoneInput
                phone={phone}
                setPhone={setPhone}
                phoneCode={phoneCode}
                setPhoneCode={setPhoneCode}
              />
            </div>
          </div>

          {/* Credit */}
          <div>
            <label className="block text-sm font-semibold text-brand-main mb-1">
              Kalan Seans Kredisi
            </label>
            <input
              value={form.credit}
              type="number"
              min={0}
              onChange={(e) =>
                setForm((f) => ({ ...f, credit: e.target.value }))
              }
              className="w-full border px-3 py-2 rounded-xl"
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-semibold text-brand-main mb-1">
              Not
            </label>
            <textarea
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              className="w-full border px-3 py-2 rounded-xl"
            />
          </div>

          {/* Groups */}
          <div>
            <label className="block text-sm font-semibold text-brand-main mb-1">
              Gruplar
            </label>
            <GroupPreviewList
              groups={groups}
              selectedIds={form.groups}
              onToggleSelect={handleToggleGroup}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-xl"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-main text-white rounded-xl"
            >
              Oluştur
            </button>
          </div>
        </div>
      </ModalForm>
    </AppModal>
  );
}
