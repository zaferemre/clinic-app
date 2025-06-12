// src/components/Settings/PatientSettingsModal.tsx
import React from "react";
import AppModal from "../Modals/AppModal";
import { PatientSettings } from "../../types/sharedTypes";

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
  const [settings, setSettings] = React.useState<PatientSettings>(initial);
  React.useEffect(() => {
    if (show) setSettings(initial);
  }, [initial, show]);

  const toggle = (k: keyof PatientSettings) =>
    setSettings((s) => ({ ...s, [k]: !s[k] }));

  const renderSwitch = (label: string, key: keyof PatientSettings) => (
    <label className="flex items-center justify-between">
      <span>{label}</span>
      <div className="relative">
        <input
          type="checkbox"
          checked={settings[key]}
          onChange={() => toggle(key)}
          className="sr-only peer"
        />
        <div className="w-10 h-6 bg-gray-200 rounded-full peer-checked:bg-green-500 transition" />
        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-4 transition" />
      </div>
    </label>
  );

  return (
    <AppModal open={show} onClose={onClose} title="Hasta Alan Ayarları">
      <div className="space-y-4">
        {renderSwitch("Kredi Göster", "showCredit")}
        {renderSwitch("Ödeme Durumu Göster", "showPaymentStatus")}
        {renderSwitch("Alınan Hizmetler Göster", "showServicesReceived")}
        {renderSwitch("Puan Bakiyesi Göster", "showServicePointBalance")}
        {renderSwitch("Notlar Göster", "showNotes")}
        <div className="flex justify-end space-x-3 pt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">
            İptal
          </button>
          <button
            onClick={() => onSave(settings)}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Kaydet
          </button>
        </div>
      </div>
    </AppModal>
  );
};
