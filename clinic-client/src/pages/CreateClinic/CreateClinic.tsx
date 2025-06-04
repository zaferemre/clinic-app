// src/pages/CreateClinic.tsx
import React, { useState, FormEvent } from "react";
import { Button } from "../../components/Button/Button";

interface CreateClinicProps {
  idToken: string;
  setClinicId: (id: string) => void;
}

const CreateClinicPage: React.FC<CreateClinicProps> = ({
  idToken,
  setClinicId,
}) => {
  const [name, setName] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!name.trim()) {
      setMessage("Lütfen geçerli bir klinik adı girin.");
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/clinic/new`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ name: name.trim() }),
        }
      );
      const data = await res.json();

      if (res.status === 409 && data.clinic) {
        setClinicId(data.clinic._id);
        return;
      }
      if (!res.ok) {
        throw new Error(data.error ?? "Bilinmeyen hata");
      }
      setClinicId(data._id);
    } catch (err: unknown) {
      console.error("Create clinic failed:", err);
      if (err instanceof Error) {
        setMessage("Klinik oluşturulamadı: " + err.message);
      } else {
        setMessage("Klinik oluşturulamadı: Bilinmeyen hata");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-brand-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-lg shadow-md p-6"
      >
        <label
          htmlFor="clinic-name"
          className="block mb-2 font-medium text-brand-black"
        >
          Klinik Adı
        </label>
        <input
          id="clinic-name"
          type="text"
          className="w-full px-3 py-2 border border-brand-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-300 mb-2"
          placeholder="Örneğin: Test Klinik"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setName(e.target.value)
          }
        />
        {message && <p className="text-error text-sm italic mb-2">{message}</p>}

        <Button type="submit" variant="primary" fullWidth>
          Oluştur
        </Button>
      </form>
    </div>
  );
};

export default CreateClinicPage;
