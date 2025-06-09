// src/components/AddPatient.tsx
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { createPatient } from "../../api/patientApi";
import { API_BASE } from "../../config/apiConfig";
import { PatientSettings } from "../Settings/PatientSettingsModal";

interface AddPatientProps {
  idToken: string;
  companyId: string;
}

interface Service {
  _id: string;
  serviceName: string;
  serviceDuration: number;
}

export default function AddPatient({ idToken, companyId }: AddPatientProps) {
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");

    const payload: any = {
      name: name.trim(),
      gender,
      age: age ? Number(age) : undefined,
      phone: phone.trim(), // always required
      credit: patientSettings.showCredit ? Number(credit) || 0 : undefined,
      services: patientSettings.showServicesReceived ? [] : undefined,
      paymentHistory: patientSettings.showPaymentStatus ? [] : undefined,
      note: patientSettings.showNotes ? note.trim() || undefined : undefined,
    };

    // add service entry if enabled
    if (patientSettings.showServicesReceived && serviceId && services.length) {
      const svc = services.find((s) => s._id === serviceId);
      if (svc) payload.services.push({ name: svc.serviceName });
    }

    // add payment history entry if enabled
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
      // reset form
      setName("");
      setGender("Male");
      setAge("");
      setPhone("");
      setCredit("0");
      setServiceId("");
      setPaymentMethod("Unpaid");
      setPaymentNote("");
      setNote("");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Bilinmeyen hata oluştu.";
      console.error(err);
      setMessage(`Hata: ${msg}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-lg shadow p-8 max-w-2xl mx-auto mb-12 "
    >
      <h2 className="text-lg font-semibold mb-4">Yeni Müşteri Oluştur</h2>

      {/* Name, Gender, Age, Phone (always) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-md ">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium">İsim</label>
          <input
            required
            type="text"
            value={name}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setName(e.target.value)
            }
            className="mt-1 block w-full rounded-md border border-blue-200"
          />
        </div>
        {/* Gender */}
        <div>
          <label className="block text-sm font-medium">Cinsiyet</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as any)}
            className="mt-1 block w-full  border border-blue-200 rounded-md"
          >
            <option value="Male">Erkek</option>
            <option value="Female">Kadın</option>
            <option value="Other">Diğer</option>
          </select>
        </div>
        {/* Age */}
        <div>
          <label className="block text-sm font-medium">Yaş</label>
          <input
            type="number"
            min="0"
            value={age}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setAge(e.target.value)
            }
            className="mt-1 block w-full  border border-blue-200 rounded-md "
          />
        </div>
        {/* Phone */}
        <div>
          <label className="block text-sm font-medium">Telefon</label>
          <input
            required
            type="tel"
            value={phone}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setPhone(e.target.value)
            }
            className="mt-1 block w-full rounded-md  border border-blue-200"
          />
        </div>
      </div>

      {/* Credit */}
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
            className="mt-1 block w-full rounded-md border border-blue-200"
          />
        </div>
      )}

      {/* Services */}
      {patientSettings.showServicesReceived && (
        <div className="mt-4">
          <label className="block text-sm font-medium">Hizmet Adı</label>
          <select
            required
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className="mt-1 block w-full rounded-md border border-blue-200"
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

      {/* Payment Status */}
      {patientSettings.showPaymentStatus && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Ödeme Durumu</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="mt-1 block w-full rounded-md border-gray-300"
            >
              <option value="Unpaid">Ödenmedi</option>
              <option value="Havale">Havale</option>
              <option value="Card">Kart</option>
              <option value="Cash">Nakit</option>
            </select>
          </div>
          {paymentMethod !== "Unpaid" && (
            <div>
              <label className="block text-sm font-medium">Ödeme Notu</label>
              <input
                type="text"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300"
              />
            </div>
          )}
        </div>
      )}

      {/* Note */}
      {patientSettings.showNotes && (
        <div className="mt-4">
          <label className="block text-sm font-medium">Not</label>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-1 block w-full rounded-md border border-blue-200"
          />
        </div>
      )}

      {/* Submit */}
      <div className="mt-6 flex justify-end space-x-4">
        <button
          type="submit"
          onClick={handleSubmit}
          className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-400"
        >
          Oluştur
        </button>
        <button
          type="button"
          onClick={() => {
            /* optionally clear/navigate */
          }}
          className="rounded-md bg-gray-200 px-4 py-2 hover:bg-gray-300"
        >
          İptal
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
  );
}
