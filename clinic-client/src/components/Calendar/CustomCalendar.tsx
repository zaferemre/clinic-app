// src/components/CalendarView/CustomCalendar.tsx
import React, { useState, useMemo, useEffect } from "react";
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  SlotInfo,
  Formats,
  CalendarProps,
  EventProps,
} from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { tr } from "date-fns/locale";

import { useAuth } from "../../contexts/AuthContext";
import { useEnrichedAppointments } from "../../hooks/useEnrichedAppointments";
import { getPatients } from "../../api/patientApi";
import { listGroups } from "../../api/groupApi";
import {
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../../api/appointmentApi";

import CalendarHeader from "../Calendar/CalendarHeader";
import { FilterSidebar } from "./FilterSidebar";
import NewAppointmentModal from "../NewAppointment";
import AppointmentModal from "../Modals/AppointmentModal";

import type {
  Patient,
  Group,
  EnrichedAppointment,
} from "../../types/sharedTypes";

// --- Localization & Setup ---
const locales = { tr };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});
const formats: Formats = {
  timeGutterFormat: "HH:mm",
  dayRangeHeaderFormat: ({ start, end }, culture, loc) =>
    `${loc!.format(start, "dd MMM", culture)} – ${loc!.format(
      end,
      "dd MMM yyyy",
      culture
    )}`,
  weekdayFormat: "EEEE",
  dayHeaderFormat: "dd.MM",
  eventTimeRangeFormat: ({ start, end }, culture, loc) =>
    `${loc!.format(start, "HH:mm", culture)} - ${loc!.format(
      end,
      "HH:mm",
      culture
    )}`,
};
const DragDropCalendar = withDragAndDrop<BigCalendarEvent, object>(
  BigCalendar as React.ComponentType<CalendarProps<BigCalendarEvent, object>>
);

const ACCENT = "#FF8269";
const PAST = "#A0AEC0";
const BG = "#FFFFFF";
const VIEW_CONFIG = {
  day: { label: "Gün", days: 1 },
  week: { label: "Hafta", days: 7 },
  month: { label: "Ay", days: 30 },
};

type CalendarViewOption = "day" | "week" | "month";
type BigCalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: EnrichedAppointment;
  resourceId?: string; // For resource view
};

export const CustomCalendar: React.FC = (): React.ReactNode => {
  const { idToken, selectedCompanyId, selectedClinicId, user } = useAuth();
  const currentUserId = user?.uid ?? "";
  // Check if user is owner - useful for future permission controls
  const isOwner =
    user?.memberships?.some((m) => m.roles.includes("owner")) ?? false;

  // Enriched appointment hook (events, employees, services)
  const { appointments, employees, services, refetch } =
    useEnrichedAppointments(idToken!, selectedCompanyId!, selectedClinicId!);

  // Patients & groups
  const [patients, setPatients] = useState<Patient[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    if (!idToken || !selectedCompanyId || !selectedClinicId) return;
    getPatients(idToken, selectedCompanyId, selectedClinicId).then(setPatients);
    listGroups(idToken, selectedCompanyId, selectedClinicId).then(setGroups);
  }, [idToken, selectedCompanyId, selectedClinicId]);

  // State: Calendar view & date
  const [view, setView] = useState<CalendarViewOption>("day");
  const [date, setDate] = useState<Date>(new Date());

  // Filters & modals
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterEmp, setFilterEmp] = useState<string>("");
  const [filterServ, setFilterServ] = useState<string>("");
  const [filterGrp, setFilterGrp] = useState<string>("");

  const [modalDay, setModalDay] = useState<Date | null>(null);
  const [appointmentModalData, setAppointmentModalData] =
    useState<EnrichedAppointment | null>(null);

  // New appointment form state
  const [newPatient, setNewPatient] = useState("");
  const [newEmployee, setNewEmployee] = useState("");
  const [newService, setNewService] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");

  // --- Employees as resources ---
  const resources = useMemo(
    () =>
      employees.map((emp) => ({
        resourceId: emp.userId, // CHANGE HERE!
        resourceTitle: emp.name ?? "",
      })),
    [employees]
  );

  const validEmployeeIds = new Set(employees.map((emp) => emp.userId));
  const events: BigCalendarEvent[] = useMemo(
    () =>
      appointments
        .filter(
          (evt) =>
            evt.id !== undefined &&
            (view !== "day" || validEmployeeIds.has(evt.employeeId))
        )
        .map((evt) => ({
          id: evt.id ?? evt._id,
          title: evt.patientName ?? evt.groupName ?? "Etkinlik",
          start: new Date(evt.start),
          end: new Date(evt.end),
          resource: evt,
          resourceId: evt.employeeId,
        })),
    [appointments, view, validEmployeeIds]
  );
  // --- Handlers ---
  const handleSelectSlot = (slot: SlotInfo) => {
    setModalDay(slot.start as Date);
    setNewStart((slot.start as Date).toISOString());
    setNewEnd((slot.end as Date).toISOString());
  };

  const handleDropResize = async ({ event, start, end }: any) => {
    await updateAppointment(
      idToken!,
      selectedCompanyId!,
      selectedClinicId!,
      event.id,
      {
        start: (start as Date).toISOString(),
        end: (end as Date).toISOString(),
      }
    );
    refetch?.();
  };

  const resetForm = () => {
    setModalDay(null);
    setAppointmentModalData(null);
    setNewPatient("");
    setNewEmployee("");
    setNewService("");
    setNewGroup("");
    setNewStart("");
    setNewEnd("");
  };

  type NewAppointmentDTO = {
    appointmentType: "individual" | "group" | "ozel";
    start: string;
    end: string;
    employeeId: string;
    serviceId?: string;
    patientId?: string;
    groupId?: string;
  };

  const handleNewAppointment = async (dto: NewAppointmentDTO) => {
    const payload = {
      ...dto,
      serviceId: dto.serviceId,
      appointmentType:
        dto.appointmentType === "ozel" ? "individual" : dto.appointmentType,
    };
    await createAppointment(
      idToken!,
      selectedCompanyId!,
      selectedClinicId!,
      payload
    );
    resetForm();
    refetch?.();
  };

  const handleDelete = async (id: string) => {
    await deleteAppointment(
      idToken!,
      selectedCompanyId!,
      selectedClinicId!,
      id
    );
    resetForm();
    refetch?.();
  };

  const handleUpdate = async (
    id: string,
    changes: { start: string; end: string; serviceId?: string }
  ) => {
    await updateAppointment(
      idToken!,
      selectedCompanyId!,
      selectedClinicId!,
      id,
      changes
    );
    resetForm();
    refetch?.();
  };

  // Time boundaries
  const minTime = new Date();
  minTime.setHours(8, 0, 0, 0);

  const maxTime = new Date();
  maxTime.setHours(22, 0, 0, 0);

  // Resource view should only be active for daily view
  const isResourceView = view === "day";
  console.log("EMPLOYEES", employees);
  console.log("RESOURCES", resources);
  console.log("EVENTS", events);

  return (
    <div className="w-full h-full flex flex-col" style={{ background: BG }}>
      {/* Header with date/view/filter controls */}
      <CalendarHeader
        currentDate={date}
        setCurrentDate={setDate}
        calendarView={view}
        setCalendarView={(v) => setView(v as CalendarViewOption)}
        VIEW_CONFIG={VIEW_CONFIG}
        onFilterOpen={() => setFilterOpen(true)}
      />

      <FilterSidebar
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        employees={employees}
        selectedEmployee={filterEmp}
        onEmployeeChange={(id) => setFilterEmp(id)}
        services={services}
        selectedService={filterServ}
        onServiceChange={(id) => setFilterServ(id)}
        groups={groups}
        selectedGroup={filterGrp}
        onGroupChange={(id) => setFilterGrp(id)}
        currentUserId={currentUserId}
        ownerUserId={currentUserId}
      />

      <div className="flex-1">
        <DragDropCalendar
          localizer={localizer}
          culture="tr"
          formats={formats}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "calc(100dvh - 100px)" }}
          popup
          toolbar={false}
          view={view}
          date={date}
          selectable
          onNavigate={setDate}
          onView={(v) => setView(v as CalendarViewOption)}
          onSelectSlot={handleSelectSlot}
          onEventDrop={handleDropResize}
          onEventResize={handleDropResize}
          onSelectEvent={(ev: any) => setAppointmentModalData(ev.resource)}
          components={{
            event: (props: EventProps<BigCalendarEvent>) => (
              <div className="truncate text-xs font-semibold">
                {props.event.title}
              </div>
            ),
          }}
          resizable
          draggableAccessor={() => true}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor:
                (event as BigCalendarEvent).end < new Date() ? PAST : ACCENT,
              color: "#fff",
              borderRadius: 6,
              fontSize: "0.75rem",
              padding: "2px 4px",
            },
          })}
          min={minTime}
          max={maxTime}
          step={30}
          timeslots={2}
          // Resource view props only for daily view
          {...(isResourceView
            ? {
                resources,
                resourceIdAccessor: (resource: any) => resource.resourceId,
                resourceTitleAccessor: (resource: any) =>
                  resource.resourceTitle,
              }
            : {})}
        />

        {modalDay && (
          <NewAppointmentModal
            show={modalDay !== null}
            patients={patients}
            employees={employees}
            services={services}
            groups={groups}
            currentUserId={currentUserId}
            currentUserName={user?.name ?? ""}
            selectedPatient={newPatient}
            setSelectedPatient={setNewPatient}
            selectedEmployee={newEmployee}
            setSelectedEmployee={setNewEmployee}
            selectedService={newService}
            setSelectedService={setNewService}
            selectedGroup={newGroup}
            setSelectedGroup={setNewGroup}
            modalDay={modalDay}
            startStr={newStart}
            setStartStr={setNewStart}
            endStr={newEnd}
            setEndStr={setNewEnd}
            onClose={() => setModalDay(null)}
            isOwner={isOwner}
            onSubmitIndividual={(start, end, empId, svcId) =>
              handleNewAppointment({
                appointmentType: "individual",
                start,
                end,
                employeeId: empId,
                serviceId: svcId,
                patientId: newPatient,
              })
            }
            onSubmitGroup={(grpId, start, end, empId, svcId) =>
              handleNewAppointment({
                appointmentType: "group",
                start,
                end,
                employeeId: empId,
                serviceId: svcId,
                groupId: grpId,
              })
            }
            onSubmitCustom={(start, end, empId) =>
              handleNewAppointment({
                appointmentType: "ozel",
                start,
                end,
                employeeId: empId,
              })
            }
            onAddPatient={() => setPatients([...patients])}
          />
        )}

        {appointmentModalData && (
          <AppointmentModal
            event={appointmentModalData}
            onClose={() => setAppointmentModalData(null)}
            onCancel={() =>
              appointmentModalData?.id
                ? handleDelete(appointmentModalData.id)
                : Promise.resolve()
            }
            onUpdate={handleUpdate}
            services={services}
            employees={employees}
          />
        )}
      </div>
    </div>
  );
};
