// src/components/UserOnboarding/JoinCompanyForm.tsx

import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getCompanyById, addEmployee } from "../../api/companyApi";

interface JoinCompanyFormProps {
  onJoined: (companyId: string, companyName: string) => void;
}

const JoinCompanyForm: React.FC<JoinCompanyFormProps> = ({ onJoined }) => {
  const { idToken, user } = useAuth();
  const [joinCode, setJoinCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [companyInfo, setCompanyInfo] = useState<null | {
    _id: string;
    name: string;
    logoUrl?: string;
  }>(null);

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
      const res = await fetch(`/company/${joinCode}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ joinCode: joinCode.trim() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setMessage(err.error ?? "Bilinmeyen bir hata oluştu.");
        return;
      }

      const info = await getCompanyById(idToken, joinCode);
      setCompanyInfo({
        _id: (info as any)._id ?? "",
        name: info.name,
        logoUrl: (info as any).logoUrl,
      });
      setYourName(user?.name || "");
      setYourRole("staff");
    } catch (err: any) {
      setMessage(err.message ?? "Ağ hatası oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyInfo || !idToken) return;

    setLoading(true);
    setMessage(null);
    try {
      await addEmployee(idToken, companyInfo._id, {
        email: user?.email!,
        name: yourName,
        role: yourRole,
        pictureUrl: (user as any)?.picture,
      });
      onJoined(companyInfo._id, companyInfo.name);
    } catch (err: any) {
      setMessage(err.message ?? "Personel kaydı başarısız.");
    } finally {
      setLoading(false);
    }
  };

  if (companyInfo) {
    return (
      <form
        onSubmit={handleFinish}
        className="space-y-4 p-4 bg-white rounded-lg shadow"
      >
        <div className="flex items-center space-x-2">
          {companyInfo.logoUrl && (
            <img
              src={companyInfo.logoUrl}
              alt="Logo"
              className="w-10 h-10 rounded-full"
            />
          )}
          <span className="font-bold">{companyInfo.name}</span>
        </div>
        <div>
          <label className="block text-sm font-medium">Adınız</label>
          <input
            type="text"
            value={yourName}
            onChange={(e) => setYourName(e.target.value)}
            className="mt-1 block w-full border rounded px-2 py-1"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Rolünüz</label>
          <select
            value={yourRole}
            onChange={(e) =>
              setYourRole(e.target.value as "staff" | "manager" | "admin")
            }
            className="mt-1 block w-full border rounded px-2 py-1"
          >
            <option value="staff">Personel</option>
            <option value="manager">Yönetici</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {message && <div className="text-red-500">{message}</div>}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Kaydediliyor..." : "Kaydı Tamamla"}
        </button>
      </form>
    );
  }

  // Show join form if not joined yet
  return (
    <form
      onSubmit={handleJoin}
      className="space-y-4 p-4 bg-white rounded-lg shadow"
    >
      <div>
        <label className="block text-sm font-medium">Şirket Kodu</label>
        <input
          type="text"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          className="mt-1 block w-full border rounded px-2 py-1"
          required
        />
      </div>
      {message && <div className="text-red-500">{message}</div>}
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Katılıyor..." : "Katıl"}
      </button>
    </form>
  );
};

export default JoinCompanyForm;
