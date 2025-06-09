import React, { useState, useEffect } from "react";

export interface PatientSettings {
  showCredit: boolean;
  showPaymentStatus: boolean;
  showServicesReceived: boolean;
  showServicePointBalance: boolean;
  showNotes: boolean;
}

interface Props {
  show: boolean;
  initial: PatientSettings;
  onClose: () => void;
  onSave: (settings: PatientSettings) => void;
}

export const PatientSettingsModal: React.FC<Props> = ({
  show,
  initial,
  onClose,
  onSave,
}) => {
  const [settings, setSettings] = useState<PatientSettings>(initial);

  useEffect(() => {
    if (show) setSettings(initial);
  }, [initial, show]);

  if (!show) return null;

  const handleToggle = (key: keyof PatientSettings) => {
    setSettings((s) => ({ ...s, [key]: !s[key] }));
  };

  const renderSwitch = (
    label: string,
    key: keyof PatientSettings,
    checked: boolean
  ) => (
    <label className="flex items-center justify-between">
      <span className="text-sm text-gray-800">{label}</span>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => handleToggle(key)}
          className="sr-only peer"
        />
        <div className="w-10 h-6 bg-gray-200 rounded-full peer-checked:bg-green-500 transition" />
        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform peer-checked:translate-x-4 transition" />
      </div>
    </label>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-4 overflow-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-6">
        <header className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Hasta Alanları Ayarları</h2>
          <button onClick={onClose} className="text-2xl leading-none">
            ×
          </button>
        </header>

        <div className="space-y-4">
          {renderSwitch(
            "Kredi Bilgisi Göster",
            "showCredit",
            settings.showCredit
          )}
          {renderSwitch(
            "Ödeme Durumu Göster",
            "showPaymentStatus",
            settings.showPaymentStatus
          )}
          {renderSwitch(
            "Alınan Hizmetler Göster",
            "showServicesReceived",
            settings.showServicesReceived
          )}
          {renderSwitch(
            "Hizmet Puanı Göster",
            "showServicePointBalance",
            settings.showServicePointBalance
          )}
          {renderSwitch("Notlar Göster", "showNotes", settings.showNotes)}
        </div>

        <footer className="flex justify-end space-x-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            İptal
          </button>
          <button
            onClick={() => onSave(settings)}
            className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
          >
            Kaydet
          </button>
        </footer>
      </div>
    </div>
  );
};
