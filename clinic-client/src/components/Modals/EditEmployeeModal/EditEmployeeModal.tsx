// src/components/Employees/EditEmployeeModal.tsx
import React, { useState } from "react";
import { IEmployee, WorkingHour } from "../../../types/sharedTypes";

interface Props {
  show: boolean;
  employee: IEmployee;
  onClose: () => void;
  onSubmit: (updates: {
    role: IEmployee["role"];
    workingHours: WorkingHour[];
  }) => Promise<void>;
}

export const EditEmployeeModal: React.FC<Props> = ({
  show,
  employee,
  onClose,
  onSubmit,
}) => {
  const [role, setRole] = useState<IEmployee["role"]>(employee.role);
  const [hours, setHours] = useState<WorkingHour[]>(
    employee.workingHours ?? []
  );
  const [saving, setSaving] = useState(false);

  if (!show) return null;

  const handleHourChange = (
    idx: number,
    field: keyof WorkingHour,
    value: string
  ) => {
    const updated = [...hours];
    // @ts-ignore
    updated[idx][field] = value;
    setHours(updated);
  };

  const addHour = () =>
    setHours([
      ...hours,
      { day: "Monday", open: "09:00", close: "17:00" } as WorkingHour,
    ]);

  const removeHour = (idx: number) =>
    setHours(hours.filter((_, i) => i !== idx));

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSubmit({ role, workingHours: hours });
      onClose();
    } catch {
      // swallow or show error
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-4 overflow-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Çalışan Düzenle</h3>
          <button onClick={onClose} className="text-2xl leading-none">
            ×
          </button>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Rol</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as IEmployee["role"])}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div>
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">Çalışma Saatleri</p>
            <button
              onClick={addHour}
              className="text-sm text-blue-600 hover:underline"
              type="button"
            >
              + Ekle
            </button>
          </div>

          <div className="space-y-2 mt-2 max-h-64 overflow-auto">
            {hours.map((wh, idx) => (
              <div
                key={idx}
                className="flex items-center space-x-2 border border-gray-200 rounded px-2 py-1"
              >
                <select
                  value={wh.day}
                  onChange={(e) => handleHourChange(idx, "day", e.target.value)}
                  className="text-sm border rounded px-2 py-1"
                >
                  {[
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ].map((d) => (
                    <option key={d} value={d}>
                      {d.slice(0, 3)}
                    </option>
                  ))}
                </select>
                <input
                  type="time"
                  value={wh.open}
                  onChange={(e) =>
                    handleHourChange(idx, "open", e.target.value)
                  }
                  className="text-sm border rounded px-2 py-1"
                />
                <span className="text-sm">–</span>
                <input
                  type="time"
                  value={wh.close}
                  onChange={(e) =>
                    handleHourChange(idx, "close", e.target.value)
                  }
                  className="text-sm border rounded px-2 py-1"
                />
                <button
                  onClick={() => removeHour(idx)}
                  className="ml-auto text-red-500 hover:text-red-700"
                  type="button"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            disabled={saving}
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={saving}
          >
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
};
