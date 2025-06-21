// src/components/Modals/RoleModal.tsx
import React, { useState, useEffect } from "react";
import AppModal from "./AppModal";
import { Role } from "../../types/sharedTypes";

interface RoleModalProps {
  show: boolean;
  initial: Role;
  onClose: () => void;
  onSave: (data: { name: string }) => void;
}

const RoleModal: React.FC<RoleModalProps> = ({
  show,
  initial,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(initial.name);

  useEffect(() => {
    setName(initial.name);
  }, [initial]);

  const handleSubmit = () => onSave({ name: name.trim() });

  return (
    <AppModal
      open={show}
      onClose={onClose}
      title={initial._id ? "Rol Düzenle" : "Rol Ekle"}
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-brand-gray-700">
            Rol Adı
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full border border-brand-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-main"
            placeholder="Yeni rol adı"
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-brand-gray-300 rounded-lg hover:bg-brand-gray-50 transition"
          >
            İptal
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="px-6 py-2 bg-brand-main text-white rounded-lg hover:bg-brand-main-dark transition disabled:opacity-50"
          >
            Kaydet
          </button>
        </div>
      </div>
    </AppModal>
  );
};

export default RoleModal;
