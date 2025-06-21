import { Group } from "../../types/sharedTypes";
export default function GroupSelect({
  groups,
  value,
  setValue,
}: {
  readonly groups: Group[];
  readonly value: string;
  readonly setValue: (id: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor="appointment-group"
        className="block text-sm mb-1 font-semibold text-brand-main"
      >
        Grup
      </label>
      <select
        id="appointment-group"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="block w-full rounded-lg border border-brand-main bg-white py-2 pl-4 pr-10 text-base font-medium"
        required
      >
        <option value="">Seçiniz</option>
        {groups
          .filter((g) => !!g._id)
          .map((g) => (
            <option key={g._id} value={g._id}>
              {g.name}
            </option>
          ))}
      </select>
    </div>
  );
}
