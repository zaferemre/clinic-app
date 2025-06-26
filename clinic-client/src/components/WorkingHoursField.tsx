import { ClockIcon } from "@heroicons/react/24/outline";

export type DayOfWeek =
  | "Pazartesi"
  | "Salı"
  | "Çarşamba"
  | "Perşembe"
  | "Cuma"
  | "Cumartesi"
  | "Pazar";

export interface WorkingHour {
  day: DayOfWeek;
  open: string;
  close: string;
  closed: boolean;
}

export default function WorkingHoursField({
  workingHours,
  setWorkingHours,
}: {
  workingHours: WorkingHour[];
  setWorkingHours: React.Dispatch<React.SetStateAction<WorkingHour[]>>;
}) {
  const handleToggle = (idx: number) => {
    setWorkingHours((arr) =>
      arr.map((w, i) => (i === idx ? { ...w, closed: !w.closed } : w))
    );
  };

  return (
    <div className="space-y-2">
      {workingHours.map((wh, idx) => {
        const isClosed = wh.closed;
        return (
          <div
            key={wh.day}
            onClick={() => handleToggle(idx)}
            role="button"
            tabIndex={0}
            aria-pressed={!isClosed}
            className={`
              flex items-center rounded-xl px-2 py-2 border 
              transition-all duration-150 cursor-pointer select-none
              ${
                isClosed
                  ? "bg-gray-100 border-gray-200 text-gray-400"
                  : "bg-white border-brand-main text-gray-900"
              }
              hover:ring-1 hover:ring-brand-main
              active:scale-[.98]
              focus:outline-none
              relative
            `}
          >
            <span className="w-20 font-bold text-[15px] mr-3">{wh.day}</span>

            <span
              className={`text-xs px-2 py-1 rounded mr-3 font-bold
                ${
                  isClosed
                    ? "bg-gray-200 text-gray-500"
                    : "bg-green-100 text-green-700"
                }
              `}
              style={{ minWidth: 44 }}
            >
              {isClosed ? "Kapalı" : "Açık"}
            </span>

            <div className="flex items-center space-x-1 flex-1 min-w-0">
              <ClockIcon className="h-4 w-4 mr-1" />
              <input
                type="time"
                value={wh.open}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) =>
                  setWorkingHours((arr) =>
                    arr.map((w, i) =>
                      i === idx ? { ...w, open: e.target.value } : w
                    )
                  )
                }
                className="border rounded px-1 py-0.5 text-xs w-[60px] bg-gray-50"
                disabled={isClosed}
                min="06:00"
                max="23:59"
              />
              <span className="mx-1 text-xs">-</span>
              <input
                type="time"
                value={wh.close}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) =>
                  setWorkingHours((arr) =>
                    arr.map((w, i) =>
                      i === idx ? { ...w, close: e.target.value } : w
                    )
                  )
                }
                className="border rounded px-1 py-0.5 text-xs w-[60px] bg-gray-50"
                disabled={isClosed}
                min="06:00"
                max="23:59"
              />
            </div>
          </div>
        );
      })}
      <p className="text-xs text-gray-400 mt-1">
        * Kartlara tıklayarak günleri aç/kapa. Saatleri tıklamak için karta uzun
        bas.
      </p>
    </div>
  );
}
