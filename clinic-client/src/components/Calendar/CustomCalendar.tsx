// src/components/Calendar/CustomCalendar.tsx
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
import { AppointmentModal as CalendarAppointmentModal } from "../Modals/AppointmentModal";
import { AppointmentPreviewCard } from "../Cards/AppointmentPreviewCard";
import { useEnrichedAppointments } from "../../hooks/useEnrichedAppointments";

const BRAND_COLORS: string[] = [
  "#e2725b",
  "#71e25b",
  "#e2aa5b",
  "#e1e25b",
  "#a9e25b",
  "#e25b7c",
  "#e25bb4",
  "#d75be2",
  "#9f5be2",
];
const TODAY_BG = "bg-brand-main/10";
const BUSY_BG = "bg-brand-main/5";

const VIEW_CONFIG = {
  threeDay: { label: "3 Gün", days: 3 },
  timeGridWeek: { label: "Hafta", days: 7 },
  month: { label: "Ay", days: 0 },
};

function toDateTimeLocal(d: Date) {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function assignColumns(events: any[]) {
  const sorted = [...events].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );
  const result: any[] = [];
  for (const ev of sorted) {
    const overlaps = sorted.filter(
      (o) =>
        !(
          new Date(o.end) <= new Date(ev.start) ||
          new Date(o.start) >= new Date(ev.end)
        )
    );
    const used = new Set<number>();
    for (const o of overlaps) {
      if (o.col !== undefined) used.add(o.col);
    }
    let col = 0;
    while (used.has(col)) col++;
    ev.col = col;
    ev.colCount = overlaps.length;
    result.push(ev);
  }
  return result;
}

export const CustomCalendar: React.FC = () => {
  const { idToken, companyId, user } = useAuth();
  const currentEmail = user?.email ?? "";
  const isOwner = true;
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

  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] =
    useState<keyof typeof VIEW_CONFIG>("threeDay");

  const slotRef = useRef<HTMLDivElement>(null);
  const eventsRef = useRef<HTMLDivElement>(null);

  const [slotHeight, setSlotHeight] = useState(20);
  const [colWidth, setColWidth] = useState(0);

  const [dragStart, setDragStart] = useState<{
    day: Date;
    hour: number;
    minute: number;
  } | null>(null);
  const [previewSpan, setPreviewSpan] = useState<null | {
    start: Date;
    end: Date;
  }>(null);
  const [createSpan, setCreateSpan] = useState<null | {
    start: Date;
    end: Date;
  }>(null);

  const [modalEvent, setModalEvent] = useState<any | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [now, setNow] = useState(new Date());

  // tick
  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(iv);
  }, []);

  // measure slot height
  useEffect(() => {
    const measure = () => {
      if (slotRef.current) {
        const h = slotRef.current.getBoundingClientRect().height;
        if (h > 10) setSlotHeight(h);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // measure column width
  useEffect(() => {
    const measure = () => {
      if (!eventsRef.current) return;
      const days =
        calendarView === "month" ? 7 : VIEW_CONFIG[calendarView].days;
      const w = eventsRef.current.getBoundingClientRect().width;
      setColWidth(w / days);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [calendarView, currentDate]);

  // compute gridDates
  const gridDates = useMemo(() => {
    if (calendarView === "month") {
      const y = currentDate.getFullYear();
      const m = currentDate.getMonth();
      const first = new Date(y, m, 1);
      const firstDay = first.getDay();
      const start = new Date(y, m, 1 - firstDay);
      return Array.from({ length: 42 }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return d;
      });
    }
    const base = new Date(currentDate);
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

  // filter & color
  const coloredAppointments = useMemo(() => {
    const nowMs = Date.now();
    return appointments
      .filter(
        (evt) =>
          (!selectedEmployee || evt.employeeEmail === selectedEmployee) &&
          (!selectedService || evt.serviceId === selectedService)
      )
      .map((evt, idx) => ({
        ...evt,
        color:
          nowMs > new Date(evt.end).getTime()
            ? "#bbb"
            : BRAND_COLORS[idx % BRAND_COLORS.length],
      }));
  }, [appointments, selectedEmployee, selectedService]);

  // layout events
  const positioned = useMemo(() => {
    if (calendarView === "month") return [];
    const byDay: Record<number, any[]> = {};
    coloredAppointments.forEach((evt) => {
      const di = gridDates.findIndex(
        (d) => d.toDateString() === new Date(evt.start).toDateString()
      );
      if (di >= 0) (byDay[di] ||= []).push({ ...evt, dayIndex: di });
    });
    return Object.values(byDay).flatMap((group) =>
      assignColumns(group).map((ev) => {
        const s = new Date(ev.start),
          e = new Date(ev.end);
        return {
          ...ev,
          startHour: s.getHours() + s.getMinutes() / 60,
          startMinute: s.getMinutes(),
          duration: (e.getTime() - s.getTime()) / 36e5,
        };
      })
    );
  }, [coloredAppointments, gridDates, calendarView]);

  // nav
  const handleNav = (dir: "prev" | "today" | "next") => {
    setCurrentDate((prev) => {
      if (dir === "today") return new Date();
      const d = new Date(prev);
      if (calendarView === "month") {
        d.setMonth(d.getMonth() + (dir === "next" ? 1 : -1));
      } else {
        d.setDate(
          prev.getDate() +
            (dir === "next"
              ? VIEW_CONFIG[calendarView].days
              : -VIEW_CONFIG[calendarView].days)
        );
      }
      return d;
    });
  };

  // slots definition
  const HOURS = Array.from({ length: 15 }, (_, i) => 8 + i);
  const SLOTS = Array.from({ length: 28 }, (_, i) => ({
    hour: 8 + Math.floor(i / 2),
    minute: (i % 2) * 30,
  }));

  // drag-create handlers using pointer events for mobile
  const handleSlotPointerDown = (day: Date, hour: number, minute: number) => {
    setDragStart({ day, hour, minute });
    setPreviewSpan(null);
  };
  const handleSlotPointerMove = (
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
  const handleSlotPointerUp = (day: Date, hour: number, minute: number) => {
    if (!dragStart) return;
    const s = new Date(dragStart.day);
    s.setHours(dragStart.hour, dragStart.minute, 0, 0);
    const e = new Date(day);
    e.setHours(hour, minute + 30, 0, 0);
    setPreviewSpan(null);
    setCreateSpan({ start: s, end: e });
    setDragStart(null);
  };
  const handleGlobalPointerUp = () => {
    if (previewSpan) {
      setCreateSpan(previewSpan);
      setPreviewSpan(null);
    }
    setDragStart(null);
  };

  // modal start/end strings
  const [startStr, setStartStr] = useState("");
  const [endStr, setEndStr] = useState("");
  useEffect(() => {
    if (!createSpan) {
      setStartStr("");
      setEndStr("");
    } else {
      setStartStr(toDateTimeLocal(createSpan.start));
      setEndStr(toDateTimeLocal(createSpan.end));
    }
  }, [createSpan]);

  const handleCreate = async (sISO: string, eISO: string, empEmail: string) => {
    if (!createSpan || !selectedEmployee || !selectedService) {
      alert("Lütfen tüm alanları seçin.");
      return;
    }
    try {
      await createAppointment(
        idToken!,
        companyId!,
        "",
        empEmail,
        selectedService,
        sISO,
        eISO
      );
      setCreateSpan(null);
    } catch (e: any) {
      alert(e.message || "Oluşturulamadı.");
    }
  };

  // event click/modal
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

  const handleDragEnd = useCallback(
    async (evt: any, off: { x: number; y: number }) => {
      if (!eventsRef.current) return;
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
    [colWidth, slotHeight, gridDates, idToken, companyId]
  );

  const handleUpdate = async (
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
  };

  const handleCancel = async (id: string) => {
    await deleteAppointment(idToken!, companyId!, id);
    setModalEvent(null);
  };

  // monthly busy stats
  const monthlyDayStats = useMemo(() => {
    if (calendarView !== "month") return {};
    const counts: Record<string, any[]> = {};
    coloredAppointments.forEach((appt) => {
      const dayStr = new Date(appt.start).toDateString();
      counts[dayStr] = counts[dayStr] || [];
      counts[dayStr].push(appt);
    });
    return counts;
  }, [coloredAppointments, calendarView]);

  // CLICK MONTH-DAY: Switch to 3-day view starting that day
  const handleMonthDayClick = (date: Date) => {
    setCalendarView("threeDay");
    setCurrentDate(date);
  };

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
        {/* ... Month & 3-day/Week views above as before ... */}

        {calendarView !== "month" && (
          <>
            {/* Day labels header */}
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
            {/* Timeslots & events */}
            <div
              className="relative flex"
              onPointerUp={handleGlobalPointerUp}
              style={{ touchAction: "none" }}
            >
              {/* Now-line */}
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

              {/* Hour labels */}
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

              {/* Slots grid */}
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
                      style={{ touchAction: "none" }}
                      onPointerDown={() =>
                        handleSlotPointerDown(d, slot.hour, slot.minute)
                      }
                      onPointerMove={(e) =>
                        handleSlotPointerMove(
                          d,
                          slot.hour,
                          slot.minute,
                          e.buttons
                        )
                      }
                      onPointerUp={() =>
                        handleSlotPointerUp(d, slot.hour, slot.minute)
                      }
                    />
                  ))
                )}

                {/* Preview while dragging */}
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
                {positioned.map((evt) => {
                  const width = colWidth / evt.colCount;
                  const leftOffset = evt.col * width;
                  return (
                    <motion.div
                      key={evt.id}
                      drag
                      dragMomentum={false}
                      onDragEnd={(_, info) => {
                        const snapped = {
                          x: Math.round(info.offset.x / colWidth) * colWidth,
                          y:
                            Math.round(info.offset.y / slotHeight) * slotHeight,
                        };
                        handleDragEnd(evt, snapped);
                      }}
                      animate={{
                        top:
                          ((evt.startHour - 8) * 2 +
                            (evt.startMinute ?? 0) / 30) *
                          slotHeight,
                        left: evt.dayIndex * colWidth + leftOffset,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                      className="absolute z-20 cursor-pointer"
                      style={{
                        width: width - 3,
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
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* New appointment modal */}
      <NewAppointmentModal
        show={!!createSpan}
        onClose={() => setCreateSpan(null)}
        patients={[]}
        employees={employees}
        services={serviceOptions}
        isOwner={isOwner}
        currentEmail={currentEmail}
        selectedPatient=""
        setSelectedPatient={() => {}}
        selectedEmployee={selectedEmployee}
        setSelectedEmployee={setSelectedEmployee}
        selectedService={selectedService}
        setSelectedService={setSelectedService}
        startStr={startStr}
        setStartStr={setStartStr}
        endStr={endStr}
        setEndStr={setEndStr}
        onSubmit={handleCreate}
        onAddPatient={() => {}}
      />

      {/* Edit/view modal */}
      {modalEvent && (
        <CalendarAppointmentModal
          event={modalEvent}
          services={serviceOptions}
          employees={employees}
          onClose={() => setModalEvent(null)}
          onCancel={() => modalEvent && handleCancel(modalEvent.id)}
          onUpdate={handleUpdate}
          loading={modalLoading}
        />
      )}
    </div>
  );
};
