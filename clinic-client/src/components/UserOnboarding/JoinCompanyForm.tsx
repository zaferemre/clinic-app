// src/UserOnboarding/JoinCompanyForm.tsx
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { joinCompanyByCode } from "../../api/companyApi";

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
      const res = await joinCompanyByCode(idToken, joinCode.trim());
      onJoined(res.companyId, res.companyName);
      setJoinCode("");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Şirket katılımı başarısız.";
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleJoin}
      className="space-y-4 p-4 bg-white rounded-lg shadow"
    >
      <h2 className="text-lg font-semibold text-brand-main">Şirkete Katıl</h2>
      <div>
        <label htmlFor="joinCode" className="block text-sm font-semibold">
          Şirket Kodu
        </label>
        <input
          id="joinCode"
          type="text"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          className="mt-1 block w-full border rounded-xl px-3 py-2"
          required
        />
      </div>
      {message && <div className="text-red-500">{message}</div>}
      <button
        type="submit"
        className="bg-brand-main text-white px-4 py-2 rounded-xl w-full font-semibold"
        disabled={loading}
      >
        {loading ? "Katılıyor..." : "Katıl"}
      </button>
    </form>
  );
};

export default JoinCompanyForm;
