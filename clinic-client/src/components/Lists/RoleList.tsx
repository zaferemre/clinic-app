// src/components/Lists/RoleList.tsx
import React from "react";
import RoleCard from "../Cards/RoleCard";
import { Role } from "../../types/sharedTypes";

interface RoleListProps {
  roles: Role[];
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

const RoleList: React.FC<RoleListProps> = ({ roles, onEdit, onDelete }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {roles.map((role) => (
      <RoleCard
        key={role._id}
        role={role}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ))}
  </div>
);

export default RoleList;
