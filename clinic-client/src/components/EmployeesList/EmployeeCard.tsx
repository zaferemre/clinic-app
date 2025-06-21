// src/components/EmployeeCard/EmployeeCard.tsx
import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

import type { EmployeeInfo } from "../../types/sharedTypes";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { isElevatedRole } from "../../utils/role";
import EditEmployeeModal from "../Modals/EditEmployeeModal/EditEmployeeModal";

interface EmployeeCardProps {
  employee: EmployeeInfo;
  ownerEmail: string;
  ownerImageUrl: string;
  updatingEmail: string | null;
  removingEmail: string | null;
  onRemove: (email: string) => void;
  onUpdateEmployee: (
    email: string,
    updates: Partial<Pick<EmployeeInfo, "role" | "workingHours">>
  ) => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  ownerEmail,
  ownerImageUrl,
  updatingEmail,
  removingEmail,
  onRemove,
  onUpdateEmployee,
}) => {
  const { user } = useAuth();
  const canEdit = user ? isElevatedRole(user.role) : false;
  const isOwner = employee.email === ownerEmail;

  const [showEdit, setShowEdit] = useState(false);

  const handleEditSubmit = async (updates: {
    role: EmployeeInfo["role"];
    workingHours: EmployeeInfo["workingHours"];
  }) => {
    await onUpdateEmployee(employee.email, updates);
    setShowEdit(false);
  };

  return (
    <div className="relative bg-white rounded-lg shadow p-4">
      {/* Edit/Delete buttons in top-right */}
      {canEdit && !isOwner && (
        <div className="absolute top-2 right-2 flex items-center space-x-2">
          <button
            onClick={() => setShowEdit(true)}
            disabled={updatingEmail === employee.email}
            className="p-1 rounded hover:bg-gray-100"
          >
            <PencilIcon className="w-5 h-5 text-green-600 hover:text-green-800" />
          </button>
          <button
            onClick={() => onRemove(employee.email)}
            disabled={removingEmail === employee.email}
            className="p-1 rounded hover:bg-gray-100"
          >
            <TrashIcon className="w-5 h-5 text-red-600 hover:text-red-800" />
          </button>
        </div>
      )}

      <div className="flex items-center space-x-3 mt-2">
        <img
          src={employee.pictureUrl || ownerImageUrl}
          alt={employee.name}
          className="w-12 h-12 rounded-full"
        />
        <div>
          <p className="font-medium text-black">{employee.name}</p>
          <p className="text-sm text-gray-500 truncate">{employee.email}</p>
          <p className="text-sm text-gray-500 capitalize">{employee.role}</p>
        </div>
      </div>

      {/* Edit Employee Modal */}
      <EditEmployeeModal
        show={showEdit}
        employee={employee}
        onClose={() => setShowEdit(false)}
        onSubmit={handleEditSubmit}
      />
    </div>
  );
};

export default EmployeeCard;
