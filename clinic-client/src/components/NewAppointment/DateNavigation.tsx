import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
export default function DateNavigation({
  day,
  setDay,
  setModalDay,
  setStartStr,
  setEndStr,
}: Readonly<{
  day: Date;
  setDay: (d: Date) => void;
  setModalDay?: (d: Date) => void;
  setStartStr: (s: string) => void;
  setEndStr: (s: string) => void;
}>) {
  const go = (dir: number) => {
    const next = new Date(day);
    next.setDate(day.getDate() + dir);
    setDay(next);
    setModalDay?.(next);
    setStartStr("");
    setEndStr("");
  };
  return (
    <div className="flex items-center justify-between mb-3">
      <button
        type="button"
        onClick={() => go(-1)}
        className="p-2 rounded-lg bg-brand-gray-100 hover:bg-brand-gray-200 transition"
      >
        <ChevronLeftIcon className="w-5 h-5 text-brand-main" />
      </button>
      <span className="font-medium text-brand-main">
        {day.toLocaleDateString("tr-TR", {
          weekday: "long",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })}
      </span>
      <button
        type="button"
        onClick={() => go(1)}
        className="p-2 rounded-lg bg-brand-gray-100 hover:bg-brand-gray-200 transition"
      >
        <ChevronRightIcon className="w-5 h-5 text-brand-main" />
      </button>
    </div>
  );
}
