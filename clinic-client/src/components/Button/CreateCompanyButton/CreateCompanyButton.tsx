// src/components/Button/CreateCompanyButton/CreateCompanyButton.tsx
import { useState, useRef } from "react";
import {
  BuildingOffice2Icon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import AppModal, { ModalForm } from "../../Modals/AppModal";
import { useAuth } from "../../../contexts/AuthContext";
import { createCompany, CreateCompanyPayload } from "../../../api/companyApi";

interface Props {
  onCreated: (companyId: string, companyName: string) => void;
}

export default function CreateCompanyButton({ onCreated }: Props) {
  const { idToken } = useAuth();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [error, setError] = useState<string | null>(null);

  // stash the newly created company so onSuccess can fire onCreated()
  const createdRef = useRef<{ id: string; name: string } | null>(null);

  const handleSubmit = async (): Promise<boolean> => {
    if (!name.trim()) {
      setError("Şirket adı zorunlu.");
      return false;
    }
    if (!idToken) {
      setError("Giriş yapmanız gerekiyor.");
      return false;
    }
    setError(null);
    const payload: CreateCompanyPayload = {
      name,
      websiteUrl: websiteUrl || undefined,
      socialLinks:
        instagram || facebook || whatsapp
          ? { instagram, facebook, whatsapp }
          : undefined,
      settings: {
        allowPublicBooking: true,
        inactivityThresholdDays: 60,
      },
    };

    try {
      const result = await createCompany(idToken, payload);
      createdRef.current = { id: result._id, name: result.name };
      return true;
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message || "Oluşturma başarısız oldu."
          : "Oluşturma başarısız oldu."
      );
      return false;
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="
          w-full h-[170px] flex flex-col items-center justify-center
          rounded-2xl bg-gradient-to-br from-brand-main/95 to-brand-main/80
          text-white shadow-md font-semibold text-lg
          hover:scale-105 active:scale-95 transition-all
          border border-white/30
        "
      >
        <BuildingOffice2Icon className="w-12 h-12 mb-2 text-white opacity-90" />
        <div className="text-xl font-bold mb-1">Şirket Oluştur</div>
      </button>

      <AppModal
        open={open}
        onClose={() => setOpen(false)}
        title="Yeni Şirket Oluştur"
        onSuccess={() => {
          const created = createdRef.current;
          if (created) onCreated(created.id, created.name);
          setOpen(false);
        }}
      >
        <ModalForm onSubmit={handleSubmit}>
          <div className="space-y-6 p-8 max-w-lg mx-auto bg-white rounded-2xl shadow-lg">
            {/* Welcome Header */}
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-brand-main">
                👋 Hoşgeldiniz!
              </h2>
              <p className="text-gray-700 mt-2">
                İlk şirketinizi oluştururken sadece gerekli bilgileri soracağız.
                Diğer ayarları daha sonra <strong>Şirket Ayarları</strong>{" "}
                bölümünden değiştirebilirsiniz.
              </p>
            </div>

            {error && (
              <div className="text-red-700 bg-red-100 border border-red-200 p-2 rounded mb-2">
                {error}
              </div>
            )}

            {/* Company Name */}
            <div>
              <label htmlFor="companyName" className="block mb-1 font-medium">
                Şirket Adı <span className="text-red-600">*</span>
              </label>
              <input
                id="companyName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-brand-main"
                placeholder="Örn: Acıbadem Tıp Merkezi"
              />
            </div>

            {/* Optional Website */}
            <div className="mt-8 border-t pt-6 space-y-4">
              <div>
                <label className="block mb-1">
                  Web Sitesi{" "}
                  <span className="text-gray-400 text-xs">(opsiyonel)</span>
                </label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="https://..."
                />
              </div>

              {/* Optional Social Links */}
              <fieldset className="space-y-2">
                <legend className="font-medium text-gray-600 mb-1">
                  Sosyal Medya Bağlantıları{" "}
                </legend>
                <input
                  placeholder="Instagram URL"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
                <input
                  placeholder="Facebook URL"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
                <input
                  placeholder="WhatsApp Number"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </fieldset>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-main text-white rounded hover:bg-brand-dark transition font-semibold"
              >
                Şirketi Oluştur
              </button>
            </div>
            {/* Info Box */}
            <div className="flex items-start bg-blue-50 border-l-4 border-blue-400 rounded-xl px-4 py-3 mb-6 shadow-sm">
              <InformationCircleIcon className="h-6 w-6 text-blue-400 mt-0.5 mr-2 shrink-0" />
              <div>
                <div className="text-blue-800 font-semibold mb-1">
                  Varsayılan Ayarlar
                </div>
                <div className="text-blue-800 text-xs">
                  <span className="font-medium">Herkese açık rezervasyon</span>{" "}
                  = <strong>Etkin</strong>.<br />
                  <span className="font-medium">Pasif hasta eşiği</span> ={" "}
                  <strong>60 gün</strong>. Bunları daha sonra şirket
                  ayarlarından değiştirebilirsiniz.
                </div>
              </div>
            </div>
          </div>
        </ModalForm>
      </AppModal>
    </>
  );
}
