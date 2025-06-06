import React, { useState, ChangeEvent, FormEvent } from "react";
import { createPatient } from "../../api/client";

interface AddPatientProps {
  idToken: string;
  clinicId: string;
}

export default function AddPatient({ idToken, clinicId }: AddPatientProps) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [credit, setCredit] = useState("0");
  const [serviceName, setServiceName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "Unpaid" | "Havale" | "Card" | "Cash"
  >("Unpaid");
  const [paymentNote, setPaymentNote] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");

    const payload: {
      name: string;
      gender: "Male" | "Female" | "Other";
      age?: number;
      phone: string;
      credit: number;
      services: { name: string; pointsLeft?: number; sessionsTaken?: number }[];
      paymentHistory: {
        date: string;
        method: "Unpaid" | "Havale" | "Card" | "Cash";
        amount: number;
        note: string;
      }[];
      note?: string;
    } = {
      name: name.trim(),
      gender,
      age: age ? Number(age) : undefined,
      phone: phone.trim(),
      credit: Number(credit) || 0,
      services: [],
      paymentHistory: [],
      note: note.trim() || undefined,
    };

    if (serviceName.trim()) {
      payload.services.push({ name: serviceName.trim() });
    }

    if (paymentMethod !== "Unpaid") {
      payload.paymentHistory.push({
        date: new Date().toISOString(),
        method: paymentMethod,
        amount: 0,
        note: paymentNote.trim(),
      });
    }

    try {
      const newPatient = await createPatient(idToken, clinicId, payload);
      setMessage(`Hasta başarıyla eklendi: ${newPatient._id}`);

      // Clear fields
      setName("");
      setGender("Male");
      setAge("");
      setPhone("");
      setCredit("0");
      setServiceName("");
      setPaymentMethod("Unpaid");
      setPaymentNote("");
      setNote("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err);
        setMessage("Hata: " + (err.message || "Bilinmeyen hata oluştu."));
      } else {
        console.error("Bilinmeyen hata:", err);
        setMessage("Hata: Bilinmeyen hata oluştu.");
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className=" bg-white rounded-lg shadow p-8 max-w-2xl mx-auto mb-12"
    >
      {/* Section: Patient Details */}
      <div className="border-b border-gray-900/10 pb-6">
        <h2 className="text-base font-semibold text-gray-900">
          Yeni Hasta Oluştur
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
          {/* Name */}
          <div className="sm:col-span-4">
            <label
              htmlFor="patient-name"
              className="block text-sm font-medium text-gray-900"
            >
              İsim
            </label>
            <div className="mt-2">
              <input
                id="patient-name"
                type="text"
                required
                placeholder="Tam isim"
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 placeholder:text-gray-400 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-brand-red-300 sm:text-sm"
              />
            </div>
          </div>

          {/* Gender */}
          <div className="sm:col-span-2">
            <label
              htmlFor="patient-gender"
              className="block text-sm font-medium text-gray-900"
            >
              Cinsiyet
            </label>
            <div className="mt-2">
              <select
                id="patient-gender"
                value={gender}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setGender(e.target.value as any)
                }
                className="block w-full rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-brand-red-300 sm:text-sm"
              >
                <option value="Male">Erkek</option>
                <option value="Female">Kadın</option>
                <option value="Other">Diğer</option>
              </select>
            </div>
          </div>

          {/* Age */}
          <div className="sm:col-span-2">
            <label
              htmlFor="patient-age"
              className="block text-sm font-medium text-gray-900"
            >
              Yaş
            </label>
            <div className="mt-2">
              <input
                id="patient-age"
                type="number"
                min="0"
                placeholder="Yaş"
                value={age}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setAge(e.target.value)
                }
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 placeholder:text-gray-400 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-brand-red-300 sm:text-sm"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="sm:col-span-3">
            <label
              htmlFor="patient-phone"
              className="block text-sm font-medium text-gray-900"
            >
              Telefon
            </label>
            <div className="mt-2">
              <input
                id="patient-phone"
                type="text"
                placeholder="(555) 123-4567"
                value={phone}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPhone(e.target.value)
                }
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 placeholder:text-gray-400 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-brand-red-300 sm:text-sm"
              />
            </div>
          </div>

          {/* Credit */}
          <div className="sm:col-span-3">
            <label
              htmlFor="patient-credit"
              className="block text-sm font-medium text-gray-900"
            >
              Kredi
            </label>
            <div className="mt-2">
              <input
                id="patient-credit"
                type="number"
                min="0"
                placeholder="0"
                value={credit}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setCredit(e.target.value)
                }
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 placeholder:text-gray-400 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-brand-red-300 sm:text-sm"
              />
            </div>
          </div>

          {/* Service Name */}
          <div className="col-span-full">
            <label
              htmlFor="service-name"
              className="block text-sm font-medium text-gray-900"
            >
              Hizmet Adı
            </label>
            <div className="mt-2">
              <input
                id="service-name"
                type="text"
                placeholder="Örneğin: Fizik Tedavi"
                value={serviceName}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setServiceName(e.target.value)
                }
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 placeholder:text-gray-400 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-brand-red-300 sm:text-sm"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="sm:col-span-3">
            <label
              htmlFor="payment-method"
              className="block text-sm font-medium text-gray-900"
            >
              Ödeme Durumu
            </label>
            <div className="mt-2">
              <select
                id="payment-method"
                value={paymentMethod}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setPaymentMethod(e.target.value as any)
                }
                className="block w-full rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-brand-red-300 sm:text-sm"
              >
                <option value="Unpaid">Ödenmedi</option>
                <option value="Havale">Havale</option>
                <option value="Card">Kart</option>
                <option value="Cash">Nakit</option>
              </select>
            </div>
          </div>

          {/* Payment Note (conditional) */}
          {paymentMethod !== "Unpaid" && (
            <div className="sm:col-span-3">
              <label
                htmlFor="payment-note"
                className="block text-sm font-medium text-gray-900"
              >
                Ödeme Notu
              </label>
              <div className="mt-2">
                <input
                  id="payment-note"
                  type="text"
                  placeholder="Ödeme ile ilgili not (örneğin dekont numarası)"
                  value={paymentNote}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setPaymentNote(e.target.value)
                  }
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 placeholder:text-gray-400 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-brand-red-300 sm:text-sm"
                />
              </div>
            </div>
          )}

          {/* Note */}
          <div className="col-span-full">
            <label
              htmlFor="patient-note"
              className="block text-sm font-medium text-gray-900"
            >
              Not
            </label>
            <div className="mt-2">
              <textarea
                id="patient-note"
                rows={3}
                placeholder="Ek bilgi (alerjiler, yorumlar vb.)"
                value={note}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setNote(e.target.value)
                }
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 placeholder:text-gray-400 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-brand-red-300 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section: Message & Submit */}
      <div className="pt-6">
        {message && (
          <div
            className={`text-sm p-4 rounded-md ${
              message.startsWith("Hata")
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message}
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => {
              // Optionally clear form or navigate back
            }}
            className="text-sm font-medium text-gray-900"
          >
            İptal
          </button>
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Hasta Oluştur
          </button>
        </div>
      </div>
    </form>
  );
}
