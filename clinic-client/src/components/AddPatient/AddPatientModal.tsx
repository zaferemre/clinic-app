// src/components/Patients/AddPatientModal.tsx
import { FormEvent, useState, useEffect } from "react";
import AppModal from "../Modals/AppModal";
import { createPatient } from "../../api/patientApi";
import { PatientSettings } from "../../types/sharedTypes";

export interface AddPatientModalProps {
  show: boolean;
  onClose: () => void;
  idToken: string;
  companyId: string;
}

export default function AddPatientModal({
  show,
  onClose,
  idToken,
  companyId,
}: AddPatientModalProps) {
  const DEFAULT_SETTINGS: PatientSettings = {
    showCredit: true,
    showPaymentStatus: true,
    showServicesReceived: true,
    showServicePointBalance: true,
    showNotes: false,
  };
  const [settings, setSettings] = useState<PatientSettings>(DEFAULT_SETTINGS);
  useEffect(() => {
    const saved = localStorage.getItem("patientSettings");
    if (saved) setSettings(JSON.parse(saved));
  }, [show]);

  const [form, setForm] = useState({
    name: "",
    gender: "Male",
    age: "",
    phone: "",
    credit: "0",
    note: "",
    paymentMethod: "Unpaid",
    paymentNote: "",
  });
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // build payload respecting settings…
    const payload: any = {
      name: form.name,
      gender: form.gender,
      age: form.age ? Number(form.age) : undefined,
      phone: form.phone,
    };
    if (settings.showCredit) payload.credit = Number(form.credit) || 0;
    if (settings.showNotes && form.note) payload.note = form.note;
    if (settings.showPaymentStatus && form.paymentMethod !== "Unpaid") {
      payload.paymentHistory = [
        {
          date: new Date().toISOString(),
          method: form.paymentMethod,
          amount: 0,
          note: form.paymentNote,
        },
      ];
    }

    try {
      await createPatient(idToken, companyId, payload);
      setMessage("Müşteri eklendi!");
      setForm({
        ...form,
        name: "",
        age: "",
        phone: "",
        credit: "0",
        note: "",
        paymentMethod: "Unpaid",
        paymentNote: "",
      });
    } catch (err: any) {
      setMessage(err.message || "Hata oluştu");
    }
  };

  return (
    <AppModal open={show} onClose={onClose} title="Yeni Müşteri Oluştur">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* name, gender, age, phone… */}
        <div>
          <label className="block text-sm">İsim</label>
          <input
            required
            className="mt-1 w-full border rounded px-3 py-2"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm">Telefon</label>
          <input
            required
            className="mt-1 w-full border rounded px-3 py-2"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </div>
        {settings.showCredit && (
          <div>
            <label className="block text-sm">Kredi</label>
            <input
              type="number"
              min={0}
              className="mt-1 w-full border rounded px-3 py-2"
              value={form.credit}
              onChange={(e) =>
                setForm((f) => ({ ...f, credit: e.target.value }))
              }
            />
          </div>
        )}
        {settings.showNotes && (
          <div>
            <label className="block text-sm">Not</label>
            <textarea
              className="mt-1 w-full border rounded px-3 py-2"
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            />
          </div>
        )}
        {settings.showPaymentStatus && (
          <div>
            <label className="block text-sm">Ödeme Durumu</label>
            <select
              className="mt-1 w-full border rounded px-3 py-2"
              value={form.paymentMethod}
              onChange={(e) =>
                setForm((f) => ({ ...f, paymentMethod: e.target.value }))
              }
            >
              <option value="Unpaid">Ödenmedi</option>
              <option value="Cash">Nakit</option>
              <option value="Havale">Havale</option>
              <option value="Card">Kart</option>
            </select>
            {form.paymentMethod !== "Unpaid" && (
              <input
                className="mt-2 w-full border rounded px-3 py-2"
                placeholder="Not"
                value={form.paymentNote}
                onChange={(e) =>
                  setForm((f) => ({ ...f, paymentNote: e.target.value }))
                }
              />
            )}
          </div>
        )}
        <div className="flex justify-end space-x-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            İptal
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Oluştur
          </button>
        </div>
        {message && (
          <p className="mt-2 text-center text-sm text-red-600">{message}</p>
        )}
      </form>
    </AppModal>
  );
}
