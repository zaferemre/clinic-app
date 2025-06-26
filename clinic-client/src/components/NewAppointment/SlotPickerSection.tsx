import SlotPicker from "./SlotPicker";
type Kind = "individual" | "group" | "ozel";

export interface SlotPickerSectionProps {
  kind: Kind;
  selectedService: string;
  serviceDuration: number;
  day: Date;
  startStr: string;
  setStartStr: (s: string) => void;
  setEndStr: (s: string) => void;
  busy?: { start: Date; end: Date }[];
}

export default function SlotPickerSection({
  kind,
  selectedService,
  serviceDuration,
  day,
  startStr,
  setStartStr,
  setEndStr,
  busy = [],
}: Readonly<SlotPickerSectionProps>) {
  const isToday = day.toDateString() === new Date().toDateString();
  const isPastDay = day < new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <div>
      <label
        htmlFor="slot-picker"
        className="block text-sm mb-1 font-semibold text-brand-main"
      >
        Saat Aralığı Seçin
      </label>
      {kind === "ozel" || selectedService ? (
        <SlotPicker
          day={day}
          serviceDuration={serviceDuration}
          busy={busy}
          value={startStr}
          setValue={setStartStr}
          setEndValue={setEndStr}
          isPastDay={isPastDay}
          isToday={isToday}
        />
      ) : (
        <div className="text-sm text-brand-gray-400 p-2">
          Önce bir hizmet seçiniz.
        </div>
      )}
    </div>
  );
}
