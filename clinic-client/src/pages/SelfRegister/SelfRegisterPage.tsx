import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { selfRegisterPatient } from "../../api/selfRegisterApi";
import { getClinicKvkk } from "../../api/clinicApi";

export default function SelfRegisterPage() {
  const { companyId, clinicId, token } = useParams();
  const navigate = useNavigate();

  const [kvkk, setKvkk] = useState<{
    kvkkText: string;
    kvkkRequired: boolean;
  } | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [clinicKvkkAccepted, setClinicKvkkAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (companyId && clinicId) {
      getClinicKvkk("", companyId, clinicId)
        .then(setKvkk)
        .catch(() => {});
    }
  }, [companyId, clinicId]);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !phone) {
      alert("Ad ve telefon gereklidir.");
      return;
    }
    if (!kvkkAccepted) {
      alert("Kayda devam etmek için KVKK'yı kabul etmelisiniz.");
      return;
    }
    if (kvkk?.kvkkRequired && !clinicKvkkAccepted) {
      alert("Klinik sözleşmesini kabul etmelisiniz.");
      return;
    }
    setLoading(true);
    try {
      await selfRegisterPatient(companyId!, clinicId!, token!, {
        name,
        phone,
        email,
        kvkkAccepted,
        clinicKvkkAccepted,
      });
      alert("Kaydınız alınmıştır!");
      navigate("/");
    } catch (e: any) {
      alert(e?.response?.data?.error || "Kayıt sırasında bir hata oluştu.");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#fae3da] to-[#fdf5f2] px-4">
      <form
        onSubmit={handleRegister}
        className="bg-white shadow-lg rounded-xl w-full max-w-sm p-6 flex flex-col gap-4"
        style={{ marginTop: "10vh", marginBottom: "10vh" }}
      >
        <h2 className="text-2xl font-bold text-center mb-2">
          Hasta Kendi Kaydı
        </h2>
        <input
          className="border rounded-lg px-3 py-3 text-base outline-accent"
          placeholder="Adınız Soyadınız"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          className="border rounded-lg px-3 py-3 text-base outline-accent"
          placeholder="Telefon Numaranız"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          type="tel"
          maxLength={20}
        />
        <input
          className="border rounded-lg px-3 py-3 text-base outline-accent"
          placeholder="E-posta (isteğe bağlı)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
        />

        {/* KVKK checkbox */}
        <label className="flex items-center gap-2 cursor-pointer text-sm">
          <input
            type="checkbox"
            checked={kvkkAccepted}
            onChange={(e) => setKvkkAccepted(e.target.checked)}
            className="accent-[#16b47f] w-5 h-5"
            required
          />
          <span>KVKK’yı okudum, kabul ediyorum.</span>
        </label>

        {/* Klinik KVKK checkbox (varsa) */}
        {kvkk?.kvkkRequired && (
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={clinicKvkkAccepted}
              onChange={(e) => setClinicKvkkAccepted(e.target.checked)}
              className="accent-[#e2725b] w-5 h-5"
              required
            />
            <span>Klinik sözleşmesini okudum, kabul ediyorum.</span>
          </label>
        )}

        <button
          type="submit"
          className={`mt-2 rounded-lg py-3 font-bold text-white transition ${
            loading ? "bg-gray-300" : "bg-accent hover:bg-[#e15d2f]"
          }`}
          disabled={loading}
        >
          {loading ? "Kaydediliyor..." : "Kaydol"}
        </button>
      </form>
    </div>
  );
}
