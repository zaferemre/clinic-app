// src/components/Employees/EmployeeCard.tsx
import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { IEmployee } from "../../types/sharedTypes";
import { FaTrashAlt, FaUserEdit } from "react-icons/fa";
import { EditEmployeeModal } from "../Modals/EditEmployeeModal/EditEmployeeModal";

interface Props {
  employee: IEmployee;
  ownerEmail: string | null;
  ownerImageUrl?: string;
  updatingEmail: string | null;
  removingEmail: string | null;
  onRemove: (email: string) => void;
  onUpdateEmployee: (
    email: string,
    updates: {
      role: IEmployee["role"];
      workingHours: IEmployee["workingHours"];
    }
  ) => Promise<void>;
}

export const EmployeeCard: React.FC<Props> = ({
  employee,
  ownerEmail,
  ownerImageUrl,
  updatingEmail,
  removingEmail,
  onRemove,
  onUpdateEmployee,
}) => {
  const { user } = useAuth();
  const isOwner = employee.email === ownerEmail;
  const isSelf = user?.email === employee.email;
  const canEdit = isOwner || isSelf;
  const canDelete = isOwner && !isSelf;

  const [showEdit, setShowEdit] = useState(false);

  const handleSubmit = async (updates: {
    role: IEmployee["role"];
    workingHours: IEmployee["workingHours"];
  }) => {
    await onUpdateEmployee(employee.email, updates);
    setShowEdit(false);
  };

  return (
    <li className="relative bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition">
      {/* Top-right icons */}
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
            onClick={() => onRemove(employee.email)}
            className="p-1 hover:bg-gray-100 rounded"
            title="Delete"
            disabled={removingEmail === employee.email}
          >
            <FaTrashAlt className="h-5 w-5 text-red-600" />
          </button>
        )}
      </div>

      {/* Profile */}
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 border">
          <img
            src={
              isOwner
                ? ownerImageUrl || employee.pictureUrl
                : employee.pictureUrl
            }
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

      {/* Edit Modal */}
      <EditEmployeeModal
        show={showEdit}
        employee={employee}
        onClose={() => setShowEdit(false)}
        onSubmit={handleSubmit}
      />
    </li>
  );
};
