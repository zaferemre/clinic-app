import React, {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  useRef,
} from "react";
import ReactDOM from "react-dom";
import { createPatient } from "../../api/patientApi";
import { API_BASE } from "../../config/apiConfig";
import { PatientSettings } from "../Settings/PatientSettingsModal";

interface AddPatientProps {
  show: boolean;
  onClose: () => void;
  idToken: string;
  companyId: string;
}

interface Service {
  _id: string;
  serviceName: string;
  serviceDuration: number;
}

export default function AddPatient({
  show,
  onClose,
  idToken,
  companyId,
}: AddPatientProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // form fields
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [credit, setCredit] = useState("0");
  const [serviceId, setServiceId] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<
    "Unpaid" | "Havale" | "Card" | "Cash"
  >("Unpaid");
  const [paymentNote, setPaymentNote] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  // load patientSettings (defaults if none)
  const DEFAULT_PATIENT_SETTINGS: PatientSettings = {
    showCredit: true,
    showPaymentStatus: true,
    showServicesReceived: true,
    showServicePointBalance: true,
    showNotes: false,
  };
  const [patientSettings, setPatientSettings] = useState<PatientSettings>(
    DEFAULT_PATIENT_SETTINGS
  );

  useEffect(() => {
    const stored = localStorage.getItem("patientSettings");
    if (stored) {
      try {
        setPatientSettings(JSON.parse(stored));
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  // fetch services
  useEffect(() => {
    (async function fetchServices() {
      try {
        const res = await fetch(`${API_BASE}/company/${companyId}/services`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (!res.ok) throw new Error("Hizmetler yüklenemedi");
        const data = await res.json();
        setServices(Array.isArray(data) ? data : []);
      } catch {
        setServices([]);
      }
    })();
  }, [companyId, idToken]);

  const resetForm = () => {
    setName("");
    setGender("Male");
    setAge("");
    setPhone("");
    setCredit("0");
    setServiceId("");
    setPaymentMethod("Unpaid");
    setPaymentNote("");
    setNote("");
    setMessage("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");

    const payload: any = {
      name: name.trim(),
      gender,
      age: age ? Number(age) : undefined,
      phone: phone.trim(),
      credit: patientSettings.showCredit ? Number(credit) || 0 : undefined,
      services: patientSettings.showServicesReceived ? [] : undefined,
      paymentHistory: patientSettings.showPaymentStatus ? [] : undefined,
      note: patientSettings.showNotes ? note.trim() || undefined : undefined,
    };

    if (patientSettings.showServicesReceived && serviceId && services.length) {
      const svc = services.find((s) => s._id === serviceId);
      if (svc) payload.services.push({ name: svc.serviceName });
    }

    if (patientSettings.showPaymentStatus && paymentMethod !== "Unpaid") {
      payload.paymentHistory.push({
        date: new Date().toISOString(),
        method: paymentMethod,
        amount: 0,
        note: paymentNote.trim(),
      });
    }

    try {
      const newPatient = await createPatient(idToken, companyId, payload);
      setMessage(`Müşteri başarıyla eklendi: ${newPatient._id}`);
      resetForm();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Bilinmeyen hata oluştu.";
      console.error(err);
      setMessage(`Hata: ${msg}`);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  if (!show) return null;

  return ReactDOM.createPortal(
    <div
      ref={modalRef}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        <h2 className="text-xl font-semibold mb-4">Yeni Müşteri Oluştur</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">İsim</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Cinsiyet</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              >
                <option value="Male">Erkek</option>
                <option value="Female">Kadın</option>
                <option value="Other">Diğer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Yaş</label>
              <input
                type="number"
                min="0"
                value={age}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setAge(e.target.value)
                }
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Telefon</label>
              <input
                required
                type="tel"
                value={phone}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPhone(e.target.value)
                }
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              />
            </div>
          </div>

          {patientSettings.showCredit && (
            <div className="mt-4">
              <label className="block text-sm font-medium">Seans Kredisi</label>
              <input
                type="number"
                min="0"
                value={credit}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setCredit(e.target.value)
                }
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              />
            </div>
          )}

          {patientSettings.showServicesReceived && (
            <div className="mt-4">
              <label className="block text-sm font-medium">Hizmet Adı</label>
              <select
                required
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              >
                <option value="">Seçiniz</option>
                {services.map((svc) => (
                  <option key={svc._id} value={svc._id}>
                    {svc.serviceName} ({svc.serviceDuration} dk)
                  </option>
                ))}
              </select>
            </div>
          )}

          {patientSettings.showPaymentStatus && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">
                  Ödeme Durumu
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                >
                  <option value="Unpaid">Ödenmedi</option>
                  <option value="Havale">Havale</option>
                  <option value="Card">Kart</option>
                  <option value="Cash">Nakit</option>
                </select>
              </div>
              {paymentMethod !== "Unpaid" && (
                <div>
                  <label className="block text-sm font-medium">
                    Ödeme Notu
                  </label>
                  <input
                    type="text"
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                  />
                </div>
              )}
            </div>
          )}

          {patientSettings.showNotes && (
            <div className="mt-4">
              <label className="block text-sm font-medium">Not</label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 p-2"
              />
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-gray-200 px-4 py-2 hover:bg-gray-300"
            >
              İptal
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-400"
            >
              Oluştur
            </button>
          </div>

          {message && (
            <p
              className={`mt-4 p-2 rounded ${
                message.startsWith("Hata")
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </div>,
    document.body
  );
}
