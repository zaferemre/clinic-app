// components/ToggleSwitch.tsx
import React from "react";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  id,
}) => (
  <button
    type="button"
    id={id}
    role="switch"
    aria-checked={checked}
    tabIndex={0}
    onClick={() => onChange(!checked)}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onChange(!checked);
      }
    }}
    className={`relative inline-flex h-6 w-12 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-main border-2
      ${
        checked
          ? "bg-brand-main border-brand-main"
          : "bg-gray-300 border-gray-300"
      }
    `}
    style={{ minWidth: 48, minHeight: 24 }}
  >
    <span
      className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200
        ${checked ? "translate-x-6" : "translate-x-0"}
      `}
      style={{ minWidth: 20, minHeight: 20 }}
    />
  </button>
);

export default ToggleSwitch;
