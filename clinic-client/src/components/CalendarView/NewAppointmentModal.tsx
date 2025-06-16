import React, { useMemo, useState } from "react";
import AppModal from "../Modals/AppModal";

interface Patient {
  _id: string;
  name: string;
  credit: number;
}
interface Employee {
  email: string;
  name: string;
}
interface Service {
  _id: string;
  serviceName: string;
  serviceDuration: number;
}
interface AppointmentSlot {
  start: string;
  end: string;
  employeeEmail?: string;
}

interface NewAppointmentModalProps {
  show: boolean;
  onClose: () => void;
  patients: Patient[];
  employees: Employee[];
  services: Service[];
  appointments?: AppointmentSlot[];
  isOwner: boolean;
  currentEmail: string;
  selectedPatient: string;
  setSelectedPatient: (id: string) => void;
  selectedEmployee: string;
  setSelectedEmployee: (email: string) => void;
  selectedService: string;
  setSelectedService: (id: string) => void;
  startStr: string;
  setStartStr: (val: string) => void;
  endStr: string;
  setEndStr: (val: string) => void;
  onSubmit: (
    startISO: string,
    endISO: string,
    employeeEmail: string,
    serviceIdOrOzel: string
  ) => void;
  onAddPatient: () => void;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  show,
  onClose,
  patients,
  employees,
  services,
  appointments = [],
  isOwner,
  currentEmail,
  selectedPatient,
  setSelectedPatient,
  selectedEmployee,
  setSelectedEmployee,
  selectedService,
  setSelectedService,
  startStr,
  setStartStr,
  endStr,
  setEndStr,
  onSubmit,
  onAddPatient,
}) => {
  const [tab, setTab] = useState<"standart" | "ozel">("standart");

  // For custom time picking in Özel
  const [customStart, setCustomStart] = useState<string>("");
  const [customEnd, setCustomEnd] = useState<string>("");

  // For "Özel", make sure we reset state when switching tabs
  React.useEffect(() => {
    if (tab === "ozel") {
      setSelectedPatient("");
      setSelectedService("");
      setStartStr("");
      setEndStr("");
      setCustomStart("");
      setCustomEnd("");
    }
    // eslint-disable-next-line
  }, [tab]);

  const uniqueEmployees = useMemo(() => {
    const seen = new Set<string>();
    return employees.filter((e) => {
      if (seen.has(e.email)) return false;
      seen.add(e.email);
      return true;
    });
  }, [employees]);

  const employeeEmail = isOwner ? selectedEmployee : currentEmail;
  const duration =
    services.find((s) => s._id === selectedService)?.serviceDuration || 0;

  // Day selection logic for both tabs
  const baseDate = (tab === "ozel" ? customStart : startStr)
    ? new Date(tab === "ozel" ? customStart : startStr)
    : new Date();
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const day = baseDate.getDate();

  const now = new Date();
  const isToday =
    now.getFullYear() === year &&
    now.getMonth() === month &&
    now.getDate() === day;
  const isPast =
    new Date(year, month, day).setHours(0, 0, 0, 0) <
    new Date(now.getFullYear(), now.getMonth(), now.getDate()).setHours(
      0,
      0,
      0,
      0
    );

  // Only appointments for this employee, this day
  const busySlots = useMemo(() => {
    return (appointments || [])
      .filter(
        (a) =>
          a.employeeEmail === employeeEmail &&
          new Date(a.start).toDateString() ===
            new Date(year, month, day).toDateString()
      )
      .map((a) => ({
        start: new Date(a.start),
        end: new Date(a.end),
      }));
  }, [appointments, employeeEmail, year, month, day]);

  // All time slots in 30 min increments
  const timeSlots = useMemo(() => {
    const slots: Date[] = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute of [0, 30]) {
        slots.push(new Date(year, month, day, hour, minute));
      }
    }
    return slots;
  }, [year, month, day]);

  // --- Standard Mode: pick duration based on service ---
  const selectedRange = useMemo(() => {
    if (startStr && endStr) {
      const s = new Date(startStr);
      const e = new Date(endStr);
      return { start: s, end: e };
    }
    return null;
  }, [startStr, endStr]);

  // --- Özel Mode: user picks start and end freely ---
  const ozelValid = useMemo(() => {
    if (!customStart || !customEnd) return false;
    const s = new Date(customStart);
    const e = new Date(customEnd);
    if (e <= s) return false; // end must be after start
    // Must not overlap any busy slots!
    const overlaps = busySlots.some((b) => s < b.end && e > b.start);
    // Past check
    const slotIsPast = isPast || (isToday && e.getTime() <= now.getTime());
    return !overlaps && !slotIsPast;
  }, [customStart, customEnd, busySlots, isPast, isToday, now]);

  // Handles standard submit
  const handleCreate = () => {
    if (!selectedPatient || !selectedService || !startStr || !endStr) {
      alert("Lütfen tüm alanları doldurun.");
      return;
    }
    onSubmit(startStr, endStr, employeeEmail, selectedService);
  };

  // Handles özel submit
  const handleOzelCreate = () => {
    if (!customStart || !customEnd || !selectedEmployee) {
      alert("Lütfen çalışan ve zaman aralığı seçiniz.");
      return;
    }
    if (!ozelValid) {
      alert("Seçtiğiniz zaman aralığı uygun değil.");
      return;
    }
    onSubmit(customStart, customEnd, employeeEmail, "ozel");
  };

  // Render
  if (!show) return null;

  return (
    <AppModal open={show} onClose={onClose} title="Yeni Randevu Oluştur">
      {/* Tabs */}
      <div className="flex mb-4 gap-2">
        <button
          className={`flex-1 py-2 rounded-t-lg border-b-2 ${
            tab === "standart"
              ? "border-blue-500 bg-blue-50 font-semibold"
              : "border-gray-200 bg-gray-50"
          }`}
          onClick={() => setTab("standart")}
        >
          Standart
        </button>
        <button
          className={`flex-1 py-2 rounded-t-lg border-b-2 ${
            tab === "ozel"
              ? "border-blue-500 bg-blue-50 font-semibold"
              : "border-gray-200 bg-gray-50"
          }`}
          onClick={() => setTab("ozel")}
        >
          Özel
        </button>
      </div>

      <div className="space-y-4">
        {tab === "standart" && (
          <>
            {/* Patient Selector */}
            <div>
              <label className="block text-sm">Hasta</label>
              <div className="flex space-x-2">
                <select
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  className="flex-1 border rounded p-2"
                >
                  <option value="">Seçiniz</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} (Kredi: {p.credit})
                    </option>
                  ))}
                </select>
                <button
                  onClick={onAddPatient}
                  className="text-sm text-blue-600 underline"
                >
                  + Yeni
                </button>
              </div>
            </div>

            {/* Employee Selector (owner only) */}
            {isOwner && (
              <div>
                <label className="block text-sm">Çalışan</label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full border rounded p-2"
                >
                  <option value="">Seçiniz</option>
                  {uniqueEmployees.map((e) => (
                    <option key={e.email} value={e.email}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Service Selector */}
            <div>
              <label className="block text-sm">Hizmet</label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full border rounded p-2"
              >
                <option value="">Seçiniz</option>
                {services.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.serviceName}
                  </option>
                ))}
              </select>
            </div>

            {/* Time slot selector */}
            <div>
              <label className="block text-sm">Başlangıç Saatini Seçin</label>
              {!selectedService || !duration ? (
                <div className="text-sm text-gray-500 p-2">
                  Önce bir hizmet seçiniz.
                </div>
              ) : (
                <div className="flex flex-wrap max-h-64 overflow-y-auto mt-2">
                  {timeSlots.map((slot) => {
                    const slotEnd = new Date(slot.getTime() + duration * 60000);

                    const busy = busySlots.some(
                      (b) =>
                        slot.getTime() < b.end.getTime() &&
                        slotEnd.getTime() > b.start.getTime()
                    );

                    const slotIsPast =
                      isPast || (isToday && slotEnd.getTime() <= now.getTime());

                    const disabled = busy || slotIsPast;
                    const label = slot.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    return (
                      <button
                        key={slot.toISOString()}
                        disabled={disabled}
                        title={
                          busy
                            ? "Bu saat dolu."
                            : slotIsPast
                            ? isPast
                              ? "Geçmiş gün için randevu alınamaz."
                              : "Geçmiş saat için randevu alınamaz."
                            : ""
                        }
                        onClick={() => {
                          setStartStr(slot.toISOString());
                          setEndStr(slotEnd.toISOString());
                        }}
                        className={`p-2 m-1 border rounded transition ${
                          disabled
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "hover:bg-blue-100 cursor-pointer"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                İptal
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-green-500 text-white rounded"
              >
                Oluştur
              </button>
            </div>
          </>
        )}

        {tab === "ozel" && (
          <>
            {/* Employee Selector (owner only) */}
            {isOwner && (
              <div>
                <label className="block text-sm">Çalışan</label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full border rounded p-2"
                >
                  <option value="">Seçiniz</option>
                  {uniqueEmployees.map((e) => (
                    <option key={e.email} value={e.email}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Custom time pickers */}
            <div>
              <label className="block text-sm">Başlangıç Saati</label>
              <input
                type="datetime-local"
                className="w-full border rounded p-2"
                value={customStart}
                onChange={(e) => {
                  setCustomStart(e.target.value);
                  setCustomEnd(""); // reset end when start changes
                }}
              />
            </div>
            <div>
              <label className="block text-sm">Bitiş Saati</label>
              <input
                type="datetime-local"
                className="w-full border rounded p-2"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                min={customStart}
              />
            </div>
            {/* Validation/error messages */}
            {customStart && customEnd && !ozelValid && (
              <div className="text-xs text-red-500">
                Seçilen zaman aralığı dolu veya geçersiz!
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                İptal
              </button>
              <button
                onClick={handleOzelCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded"
                disabled={
                  !ozelValid || !customStart || !customEnd || !selectedEmployee
                }
              >
                Oluştur
              </button>
            </div>
          </>
        )}
      </div>
    </AppModal>
  );
};
