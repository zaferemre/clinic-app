import React from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Role } from "../../types/sharedTypes";

interface RoleCardProps {
  role: Role;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

const RoleCard: React.FC<RoleCardProps> = ({ role, onEdit, onDelete }) => (
  <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow mb-3">
    <div>
      <div className="font-semibold text-brand-black">{role.name}</div>
      {/* Add more role info below if needed */}
    </div>
    <div className="flex gap-2">
      <button
        className="p-2 rounded hover:bg-brand-main/10"
        title="Düzenle"
        onClick={() => onEdit(role)}
      >
        <PencilIcon className="w-5 h-5 text-brand-main" />
      </button>
      <button
        className="p-2 rounded hover:bg-red-100"
        title="Sil"
        onClick={() => onDelete(role)}
      >
        <TrashIcon className="w-5 h-5 text-red-500" />
      </button>
    </div>
  </div>
);

export default RoleCard;
