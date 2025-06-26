import React, { useState } from "react";
import AppModal from "../Modals/AppModal"; // Make sure this path matches your actual structure
import type { NotificationInfo } from "../../types/sharedTypes";

export type NotificationFormMode = "patientNote" | "full";

export interface NewNotificationModalProps {
  open: boolean;
  onClose: () => void;
  mode: NotificationFormMode;
  initialValues?: Partial<NotificationInfo>;
  onSubmit: (data: Partial<NotificationInfo>) => Promise<void> | void;
}

const defaultValues: Partial<NotificationInfo> = {
  type: "call",
  status: "pending",
  message: "",
  title: "",
  note: "",
  priority: "normal",
  meta: {},
};

const NewNotificationModal: React.FC<NewNotificationModalProps> = ({
  open,
  onClose,
  mode,
  initialValues = {},
  onSubmit,
}) => {
  const [values, setValues] = useState<Partial<NotificationInfo>>({
    ...defaultValues,
    ...initialValues,
  });
  const [loading, setLoading] = useState(false);

  // Controlled input handler
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(values);
      onClose();
      setValues(defaultValues);
    } finally {
      setLoading(false);
    }
  };

  // Render helpers
  const showFullForm = mode === "full";
  const showNoteOnly = mode === "patientNote";

  return (
    <AppModal open={open} onClose={onClose} title="Yeni Bildirim Oluştur">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Only show 'note' if mode is patientNote */}
        {showNoteOnly && (
          <div>
            <label className="block font-medium mb-1">Not</label>
            <textarea
              name="note"
              value={values.note || ""}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
              placeholder="Notunuzu giriniz..."
            />
          </div>
        )}

        {/* Full form for notifications page */}
        {showFullForm && (
          <>
            <div>
              <label className="block font-medium mb-1">Başlık</label>
              <input
                name="title"
                value={values.title || ""}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Mesaj</label>
              <textarea
                name="message"
                value={values.message || ""}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Tip</label>
              <select
                name="type"
                value={values.type || "call"}
                onChange={handleChange}
                className="w-full border rounded p-2"
              >
                <option value="call">Arama</option>
                <option value="sms">SMS</option>
                <option value="email">E-posta</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="system">Sistem</option>
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">Öncelik</label>
              <select
                name="priority"
                value={values.priority || "normal"}
                onChange={handleChange}
                className="w-full border rounded p-2"
              >
                <option value="low">Düşük</option>
                <option value="normal">Normal</option>
                <option value="high">Yüksek</option>
              </select>
            </div>
            <div>
              <label className="block font-medium mb-1">Not</label>
              <textarea
                name="note"
                value={values.note || ""}
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </div>
            {/* Add more fields if you want (e.g., patientId, groupId, status, etc.) */}
          </>
        )}

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
            disabled={loading}
          >
            İptal
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-brand-main text-white hover:bg-brand-main-700"
            disabled={loading}
          >
            {loading ? "Gönderiliyor..." : "Kaydet"}
          </button>
        </div>
      </form>
    </AppModal>
  );
};

export default NewNotificationModal;
