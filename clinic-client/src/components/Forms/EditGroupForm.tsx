// src/components/Forms/EditGroupForm.tsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import AppModal, { ModalForm } from "../Modals/AppModal";
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

  // form state
  const [form, setForm] = useState({
    name: group.name,
    maxSize: group.maxSize,
    note: group.note || "",
    credit: group.credit,
    status: group.status,
    groupType: group.groupType || "",
    patients: (group.patients ?? []).map((p) => p?.toString()),
  });
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  // stash updated group for onSuccess
  const updatedRef = useRef<Group | null>(null);

  useEffect(() => {
    if (idToken && selectedCompanyId && selectedClinicId) {
      getPatients(idToken, selectedCompanyId, selectedClinicId)
        .then(setPatients)
        .catch(() => setPatients([]));
    }
  }, [idToken, selectedCompanyId, selectedClinicId]);

  const filteredPatients = useMemo(() => {
    if (!search.trim()) return patients;
    return patients.filter(
      (p) =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.phone?.includes(search)
    );
  }, [patients, search]);

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

  const handleTogglePatient = (pid: string) => {
    setForm((f) => ({
      ...f,
      patients: f.patients.includes(pid)
        ? f.patients.filter((id) => id !== pid)
        : [...f.patients, pid],
    }));
  };

  const handleRemovePatient = (pid: string) => {
    setForm((f) => ({
      ...f,
      patients: f.patients.filter((id) => id !== pid),
    }));
  };

  // This is called by ModalForm; return true = success animation, false = error
  const handleSubmit = async (): Promise<boolean> => {
    setError(null);
    if (!idToken || !selectedCompanyId || !selectedClinicId) {
      setError("Yetkilendirme bilgisi eksik.");
      return false;
    }

    try {
      const updates = {
        name: form.name,
        maxSize: form.maxSize,
        note: form.note,
        credit: form.credit,
        status: form.status,
        groupType: form.groupType,
        patients: form.patients,
      };
      const updated = await updateGroup(
        idToken,
        selectedCompanyId,
        selectedClinicId,
        group._id,
        updates
      );
      updatedRef.current = updated;
      return true;
    } catch (err: any) {
      setError(err.message || "Güncelleme başarısız.");
      return false;
    }
  };

  return (
    <AppModal
      open
      onClose={onClose}
      title="Grubu Düzenle"
      onSuccess={() => {
        if (updatedRef.current) {
          onUpdated?.(updatedRef.current);
        }
      }}
    >
      <ModalForm onSubmit={handleSubmit}>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}

        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm mb-1 font-semibold">
              Grup İsmi
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded-xl"
            />
          </div>

          {/* Capacity & Credit */}
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

          {/* Note, Type, Status */}
          <div>
            <label className="block text-sm mb-1 font-semibold">Not</label>
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              rows={2}
              className="w-full border px-3 py-2 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 font-semibold">
              Grup Tipi
            </label>
            <input
              name="groupType"
              value={form.groupType}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-xl"
              placeholder="Örn: Çocuk, Yetişkin..."
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
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Patient search & picker */}
          <div>
            <label className="block text-sm mb-1 font-semibold">
              Hasta Arama
            </label>
            <input
              type="text"
              placeholder="İsim veya telefon ile ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border px-3 py-2 rounded-xl mb-2"
            />

            {selectedPatients.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {selectedPatients.map((p) => (
                  <span
                    key={p._id}
                    className="inline-flex items-center bg-brand-main/10 text-brand-main px-3 py-1 rounded-full"
                  >
                    {p.name}
                    <XCircleIcon
                      className="ml-1 w-4 h-4 text-red-400 cursor-pointer"
                      onClick={() => handleRemovePatient(p._id)}
                    />
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {filteredPatients.map((p) => {
                const sel = form.patients.includes(p._id);
                return (
                  <div
                    key={p._id}
                    onClick={() => handleTogglePatient(p._id)}
                    className={`relative cursor-pointer rounded-xl border shadow-sm p-2 flex items-center
                      ${
                        sel
                          ? "border-brand-main bg-brand-main/10 ring-2 ring-brand-main"
                          : "border-gray-200 bg-gray-50"
                      }
                    }`}
                    style={{ minWidth: 220, maxWidth: 280 }}
                  >
                    {sel ? (
                      <MinusCircleIcon className="absolute left-2 top-2 w-5 h-5 text-brand-main" />
                    ) : (
                      <PlusCircleIcon className="absolute left-2 top-2 w-5 h-5 text-gray-400" />
                    )}
                    <div className="pl-8 pr-2 py-2">
                      <PatientPreviewCard patient={p} selected={sel} />
                    </div>
                  </div>
                );
              })}
            </div>
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
              Kaydet
            </button>
          </div>
        </div>
      </ModalForm>
    </AppModal>
  );
};

export default EditGroupForm;
