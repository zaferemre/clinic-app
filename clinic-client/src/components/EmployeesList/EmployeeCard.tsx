// src/components/EmployeeCard.tsx

import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { IEmployee } from "../../types/sharedTypes";
import { FaTrashAlt, FaUserEdit } from "react-icons/fa";

interface EmployeeCardProps {
  employee: IEmployee;
  ownerEmail: string | null;
  updatingEmail: string | null;
  removingEmail: string | null;
  onChangeRole: (email: string, newRole: string) => void;
  onRemove: (email: string) => void;
  onEdit?: (employee: IEmployee) => void; // Optional for edit modal
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  ownerEmail,
  updatingEmail,
  removingEmail,
  onChangeRole,
  onRemove,
  onEdit,
}) => {
  const { user } = useAuth();
  const isOwner = employee.email === ownerEmail;
  const isSelf = user?.email === employee.email;

  return (
    <li
      className="
        flex flex-col sm:flex-row sm:items-center sm:justify-between
        bg-white border border-brand-gray-200 rounded-xl p-4 shadow-md transition
        hover:shadow-lg
      "
    >
      {/* Profile + Info */}
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 rounded-full bg-brand-gray-300 overflow-hidden border-2 border-brand-green-200 flex-shrink-0">
          <img
            src={employee.pictureUrl}
            alt={`${employee.name || employee.email}’s avatar`}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="text-lg font-semibold text-brand-black flex items-center space-x-2">
            <span>{employee.name}</span>
            {isOwner && (
              <span className="ml-2 px-2 py-0.5 rounded bg-yellow-100 text-xs font-bold text-yellow-700 border border-yellow-300">
                Owner
              </span>
            )}
            {isSelf && !isOwner && (
              <span className="ml-2 px-2 py-0.5 rounded bg-green-100 text-xs font-bold text-green-700 border border-green-300">
                You
              </span>
            )}
          </p>
          <p className="text-sm text-brand-gray-600">{employee.email}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-3 sm:mt-0 flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0">
        {isOwner ? (
          <span className="text-sm font-bold text-yellow-600">Owner</span>
        ) : (
          <>
            <select
              value={employee.role || ""}
              onChange={(e) => onChangeRole(employee.email, e.target.value)}
              disabled={
                updatingEmail === employee.email ||
                removingEmail === employee.email
              }
              className="
                border border-brand-gray-300 rounded-lg 
                px-3 py-2 font-sans text-brand-black
                focus:outline-none focus:ring-2 focus:ring-brand-green-300
                bg-brand-gray-50 transition
              "
            >
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>

            {/* Edit Button (Optional, triggers onEdit if provided) */}
            <button
              type="button"
              onClick={() => onEdit && onEdit(employee)}
              disabled={updatingEmail === employee.email}
              className="
                flex items-center justify-center bg-brand-blue-500 hover:bg-brand-blue-600 
                text-white px-3 py-2 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-brand-blue-200
                transition disabled:opacity-50
              "
              title="Edit"
            >
              <FaUserEdit className="mr-1" />
              Edit
            </button>

            {/* Remove Button */}
            <button
              type="button"
              onClick={() => onRemove(employee.email)}
              disabled={
                removingEmail === employee.email ||
                updatingEmail === employee.email
              }
              className="
                flex items-center justify-center bg-brand-red-500 hover:bg-brand-red-600 
                text-white px-3 py-2 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-brand-red-200
                transition disabled:opacity-50
              "
              title="Remove"
            >
              <FaTrashAlt className="mr-1" />
              {removingEmail === employee.email ? "Siliniyor..." : "Sil"}
            </button>
          </>
        )}
      </div>
    </li>
  );
};
