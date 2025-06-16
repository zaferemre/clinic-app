import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { motion } from "framer-motion";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import {
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentById,
} from "../../api/appointmentApi";
import { ServiceAndEmployeeFilter } from "../CalendarView/ServiceAndEmployeeFilter";
import { NewAppointmentModal } from "../CalendarView/NewAppointmentModal";
import { getPatients } from "../../api/patientApi";
import { AppointmentModal as CalendarAppointmentModal } from "../Modals/AppointmentModal";
import { AppointmentPreviewCard } from "../Cards/AppointmentPreviewCard";
import { useEnrichedAppointments } from "../../hooks/useEnrichedAppointments";
import type { Patient } from "../../types/sharedTypes";

const BRAND_COLORS = [
  "#e2725b",
  "#71e25b",
  "#e2aa5b",
  "#e1e25b",
  "#a9e25b",
  "#e25b7c",
  "#e25bb4",
  "#d75be2",
  "#9f5be2",
] as const;
const TODAY_BG = "bg-brand-main/10";
const BUSY_BG = "bg-brand-main/5";
const VIEW_CONFIG = {
  threeDay: { label: "3 Gün", days: 3 },
  timeGridWeek: { label: "Hafta", days: 7 },
  month: { label: "Ay", days: 0 },
} as const;

function toDateTimeLocal(d: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

function assignColumns(events: { start: string; end: string }[]) {
  const sorted = [...events].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );
  const result: ((typeof sorted)[0] & { col: number; colCount: number })[] = [];
  sorted.forEach((evt) => {
    const overlaps = sorted.filter(
      (o) =>
        !(
          new Date(o.end) <= new Date(evt.start) ||
          new Date(o.start) >= new Date(evt.end)
        )
    );
    const used = new Set<number>();
    overlaps.forEach((o) => {
      const r = result.find((r) => r.start === o.start && r.end === o.end);
      if (r && r.col !== undefined) used.add(r.col);
    });
    let col = 0;
    while (used.has(col)) col++;
    result.push({ ...evt, col, colCount: overlaps.length });
  });
  return result;
}

export const CustomCalendar: React.FC = () => {
  const { idToken, companyId, user } = useAuth();
  const currentEmail = user?.email ?? "";
  const isOwner = user?.role === "owner";

  // Patients
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  useEffect(() => {
    if (!idToken || !companyId) return;
    getPatients(idToken, companyId).then(setPatients).catch(console.error);
  }, [idToken, companyId]);

  // Enriched data
  const { appointments, employees, services } = useEnrichedAppointments(
    idToken!,
    companyId!
  );
  const serviceOptions = useMemo(
    () =>
      services.map((s) => ({
        _id: s._id ?? "",
        serviceName: s.serviceName,
        servicePrice: s.servicePrice,
        serviceKapora: s.serviceKapora,
        serviceDuration: s.serviceDuration,
      })),
    [services]
  );

  // Filters
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  // Navigation
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] =
    useState<keyof typeof VIEW_CONFIG>("threeDay");

  // Layout refs
  const slotRef = useRef<HTMLDivElement>(null);
  const eventsRef = useRef<HTMLDivElement>(null);
  const [slotHeight, setSlotHeight] = useState(20);
  const [colWidth, setColWidth] = useState(0);

  // Drag-create state
  const [dragStart, setDragStart] = useState<null | {
    day: Date;
    hour: number;
    minute: number;
  }>(null);
  const [previewSpan, setPreviewSpan] = useState<null | {
    start: Date;
    end: Date;
  }>(null);
  const [createSpan, setCreateSpan] = useState<null | {
    start: Date;
    end: Date;
  }>(null);

  // Modal
  const [modalEvent, setModalEvent] = useState<any | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const measure = () => {
      const el = slotRef.current;
      if (el) {
        const h = el.getBoundingClientRect().height;
        if (h > 10) setSlotHeight(h);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    const measure = () => {
      const el = eventsRef.current;
      if (el) {
        const days =
          calendarView === "month" ? 7 : VIEW_CONFIG[calendarView].days;
        const w = el.getBoundingClientRect().width;
        setColWidth(w / days);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [calendarView, currentDate]);

  // HOURS and SLOTS definitions
  const HOURS = Array.from({ length: 15 }, (_, i) => 8 + i);
  const SLOTS = Array.from({ length: 28 }, (_, i) => ({
    hour: 8 + Math.floor(i / 2),
    minute: (i % 2) * 30,
  }));

  // Grid dates
  const gridDates = useMemo(() => {
    const base = new Date(currentDate);
    if (calendarView === "month") {
      const y = base.getFullYear();
      const m = base.getMonth();
      const first = new Date(y, m, 1);
      const firstDay = first.getDay();
      const start = new Date(y, m, 1 - firstDay);
      return Array.from({ length: 42 }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return d;
      });
    }
    base.setHours(0, 0, 0, 0);
    if (calendarView === "timeGridWeek") {
      const diff = (base.getDay() + 6) % 7;
      base.setDate(base.getDate() - diff);
    }
    return Array.from({ length: VIEW_CONFIG[calendarView].days }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return d;
    });
  }, [currentDate, calendarView]);

  // Filter & color
  const coloredAppointments = useMemo(() => {
    const nowMs = Date.now();
    return appointments
      .filter(
        (evt) =>
          (!selectedEmployee || evt.employeeEmail === selectedEmployee) &&
          (!selectedService || evt.serviceId === selectedService)
      )
      .map((evt, i) => ({
        ...evt,
        color:
          nowMs > new Date(evt.end).getTime()
            ? "#bbb"
            : BRAND_COLORS[i % BRAND_COLORS.length],
      }));
  }, [appointments, selectedEmployee, selectedService]);

  // Positioned events
  const positioned = useMemo(() => {
    if (calendarView === "month") return [];
    const byDay: Record<number, any[]> = {};
    coloredAppointments.forEach((evt) => {
      const idx = gridDates.findIndex(
        (d) => d.toDateString() === new Date(evt.start).toDateString()
      );
      if (idx >= 0) (byDay[idx] ??= []).push({ ...evt, dayIndex: idx });
    });
    return Object.values(byDay).flatMap((group) =>
      assignColumns(group).map((ev) => {
        const s = new Date(ev.start);
        const e = new Date(ev.end);
        return {
          ...ev,
          startHour: s.getHours() + s.getMinutes() / 60,
          startMinute: s.getMinutes(),
          duration: (e.getTime() - s.getTime()) / 36e5,
        };
      })
    );
  }, [coloredAppointments, gridDates, calendarView]);

  // Navigation
  const handleNav = (dir: "prev" | "today" | "next") =>
    setCurrentDate((prev) => {
      if (dir === "today") return new Date();
      const d = new Date(prev);
      if (calendarView === "month")
        d.setMonth(d.getMonth() + (dir === "next" ? 1 : -1));
      else
        d.setDate(
          prev.getDate() +
            (dir === "next"
              ? VIEW_CONFIG[calendarView].days
              : -VIEW_CONFIG[calendarView].days)
        );
      return d;
    });

  // Drag-create handlers
  const handleSlotMouseDown = (day: Date, hour: number, minute: number) => {
    setDragStart({ day, hour, minute });
    setPreviewSpan(null);
  };
  const handleSlotMouseEnter = (
    day: Date,
    hour: number,
    minute: number,
    buttons: number
  ) => {
    if (dragStart && (buttons & 1) === 1) {
      const s = new Date(dragStart.day);
      s.setHours(dragStart.hour, dragStart.minute, 0, 0);
      const e = new Date(day);
      e.setHours(hour, minute + 30, 0, 0);
      setPreviewSpan({ start: s, end: e });
    }
  };
  const handleSlotMouseUp = (day: Date, hour: number, minute: number) => {
    if (!dragStart) return;
    const s = new Date(dragStart.day);
    s.setHours(dragStart.hour, dragStart.minute, 0, 0);
    const e = new Date(day);
    e.setHours(hour, minute + 30, 0, 0);
    setPreviewSpan(null);
    setCreateSpan({ start: s, end: e });
    setDragStart(null);
  };
  const handleGlobalMouseUp = () => {
    if (previewSpan) {
      setCreateSpan(previewSpan);
      setPreviewSpan(null);
    }
    setDragStart(null);
  };

  // Handle drag-end reposition
  const handleDragEnd = useCallback(
    async (evt: any, off: { x: number; y: number }) => {
      if (!eventsRef.current) return;
      const days =
        calendarView === "month" ? 7 : VIEW_CONFIG[calendarView].days;
      const newDay = Math.round((evt.dayIndex * colWidth + off.x) / colWidth);
      const hrOff = Math.round((evt.startHour - 8) * 2 + off.y / slotHeight);
      const newHr = 8 + Math.floor(hrOff / 2);
      const newMin = (hrOff % 2) * 30;
      const st = new Date(gridDates[newDay]);
      st.setHours(newHr, newMin);
      const en = new Date(st);
      en.setTime(st.getTime() + evt.duration * 36e5);
      await updateAppointment(
        idToken!,
        companyId!,
        evt.id,
        st.toISOString(),
        en.toISOString()
      );
    },
    [colWidth, slotHeight, gridDates, idToken, companyId, calendarView]
  );

  // Create appointment callback
  const handleCreateAppointment = useCallback(
    async (sISO: string, eISO: string, empEmail: string) => {
      if (
        !createSpan ||
        !selectedEmployee ||
        !selectedService ||
        !selectedPatient
      ) {
        alert("Lütfen tüm alanları seçin.");
        return;
      }
      try {
        await createAppointment(
          idToken!,
          companyId!,
          selectedPatient,
          empEmail,
          selectedService,
          sISO,
          eISO
        );
        setCreateSpan(null);
      } catch (e: any) {
        alert(e.message || "Oluşturulamadı.");
      }
    },
    [
      createSpan,
      selectedEmployee,
      selectedService,
      selectedPatient,
      idToken,
      companyId,
    ]
  );

  // Event click
  const handleEventClick = useCallback(
    async (evt: any) => {
      setModalLoading(true);
      try {
        const detail = await getAppointmentById(idToken!, companyId!, evt.id);
        setModalEvent(detail);
      } catch {
        alert("Yükleme hatası");
      } finally {
        setModalLoading(false);
      }
    },
    [idToken, companyId]
  );

  // Update & cancel
  const handleUpdate = useCallback(
    async (
      id: string,
      changes: { start: string; end: string; serviceId?: string }
    ) => {
      await updateAppointment(
        idToken!,
        companyId!,
        id,
        changes.start,
        changes.end,
        changes.serviceId
      );
      setModalEvent(null);
    },
    [idToken, companyId]
  );
  const handleCancel = useCallback(
    async (id: string) => {
      await deleteAppointment(idToken!, companyId!, id);
      setModalEvent(null);
    },
    [idToken, companyId]
  );

  // Monthly stats
  const monthlyDayStats = useMemo(() => {
    if (calendarView !== "month") return {} as Record<string, any[]>;
    const counts: Record<string, any[]> = {};
    coloredAppointments.forEach((appt) => {
      const d = new Date(appt.start).toDateString();
      counts[d] = counts[d] ?? [];
      counts[d].push(appt);
    });
    return counts;
  }, [coloredAppointments, calendarView]);

  const handleMonthDayClick = useCallback((date: Date) => {
    setCalendarView("threeDay");
    setCurrentDate(date);
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-brand-bg rounded-t-xl shadow-md">
      <ServiceAndEmployeeFilter
        employees={employees}
        selectedEmployee={selectedEmployee}
        onEmployeeChange={setSelectedEmployee}
        currentUserEmail={currentEmail}
        ownerEmail={currentEmail}
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
      />
      {/* Navigation */}
      <div className="flex items-center px-4 py-2 sticky top-0 bg-brand-bg z-20 gap-2 border-b">
        <button
          className="rounded-full bg-brand-bg p-2 shadow-sm border border-brand-main"
          onClick={() => setFilterOpen(true)}
        >
          <FunnelIcon className="w-5 h-5 text-brand-main" />
        </button>
        <div className="flex gap-1 flex-1">
          <button
            className="p-1 rounded-full hover:bg-brand-main/10"
            onClick={() => handleNav("prev")}
          >
            <ChevronLeftIcon className="w-5 h-5 text-brand-main" />
          </button>
          <button
            className="px-3 py-1 bg-brand-main text-white rounded-full text-xs font-bold shadow"
            onClick={() => handleNav("today")}
          >
            Bugün
          </button>
          <button
            className="p-1 rounded-full hover:bg-brand-main/10"
            onClick={() => handleNav("next")}
          >
            <ChevronRightIcon className="w-5 h-5 text-brand-main" />
          </button>
        </div>
        <div className="flex border rounded-xl overflow-hidden shadow-sm">
          {Object.entries(VIEW_CONFIG).map(([key, v]) => (
            <button
              key={key}
              className={`px-2 py-1 text-xs font-semibold ${
                calendarView === key
                  ? "bg-brand-main text-white"
                  : "bg-brand-bg text-brand-main hover:bg-brand-main/10"
              }`}
              onClick={() => setCalendarView(key as any)}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {/* MONTHLY VIEW */}
        {calendarView === "month" && (
          <div className="p-2 md:p-4">
            {/* Month/Year Header */}
            <div className="flex justify-between items-center mb-2 px-2">
              <span className="font-semibold text-lg">
                {currentDate.toLocaleString("tr-TR", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            {/* Grid */}
            <div className="grid grid-cols-7 bg-white rounded-lg shadow border text-xs">
              {/* Day names */}
              {["Pzr", "Pts", "Sal", "Çar", "Per", "Cum", "Cts"].map((d) => (
                <div
                  key={d}
                  className="p-2 font-bold text-center text-brand-main/80"
                >
                  {d}
                </div>
              ))}
              {gridDates.map((date, idx) => {
                const isToday =
                  date.toDateString() === new Date().toDateString();
                const inMonth = date.getMonth() === currentDate.getMonth();
                const appts = monthlyDayStats[date.toDateString()] || [];
                const busy = appts.length >= 5;
                return (
                  <div
                    key={idx}
                    className={`h-20 min-h-[5.5rem] border border-gray-100 relative flex flex-col items-center justify-start cursor-pointer group transition-all
                          ${
                            isToday
                              ? "ring-2 ring-brand-main ring-offset-2"
                              : ""
                          }
                          ${inMonth ? "" : "bg-gray-50 text-gray-300"}
                          ${busy && inMonth ? BUSY_BG : ""}
                        `}
                    onClick={() => inMonth && handleMonthDayClick(date)}
                  >
                    <span className="absolute right-2 top-2 font-semibold text-[13px] select-none">
                      {date.getDate()}
                    </span>
                    {/* Appointment indicators */}
                    <div className="flex flex-wrap justify-start items-center w-full gap-1 mt-6 px-1">
                      {appts.slice(0, 4).map((appt, i) => (
                        <span
                          key={appt.id || i}
                          className="inline-block w-2.5 h-2.5 rounded-full"
                          style={{ background: appt.color }}
                          title={`${appt.patientName || ""} ${
                            appt.serviceName || ""
                          }`}
                        />
                      ))}
                      {appts.length > 4 && (
                        <span className="text-xs text-gray-400 ml-1">
                          +{appts.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3 DAY & WEEKLY VIEW */}
        {calendarView !== "month" && (
          <>
            <div
              className="grid"
              style={{
                gridTemplateColumns: `40px repeat(${gridDates.length},minmax(0,1fr))`,
              }}
            >
              <div />
              {gridDates.map((d, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col items-center py-1 border-b text-xs ${
                    d.toDateString() === new Date().toDateString()
                      ? TODAY_BG
                      : ""
                  }`}
                >
                  <span className="font-semibold">
                    {d.toLocaleDateString("tr-TR", { weekday: "short" })}
                  </span>
                  <span>{d.getDate()}</span>
                </div>
              ))}
            </div>
            <div className="relative flex" onMouseUp={handleGlobalMouseUp}>
              {/* Now line */}
              {(() => {
                const idx = gridDates.findIndex(
                  (d) => d.toDateString() === now.toDateString()
                );
                if (idx < 0) return null;
                const hrs = now.getHours() + now.getMinutes() / 60;
                const y = (hrs - 8) * 2 * slotHeight;
                return (
                  <div
                    className="absolute h-[2px] bg-gradient-to-r from-transparent via-brand-main to-transparent opacity-75 z-30 pointer-events-none"
                    style={{
                      top: y,
                      left: 40 + idx * colWidth,
                      width: colWidth,
                    }}
                  />
                );
              })()}
              {/* Time labels */}
              <div className="flex flex-col w-11 items-end pr-1 border-r bg-brand-bg text-[12px]">
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="h-[40px] flex items-start justify-end pr-1 text-gray-400"
                  >
                    {h}:00
                  </div>
                ))}
              </div>
              {/* Slots & events */}
              <div
                ref={eventsRef}
                className="relative flex-1"
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${gridDates.length},minmax(0,1fr))`,
                }}
              >
                {SLOTS.map((slot, row) =>
                  gridDates.map((d, col) => (
                    <div
                      key={`${col}-${row}`}
                      ref={row === 0 && col === 0 ? slotRef : undefined}
                      className="h-[20px] border-t border-l border-gray-100"
                      onMouseDown={() =>
                        handleSlotMouseDown(d, slot.hour, slot.minute)
                      }
                      onMouseEnter={(e) =>
                        handleSlotMouseEnter(
                          d,
                          slot.hour,
                          slot.minute,
                          e.buttons
                        )
                      }
                      onMouseUp={() =>
                        handleSlotMouseUp(d, slot.hour, slot.minute)
                      }
                      onTouchStart={(e) => {
                        e.preventDefault();
                        handleSlotMouseDown(d, slot.hour, slot.minute);
                      }}
                      onTouchMove={(e) => {
                        e.preventDefault();
                        handleSlotMouseEnter(d, slot.hour, slot.minute, 1);
                      }}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        handleSlotMouseUp(d, slot.hour, slot.minute);
                      }}
                    />
                  ))
                )}
                {/* Preview on drag */}
                {previewSpan && (
                  <motion.div
                    className="absolute opacity-60 pointer-events-none z-25"
                    style={{
                      top:
                        ((previewSpan.start.getHours() - 8) * 2 +
                          previewSpan.start.getMinutes() / 30) *
                        slotHeight,
                      left:
                        gridDates.findIndex(
                          (d) =>
                            d.toDateString() ===
                            previewSpan.start.toDateString()
                        ) * colWidth,
                      width: colWidth,
                      height:
                        ((previewSpan.end.getTime() -
                          previewSpan.start.getTime()) /
                          1800000) *
                        slotHeight,
                    }}
                  >
                    <AppointmentPreviewCard
                      color="#e2725b"
                      patient="Yeni"
                      service=""
                      start={previewSpan.start}
                      end={previewSpan.end}
                    />
                  </motion.div>
                )}
                {/* Positioned events */}
                {positioned.map((evt) => (
                  <motion.div
                    key={evt.id}
                    drag
                    dragMomentum={false}
                    onDragEnd={(_, info) => {
                      const snapped = {
                        x: Math.round(info.offset.x / colWidth) * colWidth,
                        y: Math.round(info.offset.y / slotHeight) * slotHeight,
                      };
                      handleDragEnd(evt, snapped);
                    }}
                    animate={{
                      top:
                        ((evt.startHour - 8) * 2 +
                          (evt.startMinute ?? 0) / 30) *
                        slotHeight,
                      left:
                        evt.dayIndex * colWidth +
                        evt.col * (colWidth / evt.colCount),
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="absolute z-20 cursor-pointer"
                    style={{
                      width: colWidth / evt.colCount - 3,
                      height: evt.duration * 2 * slotHeight,
                      minHeight: 30,
                    }}
                    onClick={() => handleEventClick(evt)}
                  >
                    <AppointmentPreviewCard
                      color={evt.color}
                      patient={evt.patientName}
                      service={evt.serviceName}
                      start={new Date(evt.start)}
                      end={new Date(evt.end)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* New appointment modal */}
      <NewAppointmentModal
        show={!!createSpan}
        onClose={() => setCreateSpan(null)}
        patients={patients}
        employees={employees.map((e) => ({ email: e.email, name: e.name }))}
        appointments={appointments}
        services={serviceOptions}
        isOwner={isOwner}
        currentEmail={currentEmail}
        selectedPatient={selectedPatient}
        setSelectedPatient={setSelectedPatient}
        selectedEmployee={selectedEmployee}
        setSelectedEmployee={setSelectedEmployee}
        selectedService={selectedService}
        setSelectedService={setSelectedService}
        startStr={createSpan ? toDateTimeLocal(createSpan.start) : ""}
        setStartStr={() => {}}
        endStr={createSpan ? toDateTimeLocal(createSpan.end) : ""}
        setEndStr={() => {}}
        onSubmit={handleCreateAppointment}
        onAddPatient={() => {}}
      />

      {modalEvent && (
        <CalendarAppointmentModal
          event={modalEvent}
          services={serviceOptions}
          employees={employees.map((e) => ({ email: e.email, name: e.name }))}
          onClose={() => setModalEvent(null)}
          onCancel={() => modalEvent && handleCancel(modalEvent.id)}
          onUpdate={handleUpdate}
          loading={modalLoading}
        />
      )}
    </div>
  );
};
