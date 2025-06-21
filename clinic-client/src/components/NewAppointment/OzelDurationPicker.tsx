const OPEN_HOUR = 8,
  CLOSE_HOUR = 22;
export default function OzelDurationPicker({
  duration,
  setDuration,
  setStartStr,
  setEndStr,
  day,
}: {
  readonly duration: number;
  readonly setDuration: (d: number) => void;
  readonly setStartStr: (s: string) => void;
  readonly setEndStr: (e: string) => void;
  readonly day: Date;
}) {
  const hours = Math.floor(duration / 60),
    minutes = duration % 60;
  const setOzelFromSelect = (h: number, m: number) => {
    setDuration(h * 60 + m);
    setStartStr("");
    setEndStr("");
  };
  const handleFullDay = () => {
    const s = new Date(day);
    s.setHours(OPEN_HOUR, 0, 0, 0);
    const e = new Date(day);
    e.setHours(CLOSE_HOUR, 0, 0, 0);
    setStartStr(s.toISOString());
    setEndStr(e.toISOString());
    setDuration((CLOSE_HOUR - OPEN_HOUR) * 60);
  };
  return (
    <div>
      <label
        htmlFor="appointment-ozel-duration"
        className="block text-sm mb-1 font-semibold text-brand-main"
      >
        Süre
      </label>
      <div className="flex items-center gap-3">
        <select
          id="appointment-ozel-hours"
          value={hours}
          onChange={(e) => setOzelFromSelect(Number(e.target.value), minutes)}
          className="rounded-lg border border-brand-main bg-white px-4 py-2 text-base font-medium"
        >
          {Array.from({ length: CLOSE_HOUR - OPEN_HOUR + 1 }, (_, i) => (
            <option key={i} value={i}>
              {i} saat
            </option>
          ))}
        </select>
        <select
          id="appointment-ozel-minutes"
          value={minutes}
          onChange={(e) => setOzelFromSelect(hours, Number(e.target.value))}
          className="rounded-lg border border-brand-main bg-white px-4 py-2 text-base font-medium"
        >
          {[0, 15, 30, 45].map((m) => (
            <option key={m} value={m}>
              {m} dakika
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleFullDay}
          className="whitespace-nowrap px-4 py-2 rounded-lg bg-brand-main text-white font-medium hover:bg-brand-main/90 transition"
        >
          Tüm Gün
        </button>
      </div>
      <div className="mt-1.5 text-sm text-brand-gray-600 font-medium">
        Toplam: {hours} saat {minutes} dakika ({duration} dakika)
      </div>
    </div>
  );
}
