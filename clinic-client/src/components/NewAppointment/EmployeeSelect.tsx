// src/components/EmployeeSelect/EmployeeSelect.tsx
import React from "react";
import type { EmployeeInfo } from "../../types/sharedTypes";

export interface EmployeeSelectProps {
  employees: EmployeeInfo[];
  value: string; // userId
  setValue: (id: string) => void;
  isOwner: boolean;
  currentUserId: string;
  currentUserName: string;
}

const EmployeeSelect: React.FC<EmployeeSelectProps> = ({
  employees,
  value,
  setValue,
  isOwner,
  currentUserId,
  currentUserName,
}) => {
  // If not owner, show a disabled input prefilled with current user
  if (!isOwner) {
    const currentEmployee = employees.find(
      (emp) => emp.userId === currentUserId
    );

    return (
      <div className="mb-4">
        <label
          htmlFor="employee-select"
          className="block text-sm font-semibold text-brand-main mb-1"
        >
          Çalışan
        </label>
        <input
          id="employee-select"
          type="text"
          className="w-full border px-3 py-2 rounded-xl bg-gray-100"
          value={currentEmployee?.name ?? currentUserName ?? "Siz"}
          disabled
          readOnly
        />
      </div>
    );
  }

  // If owner, allow choosing any employee
  return (
    <div className="mb-4">
      <label
        htmlFor="employee-select"
        className="block text-sm font-semibold text-brand-main mb-1"
      >
        Çalışan
      </label>
      <select
        id="employee-select"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="block w-full appearance-none rounded-lg border border-brand-main bg-white py-2 pl-4 pr-10 text-base font-medium focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/30 transition"
      >
        <option value="">Seçiniz</option>
        {employees.map((emp) => (
          <option key={emp.userId} value={emp.userId}>
            {emp.name ?? emp.userId}
          </option>
        ))}
      </select>
    </div>
  );
};

export default EmployeeSelect;
