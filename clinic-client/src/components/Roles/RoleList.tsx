import React from "react";
import RoleCard from "./RoleCard";
import { Role } from "../../types/sharedTypes";

interface RoleListProps {
  roles: Role[];
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

const RoleList: React.FC<RoleListProps> = ({ roles, onEdit, onDelete }) => (
  <div className="space-y-2">
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
