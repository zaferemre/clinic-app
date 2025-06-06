// src/components/AddPatient/AddPatient.tsx

import React, { useState, ChangeEvent, FormEvent } from "react";
import { createPatient } from "../../api/client";

interface AddPatientProps {
  idToken: string;
  clinicId: string;
}

const AddPatient: React.FC<AddPatientProps> = ({ idToken, clinicId }) => {
  const [name, setName] = useState<string>("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [age, setAge] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [credit, setCredit] = useState<string>("0");
  const [serviceName, setServiceName] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<
    "Unpaid" | "Havale" | "Card" | "Cash"
  >("Unpaid");
  const [paymentNote, setPaymentNote] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");

    // Build the payload, making sure that `method` is the exact union type
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

    // If the user entered a service name, add one object into `services[]`
    if (serviceName.trim()) {
      payload.services.push({
        name: serviceName.trim(),
        // you can set default pointsLeft or sessionsTaken here if needed
      });
    }

    // If paymentMethod is not "Unpaid", push a record into `paymentHistory[]`
    if (paymentMethod !== "Unpaid") {
      payload.paymentHistory.push({
        date: new Date().toISOString(),
        method: paymentMethod, // now TS knows this is one of the four allowed strings
        amount: 0, // you could ask the user to input an actual amount if needed
        note: paymentNote.trim(),
      });
    }

    try {
      const newPatient = await createPatient(idToken, clinicId, payload);
      setMessage(`Hasta başarıyla eklendi: ${newPatient._id}`);

      // Clear the form fields
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
    <div className="w-full bg-white rounded-xl shadow p-6 max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* İsim */}
        <div>
          <label
            htmlFor="patient-name"
            className="block text-sm font-medium text-brand-black"
          >
            İsim
          </label>
          <input
            id="patient-name"
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
            placeholder="Tam isim"
          />
        </div>

        {/* Cinsiyet */}
        <div>
          <label
            htmlFor="patient-gender"
            className="block text-sm font-medium text-brand-black"
          >
            Cinsiyet
          </label>
          <select
            id="patient-gender"
            value={gender}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setGender(e.target.value as "Male" | "Female" | "Other")
            }
            className="
              mt-1 block w-full
              border border-brand-gray-300 
              rounded-lg 
              px-3 py-2 
              focus:outline-none focus:ring-2 focus:ring-brand-green-300
            "
          >
            <option value="Male">Erkek</option>
            <option value="Female">Kadın</option>
            <option value="Other">Diğer</option>
          </select>
        </div>

        {/* Yaş */}
        <div>
          <label
            htmlFor="patient-age"
            className="block text-sm font-medium text-brand-black"
          >
            Yaş
          </label>
          <input
            id="patient-age"
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

        {/* Telefon */}
        <div>
          <label
            htmlFor="patient-phone"
            className="block text-sm font-medium text-brand-black"
          >
            Telefon
          </label>
          <input
            id="patient-phone"
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

        {/* Kredi */}
        <div>
          <label
            htmlFor="patient-credit"
            className="block text-sm font-medium text-brand-black"
          >
            Kredi
          </label>
          <input
            id="patient-credit"
            type="number"
            min="0"
            className="
              mt-1 block w-full
              border border-brand-gray-300 
              rounded-lg 
              px-3 py-2 
              focus:outline-none focus:ring-2 focus:ring-brand-green-300
            "
            value={credit}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setCredit(e.target.value)
            }
            placeholder="0"
          />
        </div>

        {/* Hizmet Adı */}
        <div>
          <label
            htmlFor="service-name"
            className="block text-sm font-medium text-brand-black"
          >
            Hizmet Adı
          </label>
          <input
            id="service-name"
            type="text"
            className="
              mt-1 block w-full
              border border-brand-gray-300 
              rounded-lg 
              px-3 py-2 
              focus:outline-none focus:ring-2 focus:ring-brand-green-300
            "
            value={serviceName}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setServiceName(e.target.value)
            }
            placeholder="Örneğin: Fizik Tedavi"
          />
        </div>

        {/* Ödeme Durumu */}
        <div>
          <label
            htmlFor="payment-method"
            className="block text-sm font-medium text-brand-black"
          >
            Ödeme Durumu
          </label>
          <select
            id="payment-method"
            value={paymentMethod}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setPaymentMethod(
                e.target.value as "Unpaid" | "Havale" | "Card" | "Cash"
              )
            }
            className="
              mt-1 block w-full
              border border-brand-gray-300 
              rounded-lg 
              px-3 py-2 
              focus:outline-none focus:ring-2 focus:ring-brand-green-300
            "
          >
            <option value="Unpaid">Ödenmedi</option>
            <option value="Havale">Havale</option>
            <option value="Card">Kart</option>
            <option value="Cash">Nakit</option>
          </select>
        </div>

        {/* Ödeme Notu */}
        {paymentMethod !== "Unpaid" && (
          <div>
            <label
              htmlFor="payment-note"
              className="block text-sm font-medium text-brand-black"
            >
              Ödeme Notu
            </label>
            <input
              id="payment-note"
              type="text"
              className="
                mt-1 block w-full
                border border-brand-gray-300 
                rounded-lg 
                px-3 py-2 
                focus:outline-none focus:ring-2 focus:ring-brand-green-300
              "
              value={paymentNote}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPaymentNote(e.target.value)
              }
              placeholder="Ödeme ile ilgili not (örneğin dekont numarası)"
            />
          </div>
        )}

        {/* Not */}
        <div>
          <label
            htmlFor="patient-note"
            className="block text-sm font-medium text-brand-black"
          >
            Not
          </label>
          <textarea
            id="patient-note"
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
            placeholder="Ek bilgi (alerjiler, yorumlar vb.)"
          />
        </div>

        {/* İşlem Sonucu Mesajı */}
        {message && (
          <div
            className={`
              text-sm p-2 rounded-md
              ${
                message.startsWith("Hata")
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }
            `}
          >
            {message}
          </div>
        )}

        {/* Gönder Butonu */}
        <div>
          <button
            type="submit"
            className="
              w-full text-center
              bg-brand-green-500 hover:bg-brand-green-600
              text-white font-medium
              px-4 py-2 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-brand-green-300
            "
          >
            Hasta Oluştur
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPatient;
