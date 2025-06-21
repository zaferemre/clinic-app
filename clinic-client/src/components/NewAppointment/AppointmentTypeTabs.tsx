type Kind = "individual" | "group" | "ozel";
const TAB_LABELS = { individual: "Tekli", group: "Grup", ozel: "Özel" };

interface AppointmentTypeTabsProps {
  readonly kind: Kind;
  readonly setKind: (k: Kind) => void;
}

export default function AppointmentTypeTabs({
  kind,
  setKind,
}: AppointmentTypeTabsProps) {
  return (
    <div className="flex mb-4 gap-2">
      {(Object.keys(TAB_LABELS) as Kind[]).map((t) => {
        let buttonClass =
          "border-brand-gray-200 bg-brand-bg text-brand-gray-600";
        if (kind === t) {
          buttonClass =
            t === "group"
              ? "border-brand-purple bg-brand-purple/10 text-brand-purple font-semibold"
              : "border-brand-main bg-brand-main/10 text-brand-main font-semibold";
        }
        return (
          <button
            key={t}
            type="button"
            onClick={() => setKind(t)}
            className={`flex-1 py-2 rounded-t-lg border-b-2 transition-all duration-100 ${buttonClass}`}
          >
            {TAB_LABELS[t]}
          </button>
        );
      })}
    </div>
  );
}
