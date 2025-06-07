// src/pages/EditPatient/EditPatientPage.tsx
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getPatients, updatePatientField } from "../../api/patientApi";
import { Patient } from "../../types/sharedTypes";
import { NavigationBar } from "../../components/NavigationBar/NavigationBar";

const EditPatientPage: React.FC = () => {
  const { idToken, companyId } = useAuth();
  const { id: patientId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState<string>("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const fetchPatient = async () => {
      if (!idToken || !companyId || !patientId) return;
      try {
        const all = await getPatients(idToken, companyId);
        const found = all.find((p) => p._id === patientId);
        if (!found) {
          setMessage("Hasta bulunamadı.");
        } else {
          setPatient(found);
          setName(found.name);
          setAge(found.age?.toString() ?? "");
          setPhone(found.phone ?? "");
          setNote(found.note ?? "");
        }
      } catch (err) {
        console.error("Hasta yüklenemedi:", err);
        setMessage("Hasta yüklenemedi.");
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [idToken, companyId, patientId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!idToken || !companyId || !patientId) return;

    try {
      await updatePatientField(idToken, companyId, patientId, {
        name: name.trim(),
        age: age ? Number(age) : undefined,
        phone: phone.trim(),
        note: note.trim(),
      });
      setMessage("Hasta başarıyla güncellendi.");
      // After a short delay, go back to Patients list:
      setTimeout(() => navigate("/patients"), 800);
    } catch (err: any) {
      console.error("Hasta güncellenemedi:", err);
      setMessage("Güncelleme sırasında hata oluştu.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-brand-gray-500">Yükleniyor...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-4">
        <p className="text-red-500">{message || "Hasta bulunamadı."}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-brand-gray-100 min-h-screen py-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold text-brand-black mb-4">
          Hasta Düzenle
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
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
              className="
                mt-1 block w-full
                border border-brand-gray-300 
                rounded-lg 
                px-3 py-2 
                focus:outline-none focus:ring-2 focus:ring-brand-green-300
              "
              value={name}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setName(e.target.value)
              }
              required
            />
          </div>

          {/* Age */}
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
              className="
                mt-1 block w-full
                border border-brand-gray-300 
                rounded-lg 
                px-3 py-2 
                focus:outline-none focus:ring-2 focus:ring-brand-green-300
              "
              value={age}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setAge(e.target.value)
              }
              placeholder="Yaş"
            />
          </div>

          {/* Phone */}
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
              className="
                mt-1 block w-full
                border border-brand-gray-300 
                rounded-lg 
                px-3 py-2 
                focus:outline-none focus:ring-2 focus:ring-brand-green-300
              "
              value={phone}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPhone(e.target.value)
              }
              placeholder="(555) 123-4567"
            />
          </div>

          {/* Note */}
          <div>
            <label
              htmlFor="edit-patient-note"
              className="block text-sm font-medium text-brand-black"
            >
              Not
            </label>
            <textarea
              id="edit-patient-note"
              className="
                mt-1 block w-full
                border border-brand-gray-300 
                rounded-lg 
                px-3 py-2 
                focus:outline-none focus:ring-2 focus:ring-brand-green-300
              "
              rows={3}
              value={note}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setNote(e.target.value)
              }
              placeholder="Alerjiler, yorumlar vb."
            />
          </div>

          {/* Message */}
          {message && (
            <div
              className={`
                text-sm p-2 rounded-md
                ${
                  message.startsWith("Hasta başarıyla")
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }
              `}
            >
              {message}
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-2">
            <button
              type="submit"
              className="
                flex-1 
                bg-brand-green-500 hover:bg-brand-green-600 
                text-white font-medium 
                px-4 py-2 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-brand-green-300
              "
            >
              Kaydet
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="
                flex-1 
                bg-brand-gray-300 hover:bg-brand-gray-400 
                text-brand-black font-medium 
                px-4 py-2 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-brand-gray-200
              "
            >
              İptal
            </button>
          </div>
        </form>
      </div>
      <NavigationBar />
    </div>
  );
};

export default EditPatientPage;
