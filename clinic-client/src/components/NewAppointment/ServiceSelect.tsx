import { ServiceInfo } from "../../types/sharedTypes";
export default function ServiceSelect({
  services,
  value,
  setValue,
  onNewService,
}: {
  readonly services: ServiceInfo[];
  readonly value: string;
  readonly setValue: (id: string) => void;
  readonly onNewService: () => void;
}) {
  return (
    <div>
      <label
        htmlFor="appointment-service"
        className="block text-sm mb-1 font-semibold text-brand-main"
      >
        Hizmet
      </label>
      <div className="flex gap-2">
        <select
          id="appointment-service"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="block w-full rounded-lg border border-brand-main bg-white py-2 pl-4 pr-10 text-base font-medium"
          required
        >
          <option value="">Seçiniz</option>
          {services
            .filter((s) => !!s._id)
            .map((s) => (
              <option key={s._id} value={s._id}>
                {s.serviceName}
              </option>
            ))}
        </select>
        <button
          type="button"
          onClick={onNewService}
          className="px-2 py-2 text-sm rounded-lg border border-brand-yellow bg-brand-yellow/10 text-brand-yellow font-semibold hover:bg-brand-yellow/30 transition"
        >
          + Yeni
        </button>
      </div>
    </div>
  );
}
