import React, { useState, FormEvent } from "react";
import { addWorker } from "../../api/client";
import { IWorker } from "../../types";
import { useAuth } from "../../context/AuthContext";

interface AddWorkerFormProps {
  onSuccess: (newWorker: IWorker) => void;
  onCancel: () => void;
}

export const AddWorkerForm: React.FC<AddWorkerFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { idToken, clinicId } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!idToken || !clinicId) return;

    setError(null);
    setLoading(true);

    try {
      // Payload must match addWorker’s expected shape: { email, name?, role? }
      const newWorker = await addWorker(idToken, clinicId, {
        email: email.trim(),
        name: name.trim() || undefined,
        role: role.trim() || undefined,
      });
      onSuccess(newWorker);

      // Reset form fields
      setEmail("");
      setName("");
      setRole("");
    } catch (err: unknown) {
      console.error("addWorker error:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Bilinmeyen bir hata oluştu.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 relative">
      <h2 className="text-lg font-semibold text-brand-black mb-4">
        Yeni Çalışan Ekle
      </h2>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-100 p-2 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label
            htmlFor="worker-email"
            className="block text-sm font-medium text-brand-black"
          >
            E-posta
          </label>
          <input
            id="worker-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="worker@example.com"
            className="
              mt-1 block w-full
              border border-brand-gray-300
              rounded-lg px-3 py-2
              focus:outline-none focus:ring-2 focus:ring-brand-green-300
            "
          />
        </div>

        {/* Name */}
        <div>
          <label
            htmlFor="worker-name"
            className="block text-sm font-medium text-brand-black"
          >
            İsim (isteğe bağlı)
          </label>
          <input
            id="worker-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ad Soyad"
            className="
              mt-1 block w-full
              border border-brand-gray-300
              rounded-lg px-3 py-2
              focus:outline-none focus:ring-2 focus:ring-brand-green-300
            "
          />
        </div>

        {/* Role */}
        <div>
          <label
            htmlFor="worker-role"
            className="block text-sm font-medium text-brand-black"
          >
            Rol (isteğe bağlı)
          </label>
          <input
            id="worker-role"
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Örn: Receptionist, Physiotherapist"
            className="
              mt-1 block w-full
              border border-brand-gray-300
              rounded-lg px-3 py-2
              focus:outline-none focus:ring-2 focus:ring-brand-green-300
            "
          />
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="
              px-4 py-2 rounded-lg text-sm
              bg-brand-gray-200 hover:bg-brand-gray-300
              text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-gray-300
            "
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="
              px-4 py-2 rounded-lg text-sm
              bg-brand-green-500 hover:bg-brand-green-600
              text-white focus:outline-none focus:ring-2 focus:ring-brand-green-300
            "
          >
            {loading ? "Ekleniyor..." : "Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddWorkerForm;
