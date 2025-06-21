// src/components/Forms/CreateGroupForm.tsx
import { useState, useEffect, FormEvent } from "react";
import AppModal from "../Modals/AppModal";
import { createGroup } from "../../api/groupApi";
import { getPatients } from "../../api/patientApi";
import type { Patient, Group } from "../../types/sharedTypes";
import PatientPreviewList from "../Lists/PatientPreviewList";

export interface CreateGroupFormProps {
  readonly show: boolean;
  readonly onClose: () => void;
  readonly idToken: string;
  readonly companyId: string;
  readonly clinicId: string;
  readonly onCreated?: () => void;
}

export default function CreateGroupForm({
  show,
  onClose,
  idToken,
  companyId,
  clinicId,
  onCreated,
}: CreateGroupFormProps) {
  const [form, setForm] = useState({
    name: "",
    note: "",
    credit: 0,
    size: 6,
    status: "active",
    patients: [] as string[],
  });
  const [patients, setPatients] = useState<Patient[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (show) {
      getPatients(idToken, companyId, clinicId)
        .then(setPatients)
        .catch(() => setPatients([]));
    }
  }, [show, idToken, companyId, clinicId]);

  const handleTogglePatient = (patientId: string) => {
    setForm((f) => ({
      ...f,
      patients: f.patients.includes(patientId)
        ? f.patients.filter((id) => id !== patientId)
        : [...f.patients, patientId],
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Build payload matching the API's Omit<Group,...> signature
    const payload: Omit<
      Group,
      | "_id"
      | "companyId"
      | "clinicId"
      | "createdAt"
      | "updatedAt"
      | "appointments"
    > = {
      name: form.name,
      note: form.note,
      credit: form.credit,
      size: form.size,
      status: form.status,
      patients: form.patients,
      employees: [], // or provide appropriate employee IDs
      maxSize: form.size, // or another value if needed
      groupType: "default", // or another valid groupType
      createdBy: "", // or set to the current user ID if available
    };
    try {
      await createGroup(idToken, companyId, clinicId, payload);
      setMessage("Grup oluşturuldu!");
      setForm({
        name: "",
        note: "",
        credit: 0,
        size: 6,
        status: "active",
        patients: [],
      });
      onCreated?.();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(err.message);
      } else {
        setMessage("Hata oluştu");
      }
    }
  };

  return (
    <AppModal open={show} onClose={onClose} title="Yeni Grup Oluştur">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-brand-main mb-1">
            Grup İsmi
          </label>
          <input
            value={form.name}
            required
            placeholder="Grup İsmi"
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full border px-3 py-2 rounded-xl"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-brand-main mb-1">
              Kapasite
            </label>
            <input
              type="number"
              min={1}
              value={form.size}
              onChange={(e) =>
                setForm((f) => ({ ...f, size: Number(e.target.value) }))
              }
              className="w-full border px-3 py-2 rounded-xl"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-brand-main mb-1">
              Kredi
            </label>
            <input
              type="number"
              min={0}
              value={form.credit}
              onChange={(e) =>
                setForm((f) => ({ ...f, credit: Number(e.target.value) }))
              }
              className="w-full border px-3 py-2 rounded-xl"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-brand-main mb-1">
            Not
          </label>
          <textarea
            value={form.note}
            placeholder="Not"
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            className="w-full border px-3 py-2 rounded-xl"
          />
        </div>

        <div>
          <label className="block text-sm mb-2 text-brand-main font-semibold">
            Hastalar
          </label>
          <PatientPreviewList
            patients={patients}
            selectedIds={form.patients}
            onToggleSelect={handleTogglePatient}
          />
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-brand-gray-200 rounded-xl"
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

        {message && (
          <p className="mt-2 text-center text-sm text-brand-red">{message}</p>
        )}
      </form>
    </AppModal>
  );
}
