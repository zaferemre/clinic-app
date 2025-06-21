import React from "react";

interface DurationPickerProps {
  minutes: number;
  setMinutes: (m: number) => void;
  min?: number;
  max?: number;
}

export const DurationPicker: React.FC<DurationPickerProps> = ({
  minutes,
  setMinutes,
  min = 15,
  max = 600,
}) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return (
    <div className="flex gap-2">
      <select
        value={hours}
        onChange={(e) => setMinutes(Number(e.target.value) * 60 + mins)}
        className="rounded border px-2 py-1"
      >
        {Array.from(
          { length: (max - min) / 60 + 1 },
          (_, i) => min / 60 + i
        ).map((h) => (
          <option key={h} value={h}>
            {h} saat
          </option>
        ))}
      </select>
      <select
        value={mins}
        onChange={(e) => setMinutes(hours * 60 + Number(e.target.value))}
        className="rounded border px-2 py-1"
      >
        {[0, 15, 30, 45].map((m) => (
          <option key={m} value={m}>
            {m} dakika
          </option>
        ))}
      </select>
    </div>
  );
};
