import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import type { EmployeeInfo } from "../../types/sharedTypes";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { getPrimaryRole, isElevatedRole } from "../../utils/userRole";
import EditEmployeeModal from "../Modals/EditEmployeeModal/EditEmployeeModal";

interface EmployeeCardProps {
  employee: EmployeeInfo;
  ownerUserId: string;
  updatingId: string | null;
  removingId: string | null;
  onRemove: (userId: string) => void;
  onUpdateEmployee: (
    userId: string,
    updates: Partial<Pick<EmployeeInfo, "role" | "workingHours">>
  ) => void;
}

// Helper: Accept both string or array roles
function displayRoles(role: string | string[] | undefined) {
  if (!role) return "";
  if (Array.isArray(role)) return role.join(", ");
  return role;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  ownerUserId,
  updatingId,
  removingId,
  onRemove,
  onUpdateEmployee,
}) => {
  const { user, selectedCompanyId, selectedClinicId } = useAuth();
  const userRole = getPrimaryRole(user, selectedCompanyId, selectedClinicId);
  const canEdit = isElevatedRole(userRole);
  const isOwner = employee.userId === ownerUserId;
  const [showEdit, setShowEdit] = useState(false);

  const handleEditSubmit = async (updates: {
    role: EmployeeInfo["role"];
    workingHours: EmployeeInfo["workingHours"];
  }) => {
    await onUpdateEmployee(employee.userId, updates);
    setShowEdit(false);
  };

  return (
    <div className="relative bg-white rounded-lg shadow p-4">
      {/* Edit/Delete if elevated and not owner */}
      {canEdit && !isOwner && (
        <div className="absolute top-2 right-2 flex items-center space-x-2">
          <button
            onClick={() => setShowEdit(true)}
            disabled={updatingId === employee.userId}
            className="p-1 rounded hover:bg-gray-100"
          >
            <PencilIcon className="w-5 h-5 text-green-600 hover:text-green-800" />
          </button>
          <button
            onClick={() => onRemove(employee.userId)}
            disabled={removingId === employee.userId}
            className="p-1 rounded hover:bg-gray-100"
          >
            <TrashIcon className="w-5 h-5 text-red-600 hover:text-red-800" />
          </button>
        </div>
      )}

      <div className="flex items-center space-x-3 mt-2">
        <img
          src={employee.pictureUrl || ""}
          alt={employee.name}
          className="w-12 h-12 rounded-full"
        />
        <div>
          <p className="font-medium text-black">{employee.name}</p>
          <p className="text-sm text-gray-500 capitalize">
            {displayRoles(employee.role)}
          </p>
        </div>
      </div>

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
