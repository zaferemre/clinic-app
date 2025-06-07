// src/components/UserOnboarding/JoinCompanyForm.tsx
import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext.tsx";
import { API_BASE } from "../../config/apiConfig.ts";

interface JoinCompanyFormProps {
  onJoined: (companyId: string, companyName: string) => void;
}

export const JoinCompanyForm: React.FC<JoinCompanyFormProps> = ({
  onJoined,
}) => {
  const { idToken } = useAuth();
  const [joinCode, setJoinCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const code = joinCode.trim();
    if (!code) {
      setMessage("Lütfen geçerli bir şirket kodu girin.");
      return;
    }
    if (!idToken) {
      setMessage("Önce giriş yapmalısınız.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/company/${code}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ joinCode: code }),
      });

      if (response.ok) {
        const data = await response.json();
        onJoined(data.companyId, data.companyName);
      } else {
        const errData = await response.json().catch(() => ({}));
        setMessage(errData.error ?? "Bilinmeyen bir hata oluştu.");
      }
    } catch (err: unknown) {
      console.error("Join company failed:", err);
      setMessage(
        err instanceof Error
          ? err.message ?? "Ağ hatası oluştu."
          : "Ağ hatası oluştu."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleJoin}
      className="space-y-4 p-4 bg-white rounded-lg shadow"
    >
      <h2 className="text-lg font-semibold">Şirket Kodu ile Katıl</h2>

      <div>
        <label htmlFor="join-code" className="block text-sm font-medium">
          Şirket Kodu
        </label>
        <input
          id="join-code"
          type="text"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          placeholder="Örn: 683f50b012d1c1aff4d9a610"
          className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
          required
        />
      </div>

      {message && (
        <p
          className={`text-sm p-2 rounded-md ${
            message.includes("başarı")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand-green-300 hover:bg-brand-green-400 text-white font-medium px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-green-300 disabled:opacity-50"
      >
        {loading ? "Katılıyor..." : "Katıl"}
      </button>
    </form>
  );
};
