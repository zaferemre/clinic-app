import { useState, useEffect, useRef } from "react";
import AppModal, { ModalForm } from "../Modals/AppModal";
import { createGroup } from "../../api/groupApi";
import { getPatients } from "../../api/patientApi";
import type { Patient, Group } from "../../types/sharedTypes";
import PatientPreviewList from "../Lists/PatientPreviewList";

export interface CreateGroupFormProps {
  show: boolean;
  onClose: () => void;
  idToken: string;
  companyId: string;
  clinicId: string;
  onCreated?: () => void;
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
  const [search, setSearch] = useState(""); // --- NEW: Search input
  const [error, setError] = useState<string | null>(null);

  // stash new group for onSuccess
  const createdRef = useRef<Group | null>(null);

  useEffect(() => {
    if (show) {
      getPatients(idToken, companyId, clinicId)
        .then(setPatients)
        .catch(() => setPatients([]));
    }
  }, [show, idToken, companyId, clinicId]);

  const handleTogglePatient = (pid: string) => {
    setForm((f) => {
      // Limit selection to max group size!
      if (!f.patients.includes(pid) && f.patients.length >= f.size) {
        return f; // Don't allow adding more than max size
      }
      return {
        ...f,
        patients: f.patients.includes(pid)
          ? f.patients.filter((id) => id !== pid)
          : [...f.patients, pid],
      };
    });
  };

  const handleSubmit = async (): Promise<boolean> => {
    setError(null);
    if (!form.name.trim()) {
      setError("Grup adı zorunlu.");
      return false;
    }
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
      employees: [],
      maxSize: form.size,
      groupType: "default",
      createdBy: "",
    };
    try {
      const created = await createGroup(idToken, companyId, clinicId, payload);
      createdRef.current = created;
      return true;
    } catch (err: Error | unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Oluşturma başarısız.";
      setError(errorMessage);
      return false;
    }
  };

  // --- NEW: Filtered patients by search (case-insensitive) ---
  const filteredPatients = patients.filter((p) =>
    !search.trim()
      ? true
      : p.name
          ?.toLocaleLowerCase("tr-TR")
          .includes(search.trim().toLocaleLowerCase("tr-TR"))
  );

  return (
    <AppModal
      open={show}
      onClose={onClose}
      title="Yeni Grup Oluştur"
      onSuccess={() => {
        onCreated?.();
      }}
    >
      <ModalForm onSubmit={handleSubmit}>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}

        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-brand-main mb-1">
              Grup İsmi
            </label>
            <input
              value={form.name}
              required
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full border px-3 py-2 rounded-xl"
            />
          </div>

          {/* Capacity & Credit */}
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
                  setForm((f) => {
                    // Reset selection if reduced below current number!
                    const newSize = Number(e.target.value);
                    let newPatients = f.patients;
                    if (newSize < f.patients.length) {
                      newPatients = f.patients.slice(0, newSize);
                    }
                    return { ...f, size: newSize, patients: newPatients };
                  })
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

          {/* --- NEW: Patient search and selected count --- */}
          <div>
            <label className="block text-sm font-semibold text-brand-main mb-1">
              Hasta Ara
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Hasta ismine göre ara..."
              className="w-full border px-3 py-2 rounded-xl mb-2"
            />
            <div className="mb-1 text-xs text-brand-main font-semibold">
              {form.patients.length}/{form.size} seçildi
            </div>
            <PatientPreviewList
              patients={filteredPatients}
              selectedIds={form.patients}
              onToggleSelect={handleTogglePatient}
              // Add disabledIds prop after updating PatientPreviewListProps interface
              // disabledIds={form.patients.length >= form.size ? form.patients : []}
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
