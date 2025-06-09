// src/components/UserOnboarding/JoinCompanyForm.tsx
import React, { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { API_BASE } from "../../../config/apiConfig";

interface JoinCompanyFormProps {
  onJoined: (companyId: string, companyName: string) => void;
}

const JoinCompanyForm: React.FC<JoinCompanyFormProps> = ({ onJoined }) => {
  const { idToken, user } = useAuth();
  const [joinCode, setJoinCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Prefill info after successful join code POST
  const [companyInfo, setCompanyInfo] = useState<null | {
    _id: string;
    name: string;
    logoUrl?: string;
  }>(null);

  // Fields to fill after join
  const [yourName, setYourName] = useState(user?.name || "");
  const [yourRole, setYourRole] = useState<"staff" | "manager" | "admin">(
    "staff"
  );

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!joinCode.trim()) {
      setMessage("Lütfen geçerli bir şirket kodu girin.");
      return;
    }
    if (!idToken) {
      setMessage("Önce giriş yapmalısınız.");
      return;
    }

    setLoading(true);
    try {
      // 1. Join company via POST
      const response = await fetch(`${API_BASE}/company/${joinCode}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ joinCode: joinCode.trim() }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        setMessage(errData.error ?? "Bilinmeyen bir hata oluştu.");
        setLoading(false);
        return;
      }

      // 2. Fetch company info (for prefill UI)
      const infoRes = await fetch(`${API_BASE}/company/${joinCode}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      if (!infoRes.ok) throw new Error("Şirket bilgileri alınamadı.");
      const info = await infoRes.json();

      setCompanyInfo({
        _id: info._id,
        name: info.name,
        logoUrl: info.logoUrl || undefined,
      });

      // Optionally, prefill user's name from auth
      setYourName(user?.name || "");
      setYourRole("staff");
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Ağ hatası oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Submit additional user info after prefill
  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyInfo || !idToken) return;

    setLoading(true);
    setMessage(null);
    try {
      // POST to add/update user as employee with details
      const response = await fetch(`${API_BASE}/company/employees`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          name: yourName,
          role: yourRole,
          email: user?.email,
          // ...any other info
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        setMessage(err.error ?? "Personel kaydı başarısız.");
        setLoading(false);
        return;
      }

      // Success!
      onJoined(companyInfo._id, companyInfo.name);
    } catch (err: any) {
      setMessage(err.message ?? "Bilinmeyen bir hata.");
    } finally {
      setLoading(false);
    }
  };

  // -------------- RENDER --------------
  if (companyInfo) {
    // Step 2: After join, show summary & let user fill info
    return (
      <form
        onSubmit={handleFinish}
        className="space-y-4 p-4 bg-white rounded-lg shadow"
      >
        <div className="flex flex-col items-center gap-2">
          {companyInfo.logoUrl && (
            <img
              src={companyInfo.logoUrl}
              alt="Logo"
              className="h-16 w-16 rounded-full shadow mb-2"
            />
          )}
          <div className="text-lg font-semibold">{companyInfo.name}</div>
          <div className="text-xs text-gray-500">Katılmak üzeresiniz</div>
        </div>

        <div>
          <label className="block text-sm font-medium">Adınız</label>
          <input
            type="text"
            value={yourName}
            onChange={(e) => setYourName(e.target.value)}
            placeholder="Adınız"
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Rolünüz</label>
          <select
            value={yourRole}
            onChange={(e) => setYourRole(e.target.value as any)}
            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-300"
          >
            <option value="staff">Personel</option>
            <option value="manager">Yönetici</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {message && (
          <p className="text-sm p-2 rounded-md bg-red-100 text-red-700">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-green-400 hover:bg-brand-green-500 text-white font-medium px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-green-300 disabled:opacity-50"
        >
          {loading ? "Kaydediliyor..." : "Tamamla ve Katıl"}
        </button>
      </form>
    );
  }

  // Step 1: Initial join code entry
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

export default JoinCompanyForm;
