// src/components/CalendarEmployeeSelector.tsx
import React, { useState, useRef, useEffect } from "react";

export interface CalendarEmployee {
  userId: string;
  name: string;
  pictureUrl?: string;
}

interface Props {
  /** The list of all employees (must have userId, name, optional pictureUrl) */
  employees: CalendarEmployee[];
  /** Currently selected Employee’s userId (or empty string = “all”) */
  selectedEmployee: string;
  /** Called when user picks an Employee (pass back the Employee.userId) */
  onChange: (newUserId: string) => void;
}

export const CalendarEmployeeSelector: React.FC<Props> = ({
  employees,
  selectedEmployee,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Determine label to show when no employee or “all”
  const selectedLabel =
    selectedEmployee === ""
      ? "Hepsi"
      : employees.find((w) => w.userId === selectedEmployee)?.name ?? "Hepsi";

  // Get avatar URL for selected (fallback to placeholder)
  const selectedAvatar =
    employees.find((w) => w.userId === selectedEmployee)?.pictureUrl ?? "";

  return (
    <div className="relative inline-block text-left" ref={wrapperRef}>
      {/* Button to open/close */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="
          inline-flex justify-between items-center
          w-48 px-3 py-2 bg-white border border-brand-gray-300 rounded-lg
          text-sm font-medium text-brand-black
          hover:border-brand-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-green-300
        "
      >
        <div className="flex items-center space-x-2">
          {selectedEmployee && selectedAvatar ? (
            <img
              src={selectedAvatar}
              alt={`${selectedLabel} avatar`}
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : null}
          <span>{selectedLabel}</span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <ul
          className="
            absolute z-10 mt-1 w-48 bg-white border border-brand-gray-300
            rounded-lg shadow-lg max-h-60 overflow-y-auto
          "
        >
          {/* “All” option */}
          <li>
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="
                flex items-center w-full text-left px-3 py-2 hover:bg-brand-gray-100
                cursor-pointer
              "
            >
              <span className="ml-1 text-sm text-brand-black">Hepsi</span>
            </button>
          </li>

          {employees.map((w) => (
            <li key={w.userId}>
              <button
                onClick={() => {
                  onChange(w.userId);
                  setOpen(false);
                }}
                className="
                  flex items-center w-full text-left px-3 py-2 hover:bg-brand-gray-100
                  cursor-pointer
                "
              >
                {w.pictureUrl ? (
                  <img
                    src={w.pictureUrl}
                    alt={`${w.name} avatar`}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-brand-gray-200" />
                )}
                <span className="ml-2 text-sm text-brand-black">{w.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CalendarEmployeeSelector;
