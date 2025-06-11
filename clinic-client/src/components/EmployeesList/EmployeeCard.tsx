import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { EmployeeInfo } from "../../types/sharedTypes";
import { FaTrashAlt, FaUserEdit } from "react-icons/fa";
import { EditEmployeeModal } from "../Modals/EditEmployeeModal/EditEmployeeModal";

interface Props {
  employee: EmployeeInfo;
  ownerEmail: string | null;
  ownerImageUrl?: string;
  updatingEmail?: string | null;
  removingEmail?: string | null;
  removingId: string | null;
  onRemove: (id: string) => void;
  onUpdateEmployee: (
    id: string,
    updates: {
      role: EmployeeInfo["role"];
      workingHours: EmployeeInfo["workingHours"];
    }
  ) => Promise<void>;
}

export const EmployeeCard: React.FC<Props> = ({
  employee,
  ownerEmail,
  ownerImageUrl,
  removingId,
  onRemove,
  onUpdateEmployee,
}) => {
  const { user } = useAuth();
  const currentUserEmail = user?.email || "";
  const currentUserIsOwner = currentUserEmail === ownerEmail;
  const isSelf = currentUserEmail === employee.email;
  const isOwnerCard = employee.role === "owner";

  const canEdit = currentUserIsOwner || isSelf;
  const canDelete = currentUserIsOwner && !isSelf;

  const [showEdit, setShowEdit] = useState(false);

  const handleSubmit = async (updates: {
    role: EmployeeInfo["role"];
    workingHours: EmployeeInfo["workingHours"];
  }) => {
    await onUpdateEmployee(employee._id!.toString(), updates);
    setShowEdit(false);
  };

  // If this card represents the owner, use ownerImageUrl
  const avatarUrl = isOwnerCard
    ? ownerImageUrl || employee.pictureUrl
    : employee.pictureUrl;

  return (
    <li className="relative bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition">
      <div className="absolute top-3 right-3 flex space-x-2">
        {canEdit && (
          <button
            onClick={() => setShowEdit(true)}
            className="p-1 hover:bg-gray-100 rounded"
            title="Edit"
          >
            <FaUserEdit className="h-5 w-5 text-indigo-600" />
          </button>
        )}
        {canDelete && (
          <button
            onClick={() => onRemove(employee._id!.toString())}
            className="p-1 hover:bg-gray-100 rounded"
            title="Delete"
            disabled={removingId === employee._id!.toString()}
          >
            <FaTrashAlt className="h-5 w-5 text-red-600" />
          </button>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border">
          <img
            src={avatarUrl}
            alt={employee.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="font-semibold text-gray-800">{employee.name}</p>
          <p className="text-sm text-gray-500">{employee.email}</p>
          <p className="text-xs mt-1 inline-block bg-gray-100 px-2 py-0.5 rounded text-gray-600">
            {employee.role}
          </p>
        </div>
      </div>

      <EditEmployeeModal
        show={showEdit}
        employee={employee}
        onClose={() => setShowEdit(false)}
        onSubmit={handleSubmit}
      />
    </li>
  );
};
