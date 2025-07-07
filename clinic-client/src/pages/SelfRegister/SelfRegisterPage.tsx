import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { selfRegisterPatient } from "../../api/selfRegisterApi";
import { getClinicKvkk } from "../../api/clinicApi";
import { motion, AnimatePresence } from "framer-motion";
import {
  InformationCircleIcon,
  CheckCircleIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import logo from "../../../public/randevi-small.png";

// GENEL KVKK (her zaman gösterilecek)
const RANDEVI_KVKK_TEXT = `
Randevi Kişisel Verilerin Korunması ve İşlenmesi Politikası
Burada Randevi'nin KVKK metni yer alacaktır. Kullanıcılar bu metni her zaman okumalı ve onaylamalıdır.
`;

export default function SelfRegisterPage() {
  const { companyId, clinicId, token } = useParams();

  // Klinik KVKK state
  const [clinicKvkk, setClinicKvkk] = useState<{
    kvkkText: string;
    kvkkRequired: boolean;
  } | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [clinicKvkkAccepted, setClinicKvkkAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [showGeneralKvkk, setShowGeneralKvkk] = useState(false);
  const [showClinicKvkk, setShowClinicKvkk] = useState(false);
  const [success, setSuccess] = useState(false);

  // Klinik KVKK metnini çek
  useEffect(() => {
    if (companyId && clinicId) {
      getClinicKvkk("", companyId, clinicId)
        .then(setClinicKvkk)
        .catch(() => setClinicKvkk(null));
    }
  }, [companyId, clinicId]);

  function formatPhoneInput(value: string) {
    const onlyNumbers = value.replace(/\D/g, "").replace(/^0+/, "");
    return onlyNumbers.slice(0, 10);
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPhone(formatPhoneInput(e.target.value));
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setErrMsg(null);

    if (!name) {
      setErrMsg("Ad gereklidir.");
      return;
    }
    if (!phone || phone.length !== 10 || !phone.startsWith("5")) {
      setErrMsg(
        "Telefon numaranız 10 haneli ve 5 ile başlamalıdır (5xx xxx xx xx)."
      );
      return;
    }
    if (!kvkkAccepted) {
      setErrMsg("Randevi KVKK'sını kabul etmelisiniz.");
      return;
    }
    if (clinicKvkk?.kvkkRequired && !clinicKvkkAccepted) {
      setErrMsg("Klinik KVKK'sını kabul etmelisiniz.");
      return;
    }
    setLoading(true);
    try {
      await selfRegisterPatient(companyId!, clinicId!, token!, {
        name,
        phone: `+90${phone}`,
        kvkkAccepted,
        clinicKvkkAccepted,
      });
      setSuccess(true);
    } catch (e: any) {
      setErrMsg(e?.response?.data?.error || "Kayıt sırasında bir hata oluştu.");
    }
    setLoading(false);
  }

  // Kabul edilen KVKK’ları listele
  const acceptedConsents = [
    { label: "Randevi KVKK’sı kabul edildi.", accepted: kvkkAccepted },
    clinicKvkk?.kvkkRequired
      ? {
          label: "Klinik KVKK’sı kabul edildi.",
          accepted: clinicKvkkAccepted,
        }
      : null,
  ].filter(Boolean);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#fdf5f2] to-[#fae3da] px-2">
      <form
        onSubmit={handleRegister}
        className="relative bg-white/90 shadow-xl rounded-3xl w-full max-w-[380px] py-8 px-6 flex flex-col gap-7 border border-[#f3c0b1]/30"
        style={{ marginTop: "6vh", marginBottom: "6vh" }}
      >
        {/* Logo ve başlık */}
        <div className="flex flex-col items-center mb-1">
          <img
            src={logo}
            alt="Randevi"
            className="w-24 mb-2 "
            style={{ background: "white" }}
          />
          <h2 className="text-[1.6rem] font-bold text-[#e2725b] text-center leading-tight mb-1">
            Hoş geldiniz!
          </h2>
          <div className="text-[15px] text-[#2c373e] opacity-60 text-center font-normal -mt-1 mb-2">
            Formunuzu doldurun, hemen başlayalım!
          </div>
        </div>

        <AnimatePresence>
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.94, y: 26 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ type: "spring", duration: 0.48, bounce: 0.25 }}
              className="flex flex-col items-center gap-6"
            >
              <CheckCircleIcon className="w-16 h-16 text-[#16b47f] drop-shadow-lg" />
              <h2 className="text-[1.3rem] font-bold text-[#16b47f] text-center leading-tight mb-1">
                Kaydınız Tamamlandı!
              </h2>
              <div className="text-[15px] text-[#2c373e] opacity-90 text-center font-medium mb-1">
                Klinik kaydınız başarıyla oluşturuldu.
              </div>
              <ul className="w-full max-w-[320px] flex flex-col gap-2 mt-2 mb-4">
                {acceptedConsents.map(
                  (item: any, i) =>
                    item && (
                      <li
                        key={i}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-[15px] font-medium ${
                          item.accepted
                            ? "bg-[#f3c0b1]/20 text-[#e2725b]"
                            : "bg-[#ffe4e1]/60 text-[#b83d3a]"
                        }`}
                      >
                        <DocumentTextIcon className="w-5 h-5" />
                        {item.label}
                      </li>
                    )
                )}
              </ul>
              <button
                type="button"
                className="rounded-lg px-6 py-3 text-white font-bold text-base bg-[#e2725b] hover:bg-[#e15d2f] transition-colors shadow mt-2"
                onClick={() => (window.location.href = "/")}
              >
                Anasayfaya Dön
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.55, bounce: 0.26 }}
              className="flex flex-col gap-2"
            >
              <AnimatePresence>
                {errMsg && (
                  <motion.div
                    className="bg-[#ffe4e1] border border-[#e2725b44] text-[#b83d3a] rounded-md px-4 py-2 text-sm mb-1 flex items-center gap-2"
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.32 }}
                  >
                    <InformationCircleIcon className="w-5 h-5 text-[#e2725b]" />
                    {errMsg}
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Ad */}
              <input
                className="border border-[#ede0db] focus:border-[#e2725b] rounded-lg px-3 py-3 text-base outline-none placeholder:text-[#807e7e88] transition"
                placeholder="Adınız Soyadınız"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                disabled={loading}
              />
              {/* Telefon inputu */}
              <div className="flex items-center gap-2">
                <span className="inline-block font-semibold text-base text-[#e2725b] px-2 select-none bg-[#fdf5f2] border border-[#ede0db] rounded-l-lg h-[54px] flex items-center">
                  +90
                </span>
                <input
                  className="border border-[#ede0db] focus:border-[#e2725b] rounded-lg px-3 py-3 text-base outline-none placeholder:text-[#807e7e88] transition
                                 w-full"
                  placeholder="5xx xxx xx xx"
                  value={phone}
                  onChange={handlePhoneChange}
                  required
                  type="tel"
                  maxLength={10}
                  autoComplete="tel"
                  pattern="5[0-9]{9}"
                  disabled={loading}
                  inputMode="numeric"
                />
              </div>

              {/* Randevi KVKK */}
              <label className="flex items-center gap-2 cursor-pointer text-sm select-none mb-1">
                <input
                  type="checkbox"
                  checked={kvkkAccepted}
                  onChange={(e) => setKvkkAccepted(e.target.checked)}
                  className="accent-[#16b47f] w-5 h-5"
                  required
                  disabled={loading}
                />
                <span>
                  Randevi KVKK’sını{" "}
                  <button
                    type="button"
                    className="text-[#e2725b] underline underline-offset-2 hover:text-[#e15d2f]"
                    onClick={() => setShowGeneralKvkk(true)}
                  >
                    oku
                  </button>{" "}
                  ve kabul ediyorum.
                </span>
              </label>

              {/* Klinik KVKK */}
              {clinicKvkk?.kvkkRequired && (
                <label className="flex items-center gap-2 cursor-pointer text-sm select-none mb-1">
                  <input
                    type="checkbox"
                    checked={clinicKvkkAccepted}
                    onChange={(e) => setClinicKvkkAccepted(e.target.checked)}
                    className="accent-[#e2725b] w-5 h-5"
                    required
                    disabled={loading}
                  />
                  <span>
                    Klinik KVKK’sını{" "}
                    <button
                      type="button"
                      className="text-[#e2725b] underline underline-offset-2 hover:text-[#e15d2f]"
                      onClick={() => setShowClinicKvkk(true)}
                    >
                      oku
                    </button>{" "}
                    ve kabul ediyorum.
                  </span>
                </label>
              )}
              <button
                type="submit"
                className={`mt-2 rounded-lg py-3 font-bold text-lg shadow transition-colors ${
                  loading
                    ? "bg-[#f3c0b1] text-white"
                    : "bg-[#e2725b] text-white hover:bg-[#e15d2f]"
                }`}
                disabled={loading}
              >
                {loading ? "Kaydediliyor..." : "Kaydol"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Randevi KVKK Modal */}
        <AnimatePresence>
          {showGeneralKvkk && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-[#0005]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg mx-2 relative"
                initial={{ scale: 0.86, y: 22 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 14 }}
                transition={{ type: "spring", duration: 0.35 }}
              >
                <button
                  onClick={() => setShowGeneralKvkk(false)}
                  className="absolute top-3 right-3 text-xl font-bold text-[#e2725b] hover:text-[#e15d2f]"
                  aria-label="Kapat"
                >
                  ×
                </button>
                <div className="text-[#e2725b] font-bold mb-1 text-lg">
                  Randevi KVKK Metni
                </div>
                <div
                  className="max-h-[45vh] overflow-auto text-gray-700 text-sm whitespace-pre-line"
                  style={{ lineHeight: "1.7" }}
                >
                  {RANDEVI_KVKK_TEXT}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Klinik KVKK Modal */}
        <AnimatePresence>
          {showClinicKvkk && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-[#0005]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg mx-2 relative"
                initial={{ scale: 0.86, y: 22 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 14 }}
                transition={{ type: "spring", duration: 0.35 }}
              >
                <button
                  onClick={() => setShowClinicKvkk(false)}
                  className="absolute top-3 right-3 text-xl font-bold text-[#e2725b] hover:text-[#e15d2f]"
                  aria-label="Kapat"
                >
                  ×
                </button>
                <div className="text-[#e2725b] font-bold mb-1 text-lg">
                  Klinik KVKK Metni
                </div>
                <div
                  className="max-h-[45vh] overflow-auto text-gray-700 text-sm whitespace-pre-line"
                  style={{ lineHeight: "1.7" }}
                >
                  {clinicKvkk?.kvkkText
                    ? clinicKvkk.kvkkText
                    : "Klinik KVKK metni yüklenemedi."}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
