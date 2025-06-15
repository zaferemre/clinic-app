// src/components/Settings/RoleSettings.tsx

import React, { useState, useEffect } from "react";
import { getRoles, createRole, removeRole } from "../../api/roleApi";
import { useAuth } from "../../contexts/AuthContext";
import { PlusIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";

export const RoleSettings: React.FC = () => {
  const { idToken, companyId } = useAuth();
  const [roles, setRoles] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newRole, setNewRole] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getRoles(idToken!, companyId!).then(setRoles);
  }, [idToken, companyId]);

  const handleAddClick = () => {
    setIsAdding(true);
    setNewRole("");
  };

  const handleSave = async () => {
    if (!newRole.trim()) return;
    setLoading(true);
    try {
      const updated = await createRole(idToken!, companyId!, newRole.trim());
      setRoles(updated);
      setIsAdding(false);
    } catch (e) {
      alert("Hata: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setNewRole("");
  };

  const handleRemove = async (role: string) => {
    if (!window.confirm(`“${role}” rolünü silmek istediğinize emin misiniz?`))
      return;
    try {
      const updated = await removeRole(idToken!, companyId!, role);
      setRoles(updated);
    } catch (e) {
      alert("Hata: " + (e instanceof Error ? e.message : String(e)));
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-4">
      <h2 className="text-lg font-semibold">Roller</h2>

      <ul className="space-y-2">
        {roles.map((role) => (
          <li key={role} className="flex items-center justify-between">
            <span className="text-gray-800">{role}</span>
            <button
              onClick={() => handleRemove(role)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <TrashIcon className="w-5 h-5 text-red-600" />
            </button>
          </li>
        ))}
      </ul>

      {isAdding ? (
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Yeni rol adı"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            className="flex-1 border px-3 py-2 rounded focus:ring-2 focus:ring-brand-green-300"
          />
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-brand-green-500 hover:bg-brand-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Kaydet
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <XMarkIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      ) : (
        <button
          onClick={handleAddClick}
          className="flex items-center space-x-2 text-brand-green-600 hover:text-brand-green-700"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Rol Ekle</span>
        </button>
      )}
    </div>
  );
};
