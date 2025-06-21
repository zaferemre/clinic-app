// src/components/Cards/RoleCard.tsx
import React from "react";
import { Role } from "../../types/sharedTypes";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import { isElevatedRole } from "../../utils/role";

interface RoleCardProps {
  role: Role;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

const RoleCard: React.FC<RoleCardProps> = ({ role, onEdit, onDelete }) => {
  const { user } = useAuth();
  const canModify = user ? isElevatedRole(user.role) : false;

  return (
    <div className="bg-accent-bg p-6 rounded-2xl shadow-md flex flex-col justify-between hover:shadow-lg transition">
      <h2 className="text-xl font-semibold text-brand-black capitalize">
        {role.name}
      </h2>

      {canModify && (
        <div className="mt-4 flex justify-end space-x-4">
          <button
            onClick={() => onEdit(role)}
            className="p-2 rounded-lg hover:bg-brand-gray-100 transition"
            aria-label={`Düzenle ${role.name}`}
          >
            <PencilIcon className="w-5 h-5 text-brand-main" />
          </button>
          <button
            onClick={() => onDelete(role)}
            className="p-2 rounded-lg hover:bg-brand-gray-100 transition"
            aria-label={`Sil ${role.name}`}
          >
            <TrashIcon className="w-5 h-5 text-error" />
          </button>
        </div>
      )}
    </div>
  );
};

export default RoleCard;
