import { Patient } from "../../types/sharedTypes";
export default function PatientSelect({
  patients,
  value,
  setValue,
  onNewPatient,
}: {
  readonly patients: readonly Patient[];
  readonly value: string;
  readonly setValue: (id: string) => void;
  readonly onNewPatient: () => void;
}) {
  return (
    <div>
      <label
        htmlFor="appointment-patient"
        className="block text-sm mb-1 font-semibold text-brand-main"
      >
        Hasta
      </label>
      <div className="flex gap-2">
        <select
          id="appointment-patient"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="block w-full rounded-lg border border-brand-main bg-white py-2 pl-4 pr-10 text-base font-medium"
          required
        >
          <option value="">Seçiniz</option>
          {patients
            .filter((p) => !!p._id)
            .map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
        </select>
        <button
          type="button"
          onClick={onNewPatient}
          className="px-2 py-2 text-sm rounded-lg border border-brand-green bg-brand-green/10 text-brand-green font-semibold hover:bg-brand-green/30 transition"
        >
          + Yeni
        </button>
      </div>
    </div>
  );
}
