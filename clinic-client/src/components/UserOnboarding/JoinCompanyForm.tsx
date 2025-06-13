import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getCompanyById, joinCompany } from "../../api/companyApi";

interface JoinCompanyFormProps {
  onJoined: (companyId: string, companyName: string) => void;
}

const JoinCompanyForm: React.FC<JoinCompanyFormProps> = ({ onJoined }) => {
  const { idToken } = useAuth();
  const [joinCode, setJoinCode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      // Try to join the company via backend
      await joinCompany(idToken, joinCode.trim());

      // Fetch company info for UI update
      const company = await getCompanyById(idToken, joinCode.trim());
      onJoined(company._id, company.name);
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "message" in err &&
        typeof (err as { message?: unknown }).message === "string"
      ) {
        setMessage((err as { message: string }).message);
      } else {
        setMessage("Şirket katılımı başarısız.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleJoin}
      className="space-y-4 p-4 bg-white rounded-lg shadow"
    >
      <h2 className="text-lg font-semibold">Şirkete Katıl</h2>
      <div>
        <label htmlFor="joinCode" className="block text-sm font-medium">
          Şirket Kodu
        </label>
        <input
          id="joinCode"
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
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        disabled={loading}
      >
        {loading ? "Katılıyor..." : "Katıl"}
      </button>
    </form>
  );
};

export default JoinCompanyForm;
