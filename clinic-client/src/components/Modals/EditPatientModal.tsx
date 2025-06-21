import React, { useState, useEffect } from "react";
import AppModal from "./AppModal";
import { Patient } from "../../types/sharedTypes";
import { useAuth } from "../../contexts/AuthContext";
import { updatePatientField } from "../../api/patientApi";

interface EditPatientModalProps {
  open: boolean;
  onClose: () => void;
  patient: Patient;
  onUpdated?: (updated: Partial<Patient>) => void;
}

const EditPatientModal: React.FC<EditPatientModalProps> = ({
  open,
  onClose,
  patient,
  onUpdated,
}) => {
  const { idToken, selectedCompanyId } = useAuth();
  const [name, setName] = useState(patient.name);
  const [age, setAge] = useState(patient.age?.toString() ?? "");
  const [phone, setPhone] = useState(patient.phone ?? "");
  const [note, setNote] = useState(patient.note ?? "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // reset fields when modal opens
  useEffect(() => {
    if (open) {
      setName(patient.name);
      setAge(patient.age?.toString() ?? "");
      setPhone(patient.phone ?? "");
      setNote(patient.note ?? "");
      setMessage("");
    }
  }, [open, patient]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idToken || !selectedCompanyId) return;
    setLoading(true);
    setMessage("");
    try {
      await updatePatientField(
        idToken,
        selectedCompanyId,
        patient.clinicId, // add clinicId as third argument
        patient._id,
        {
          name: name.trim(),
          age: age ? Number(age) : undefined,
          phone: phone.trim(),
          note: note.trim(),
        }
      );
      setMessage("Hasta başarıyla güncellendi.");
      onUpdated?.({ name, age: age ? Number(age) : undefined, phone, note });
      // close after brief delay
      setTimeout(() => onClose(), 800);
    } catch (err: unknown) {
      console.error("Hasta güncellenemedi:", err);
      setMessage("Güncelleme sırasında hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppModal open={open} onClose={onClose} title="Hasta Düzenle">
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label
            htmlFor="edit-patient-name"
            className="block text-sm font-medium text-brand-black"
          >
            İsim
          </label>
          <input
            id="edit-patient-name"
            type="text"
            className="mt-1 block w-full border border-brand-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-green-300"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label
            htmlFor="edit-patient-age"
            className="block text-sm font-medium text-brand-black"
          >
            Yaş
          </label>
          <input
            id="edit-patient-age"
            type="number"
            min="0"
            className="mt-1 block w-full border border-brand-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-green-300"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Yaş"
          />
        </div>
        <div>
          <label
            htmlFor="edit-patient-phone"
            className="block text-sm font-medium text-brand-black"
          >
            Telefon
          </label>
          <input
            id="edit-patient-phone"
            type="text"
            className="mt-1 block w-full border border-brand-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-green-300"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 123-4567"
          />
        </div>
        <div>
          <label
            htmlFor="edit-patient-note"
            className="block text-sm font-medium text-brand-black"
          >
            Not
          </label>
          <textarea
            id="edit-patient-note"
            rows={3}
            className="mt-1 block w-full border border-brand-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-green-300"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Alerjiler, yorumlar vb."
          />
        </div>
        {message && (
          <div
            className={`text-sm p-2 rounded-md ${
              message.startsWith("Hasta başarıyla")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-md"
            disabled={loading}
          >
            İptal
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-brand-main text-white rounded-md hover:bg-brand-green-600 disabled:opacity-50"
            disabled={loading}
          >
            Kaydet
          </button>
        </div>
      </form>
    </AppModal>
  );
};

export default EditPatientModal;
