import { InformationCircleIcon } from "@heroicons/react/24/outline";

const RolesInfoBox = () => (
  <div className="flex items-start bg-blue-50 border-l-4 border-blue-400 rounded-xl px-4 py-3 mb-6 shadow-sm max-w-2xl mx-auto">
    <InformationCircleIcon className="h-6 w-6 text-blue-400 mt-0.5 mr-2 shrink-0" />
    <div>
      <div className="text-blue-800 font-semibold mb-1">
        Roller (İş Ünvanları)
      </div>
      <div className="text-blue-800 text-sm">
        <span className="font-medium">Rol</span> = çalışanlarınızın uygulama
        içindeki <b>görev veya iş ünvanı</b>.<br />
        Örnek: <span className="font-semibold">Doktor</span>,{" "}
        <span className="font-semibold">Sekreter</span>,{" "}
        <span className="font-semibold">Yönetici</span>.
      </div>
    </div>
  </div>
);

export default RolesInfoBox;
