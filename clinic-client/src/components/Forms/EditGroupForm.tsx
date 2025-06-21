// src/components/Forms/EditGroupForm.tsx

import React, { useState, useEffect, useMemo } from "react";
import AppModal from "../Modals/AppModal";
import { updateGroup } from "../../api/groupApi";
import { getPatients } from "../../api/patientApi";
import type { Group, Patient } from "../../types/sharedTypes";
import { useAuth } from "../../contexts/AuthContext";
import PatientPreviewCard from "../Cards/PatientPreviewCard";
import {
  XCircleIcon,
  PlusCircleIcon,
  MinusCircleIcon,
} from "@heroicons/react/24/outline";

interface EditGroupFormProps {
  group: Group;
  onClose: () => void;
  onUpdated?: (updated: Group) => void;
}

const statusOptions = [
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Pasif" },
  { value: "archived", label: "Arşiv" },
];

const EditGroupForm: React.FC<EditGroupFormProps> = ({
  group,
  onClose,
  onUpdated,
}) => {
  const { idToken, selectedCompanyId, selectedClinicId } = useAuth();

  // Local state
  const [form, setForm] = useState({
    name: group.name,
    maxSize: group.maxSize,
    note: group.note || "",
    credit: group.credit,
    status: group.status,
    groupType: group.groupType || "",
    patients: (group.patients ?? []).map((p) => p?.toString()), // Store as string[]
  });
  const [patients, setPatients] = useState<Patient[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [search, setSearch] = useState(""); // Patient name search

  useEffect(() => {
    if (idToken && selectedCompanyId && selectedClinicId) {
      getPatients(idToken, selectedCompanyId, selectedClinicId)
        .then(setPatients)
        .catch(() => setPatients([]));
    }
  }, [idToken, selectedCompanyId, selectedClinicId]);

  // Search filtering for patients
  const filteredPatients = useMemo(() => {
    if (!search.trim()) return patients;
    return patients.filter(
      (p) =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.phone?.includes(search) // optional: search by phone
    );
  }, [patients, search]);

  // Patient detail finder for selected
  const selectedPatients = useMemo(
    () =>
      form.patients
        .map((id) => patients.find((p) => p._id === id))
        .filter(Boolean) as Patient[],
    [form.patients, patients]
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: name === "maxSize" || name === "credit" ? Number(value) : value,
    }));
  };

  // Add/remove patients
  const handleTogglePatient = (patientId: string) => {
    setForm((f) => ({
      ...f,
      patients: f.patients.includes(patientId)
        ? f.patients.filter((id) => id !== patientId)
        : [...f.patients, patientId],
    }));
  };

  // Remove patient by X button (from selected area)
  const handleRemovePatient = (patientId: string) => {
    setForm((f) => ({
      ...f,
      patients: f.patients.filter((id) => id !== patientId),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const updates = {
        name: form.name,
        maxSize: Number(form.maxSize),
        note: form.note,
        credit: Number(form.credit),
        status: form.status,
        groupType: form.groupType,
        patients: form.patients, // send as array of IDs
      };
      const updated = await updateGroup(
        idToken!,
        selectedCompanyId!,
        selectedClinicId!,
        group._id,
        updates
      );
      setMessage("Grup başarıyla güncellendi!");
      if (onUpdated) onUpdated(updated);
      setTimeout(() => {
        setSaving(false);
        onClose();
      }, 600);
    } catch (err: any) {
      setMessage(err.message || "Güncelleme başarısız.");
      setSaving(false);
    }
  };

  return (
    <AppModal open onClose={onClose} title="Grubu Düzenle">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm mb-1 font-semibold">Grup İsmi</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded-xl"
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm mb-1 font-semibold">
              Kapasite (maxSize)
            </label>
            <input
              name="maxSize"
              type="number"
              min={1}
              value={form.maxSize}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded-xl"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm mb-1 font-semibold">Kredi</label>
            <input
              name="credit"
              type="number"
              min={0}
              value={form.credit}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded-xl"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1 font-semibold">Not</label>
          <textarea
            name="note"
            value={form.note}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-xl"
            rows={2}
          />
        </div>
        <div>
          <label className="block text-sm mb-1 font-semibold">Grup Tipi</label>
          <input
            name="groupType"
            value={form.groupType}
            onChange={handleChange}
            placeholder="Örn: Çocuk, Yetişkin, vs."
            className="w-full border px-3 py-2 rounded-xl"
          />
        </div>
        <div>
          <label className="block text-sm mb-1 font-semibold">Durum</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-xl"
          >
            {statusOptions.map((opt) => (
              <option value={opt.value} key={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Search input */}
        <div>
          <label className="block text-sm mb-1 font-semibold">
            Hasta Arama
          </label>
          <input
            type="text"
            placeholder="İsim veya telefon ile ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border px-3 py-2 rounded-xl"
          />
        </div>

        {/* Selected Patients (removable pills) */}
        {selectedPatients.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {selectedPatients.map((p) => (
              <span
                key={p._id}
                className="inline-flex items-center bg-brand-main/10 text-brand-main px-3 py-1 rounded-full"
              >
                <span>{p.name}</span>
                <XCircleIcon
                  className="ml-1 w-4 h-4 text-red-400 cursor-pointer"
                  onClick={() => handleRemovePatient(p._id)}
                  title="Çıkar"
                />
              </span>
            ))}
          </div>
        )}

        {/* Patient list toggle */}
        <div>
          <label className="block text-sm mb-2 font-semibold">
            Gruptaki Hastalar
          </label>
          {filteredPatients.length ? (
            <div className="flex flex-wrap gap-2">
              {filteredPatients.map((p) => {
                const selected = form.patients.includes(p._id);
                return (
                  <div
                    key={p._id}
                    onClick={() => handleTogglePatient(p._id)}
                    className={`relative transition cursor-pointer rounded-xl border shadow-sm hover:shadow-md flex items-center
                      ${
                        selected
                          ? "border-brand-main bg-brand-main/10 ring-2 ring-brand-main"
                          : "border-brand-gray-100 bg-gray-50"
                      }`}
                    style={{ minWidth: 220, maxWidth: 280 }}
                  >
                    {/* Show add/remove icon */}
                    {selected ? (
                      <MinusCircleIcon className="absolute left-2 top-2 w-5 h-5 text-brand-main" />
                    ) : (
                      <PlusCircleIcon className="absolute left-2 top-2 w-5 h-5 text-gray-400" />
                    )}
                    <div className="pl-8 pr-2 py-2 w-full">
                      <PatientPreviewCard
                        patient={p}
                        selected={selected}
                        // Optionally: show avatar, age, phone etc.
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <span className="ml-2 text-brand-gray-400">Hasta bulunamadı</span>
          )}
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-brand-gray-200 rounded-xl"
            disabled={saving}
          >
            İptal
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-brand-main text-white rounded-xl"
            disabled={saving}
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
        {message && (
          <p className="mt-2 text-center text-sm text-brand-green">{message}</p>
        )}
      </form>
    </AppModal>
  );
};

export default EditGroupForm;
