// src/components/UserOnboarding/CreateClinicForm.tsx

import React, { useState, FormEvent } from "react";
import { useAuth } from "../../context/AuthContext";
import { createClinic } from "../../api/client";

interface CreateClinicFormProps {
  onCreated: (clinicId: string, clinicName: string) => void;
}

const CreateClinicForm: React.FC<CreateClinicFormProps> = ({ onCreated }) => {
  const { idToken } = useAuth();
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!name.trim()) {
      setMessage("Klinik adı boş olamaz.");
      return;
    }
    if (!idToken) {
      setMessage("Önce giriş yapmalısınız.");
      return;
    }

    try {
      // Assume `createClinic` returns an object { _id, name, ownerEmail, workers }
      const newClinic = await createClinic(idToken, name.trim());
      onCreated(newClinic._id, newClinic.name);
    } catch (err: unknown) {
      console.error(err);
      setMessage(
        "Hata: " + (err instanceof Error ? err.message : "Bilinmeyen")
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-white rounded-lg shadow"
    >
      <h2 className="text-lg font-semibold">Yeni Klinik Oluştur</h2>

      <div>
        <label
          htmlFor="clinic-name"
          className="block text-sm font-medium text-brand-black"
        >
          Klinik Adı
        </label>
        <input
          id="clinic-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Klinik adı"
          className="
            mt-1 block w-full border border-brand-gray-300 rounded-lg
            px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-green-300
          "
          required
        />
      </div>

      {message && (
        <p className="text-sm p-2 rounded-md bg-red-100 text-red-700">
          {message}
        </p>
      )}

      <button
        type="submit"
        className="
          w-full bg-brand-green-300 hover:bg-brand-green-400
          text-white font-medium
          px-4 py-2 rounded-full
          focus:outline-none focus:ring-2 focus:ring-brand-green-300
        "
      >
        Oluştur
      </button>
    </form>
  );
};

export default CreateClinicForm;
