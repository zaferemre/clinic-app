// src/components/WorkerCard.tsx

import React from "react";
import { useAuth } from "../../context/AuthContext";
import { IWorker } from "../../types";

interface WorkerCardProps {
  worker: IWorker;
  ownerEmail: string | null;
  updatingEmail: string | null;
  removingEmail: string | null;
  onChangeRole: (email: string, newRole: string) => void;
  onRemove: (email: string) => void;
}

export const WorkerCard: React.FC<WorkerCardProps> = ({
  worker,
  ownerEmail,
  updatingEmail,
  removingEmail,
  onChangeRole,
  onRemove,
}) => {
  const { user } = useAuth();
  const isOwner = user?.email === ownerEmail;

  return (
    <li
      className="
        flex flex-col sm:flex-row sm:items-center sm:justify-between
        bg-white border border-brand-gray-200 rounded-lg p-4
      "
    >
      {/* Left: Profile picture + Basic Info */}
      <div className="flex items-center space-x-4">
        {/* Eğer worker.pictureUrl varsa göster, yoksa placeholder */}
        <div className="w-12 h-12 rounded-full bg-brand-gray-300 overflow-hidden">
          {worker.pictureUrl ? (
            <img
              src={worker.pictureUrl}
              alt={`${worker.name || worker.email}’s avatar`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="block w-full h-full bg-brand-gray-300"></span>
          )}
        </div>

        <div>
          <p className="text-lg font-medium text-brand-black font-sans">
            {worker.name || worker.email}
          </p>
          <p className="text-sm text-brand-gray-600 font-sans">
            {worker.email}
          </p>
        </div>
      </div>

      {/* Right: Role / Edit & Remove Buttons (sadece owner) */}
      {isOwner ? (
        <div className="mt-3 sm:mt-0 flex flex-col sm:flex-row sm:items-center sm:space-x-3">
          {/* Rol Dropdown */}
          <select
            value={worker.role || ""}
            onChange={(e) => onChangeRole(worker.email, e.target.value)}
            disabled={
              updatingEmail === worker.email || removingEmail === worker.email
            }
            className="
              border border-brand-gray-300 rounded-lg 
              px-3 py-2 font-sans text-brand-black
              focus:outline-none focus:ring-2 focus:ring-brand-green-300
            "
          >
            <option value="Receptionist">Receptionist</option>
            <option value="Physiotherapist">Physiotherapist</option>
            <option value="Manager">Manager</option>
            <option value="Admin">Admin</option>
          </select>

          {/* Sil Butonu */}
          <button
            onClick={() => onRemove(worker.email)}
            disabled={
              removingEmail === worker.email || updatingEmail === worker.email
            }
            className="
              mt-2 sm:mt-0 bg-brand-red-500 hover:bg-brand-red-600 
              text-white font-sans text-sm px-4 py-2 rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-brand-red-300
              disabled:opacity-50
            "
          >
            {removingEmail === worker.email ? "Siliniyor..." : "Sil"}
          </button>
        </div>
      ) : (
        <div className="mt-3 sm:mt-0 text-sm text-brand-gray-700 font-sans">
          Rol: <span className="font-semibold">{worker.role}</span>
        </div>
      )}
    </li>
  );
};
