import React, { useMemo } from "react";
import { XCircleIcon, ClockIcon } from "@heroicons/react/24/solid";

interface SlotPickerProps {
  day: Date;
  serviceDuration: number;
  busy: { start: Date; end: Date }[];
  value: string;
  setValue: (iso: string) => void;
  setEndValue: (iso: string) => void;
  isPastDay: boolean;
  isToday: boolean;
}

const OPEN_HOUR = 8;
const CLOSE_HOUR = 22;

const SlotPicker: React.FC<SlotPickerProps> = ({
  day,
  serviceDuration,
  busy,
  value,
  setValue,
  setEndValue,
  isPastDay,
  isToday,
}) => {
  const slots = useMemo(() => {
    const arr: Date[] = [];
    const totalMins = (CLOSE_HOUR - OPEN_HOUR) * 60;
    for (let m = 0; m <= totalMins - serviceDuration; m += serviceDuration) {
      const h = OPEN_HOUR + Math.floor(m / 60);
      const mm = m % 60;
      arr.push(
        new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, mm)
      );
    }
    return arr;
  }, [day, serviceDuration]);

  const now = new Date();

  const slotBusy = (s: Date, e: Date) =>
    busy.some((b) => s < b.end && e > b.start);
  const slotPast = (_: Date, e: Date) => isPastDay || (isToday && e <= now);

  return (
    <div className="flex gap-3 overflow-x-auto py-2 px-1 scrollbar-hide">
      {slots.map((slot) => {
        const end = new Date(slot.getTime() + serviceDuration * 60000);
        const busySlot = slotBusy(slot, end);
        const pastSlot = slotPast(slot, end);
        const selected = value === slot.toISOString();

        return (
          <button
            key={slot.toISOString()}
            disabled={busySlot || pastSlot}
            onClick={() => {
              setValue(slot.toISOString());
              setEndValue(end.toISOString());
            }}
            className={`
              min-w-[108px] flex flex-col items-center px-3 py-3 rounded-xl border-2 font-bold relative transition-all
              shadow-sm
              ${
                selected
                  ? "bg-brand-main text-white border-brand-main shadow-lg scale-105"
                  : ""
              }
              ${
                busySlot
                  ? "bg-brand-red/10 border-brand-red text-brand-red cursor-not-allowed"
                  : ""
              }
              ${
                pastSlot && !busySlot
                  ? "bg-brand-gray-100 border-brand-gray-300 text-brand-gray-400 cursor-not-allowed"
                  : ""
              }
              ${
                !busySlot && !pastSlot && !selected
                  ? "bg-brand-bg border-brand-main text-brand-main hover:bg-brand-main/10"
                  : ""
              }
              `}
          >
            <span className="text-lg tracking-tight">
              {slot.toLocaleTimeString("tr-TR", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}{" "}
              –{" "}
              {end.toLocaleTimeString("tr-TR", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </span>
            {/* Show busy or past icons/text */}
            {busySlot && (
              <span className="flex items-center gap-1 mt-1 text-xs text-brand-red font-semibold">
                <XCircleIcon className="w-4 h-4" /> DOLU
              </span>
            )}
            {pastSlot && !busySlot && (
              <span className="flex items-center gap-1 mt-1 text-xs text-brand-gray-400 font-medium">
                <ClockIcon className="w-4 h-4" /> Geçti
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default SlotPicker;
