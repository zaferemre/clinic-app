/* src/components/Cards/NextAppointmentCard.tsx */
import React from "react";
import { ClockIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface Appointment {
  id: string;
  start: string;
  patientName: string;
  serviceName?: string;
}

interface NextAppointmentCardProps {
  appointments: Appointment[];
  onAddAppointment: () => void;
  onAppointmentClick: (id: string) => void;
}

const NextAppointmentCard: React.FC<NextAppointmentCardProps> = ({
  appointments,
  onAddAppointment,
  onAppointmentClick,
}) => {
  const now = new Date();
  const next = appointments
    .filter((a) => new Date(a.start) > now)
    .sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    )[0];

  if (!next) {
    return (
      <div className="w-full flex flex-col items-center p-4 bg-white rounded-2xl shadow-sm border border-gray-200 space-y-2">
        <span className="text-sm text-gray-600">
          Bugün için randevunuz yok.
        </span>
        <button
          onClick={onAddAppointment}
          className="text-sm font-medium text-brand-main hover:underline"
        >
          Randevu ekle
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => onAppointmentClick(next.id)}
      className="w-full flex items-center p-4 bg-white rounded-2xl shadow-sm border-l-4 border-brand-yellow hover:shadow-md transition-shadow space-x-3"
    >
      <ClockIcon className="h-5 w-5 text-brand-yellow flex-shrink-0" />
      <div className="flex-1 flex flex-col items-start">
        <span className="text-base font-semibold text-gray-800">
          {format(new Date(next.start), "HH:mm", { locale: tr })}
        </span>
        <span className="text-xs text-gray-500">
          {next.patientName}
          {next.serviceName ? ` • ${next.serviceName}` : ""}
        </span>
      </div>
      <ChevronRightIcon className="h-5 w-5 text-gray-400" />
    </button>
  );
};

export default NextAppointmentCard;
