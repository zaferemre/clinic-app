// src/components/Modals/EditEmployeeModal/EditEmployeeModal.tsx
import React, { useState } from "react";
import AppModal from "../../Modals/AppModal";
import { EmployeeInfo, WorkingHour } from "../../../types/sharedTypes";

interface Props {
  show: boolean;
  employee: EmployeeInfo;
  onClose: () => void;
  onSubmit: (updates: {
    role: EmployeeInfo["role"];
    workingHours: WorkingHour[];
  }) => Promise<void>;
}

export const EditEmployeeModal: React.FC<Props> = ({
  show,
  employee,
  onClose,
  onSubmit,
}) => {
  const [role, setRole] = useState<EmployeeInfo["role"]>(employee.role);
  const [hours, setHours] = useState<WorkingHour[]>(
    employee.workingHours || []
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSubmit({ role, workingHours: hours });
    setSaving(false);
    onClose();
  };

  return (
    <AppModal open={show} onClose={onClose} title="Çalışan Düzenle">
      {/* Role */}
      <div className="mb-4">
        <label className="block text-sm font-medium">Rol</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
          className="mt-1 w-full border px-3 py-2 rounded"
        >
          <option value="staff">Staff</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      {/* Working Hours */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium">Çalışma Saatleri</span>
          <button
            type="button"
            onClick={() =>
              setHours([
                ...hours,
                { day: "Monday", open: "09:00", close: "17:00" },
              ])
            }
            className="text-sm text-blue-600 hover:underline"
          >
            + Ekle
          </button>
        </div>
        <div className="space-y-2 max-h-60 overflow-auto">
          {hours.map((wh, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <select
                value={wh.day}
                onChange={(e) =>
                  setHours((h) =>
                    h.map((x, i) =>
                      i === idx ? { ...x, day: e.target.value as any } : x
                    )
                  )
                }
                className="border rounded px-2 py-1"
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
                  setHours((h) =>
                    h.map((x, i) =>
                      i === idx ? { ...x, open: e.target.value } : x
                    )
                  )
                }
                className="border rounded px-2 py-1"
              />
              <span>–</span>
              <input
                type="time"
                value={wh.close}
                onChange={(e) =>
                  setHours((h) =>
                    h.map((x, i) =>
                      i === idx ? { ...x, close: e.target.value } : x
                    )
                  )
                }
                className="border rounded px-2 py-1"
              />
              <button
                type="button"
                onClick={() => setHours((h) => h.filter((_, i) => i !== idx))}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
      {/* Footer */}
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
    </AppModal>
  );
};
