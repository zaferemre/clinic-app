// src/components/CalendarView/CustomCalendar.tsx
import React, { useState, useMemo, useEffect } from "react";
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  SlotInfo,
  Formats,
  View,
} from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css"; // ← fixed path
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

// -- Define the exact shape of events passed into BigCalendar
type BigCalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: EnrichedAppointment;
};

// — locale setup —
const locales = { tr };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// — custom formats & constants —
type CalendarViewOption = "day" | "week" | "month";

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

const ACCENT = "#FF8269";
const PAST = "#A0AEC0";
const BG = "#FFFFFF";
const VIEW_CONFIG = {
  day: { label: "Gün", days: 1 },
  week: { label: "Hafta", days: 7 },
  month: { label: "Ay", days: 30 },
};

// Wrap BigCalendar with drag-and-drop, specifying our event type
const DragDropCalendar = withDragAndDrop<BigCalendarEvent, object>(BigCalendar);

type CalendarEventComponentProps = {
  event: BigCalendarEvent;
};

const CalendarEventComponent: React.FC<CalendarEventComponentProps> = ({
  event,
}) => <div className="truncate text-xs font-semibold">{event.title}</div>;

export const CustomCalendar: React.FC = () => {
  const { idToken, selectedCompanyId, selectedClinicId, user } = useAuth();
  const yourEmail = user?.email ?? "";
  const isOwner = user?.role === "owner";

  // fetch appointments + metadata
  const { appointments, employees, services, refetch } =
    useEnrichedAppointments(idToken!, selectedCompanyId!, selectedClinicId!);

  // patients & groups
  const [patients, setPatients] = useState<Patient[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  useEffect(() => {
    if (!idToken || !selectedCompanyId || !selectedClinicId) return;
    getPatients(idToken, selectedCompanyId, selectedClinicId).then(setPatients);
    listGroups(idToken, selectedCompanyId, selectedClinicId).then(setGroups);
  }, [idToken, selectedCompanyId, selectedClinicId]);

  // calendar state
  const [view, setView] = useState<CalendarViewOption>("week");
  const [date, setDate] = useState<Date>(new Date());

  // filters
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterEmp, setFilterEmp] = useState("");
  const [filterServ, setFilterServ] = useState("");
  const [filterGrp, setFilterGrp] = useState("");

  // modal state
  const [modalDay, setModalDay] = useState<Date | null>(null);
  const [appointmentModalData, setAppointmentModalData] =
    useState<EnrichedAppointment | null>(null);

  // new-appointment form
  const [newPatient, setNewPatient] = useState("");
  const [newEmployee, setNewEmployee] = useState("");
  const [newService, setNewService] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");

  // map to BigCalendarEvent[]
  const events: BigCalendarEvent[] = useMemo(
    () =>
      appointments
        .filter(
          (evt) =>
            (!filterEmp || evt.employeeEmail === filterEmp) &&
            (!filterServ || evt.serviceId === filterServ) &&
            (!filterGrp || evt.groupId === filterGrp)
        )
        .map((evt) => ({
          id: evt.id,
          title: evt.patientName ?? evt.groupName ?? "Etkinlik",
          start: new Date(evt.start),
          end: new Date(evt.end),
          resource: evt,
        })),
    [appointments, filterEmp, filterServ, filterGrp]
  );

  // slot → new appointment
  const handleSelectSlot = (slot: SlotInfo) => {
    setModalDay(slot.start);
    setNewStart(slot.start.toISOString());
    setNewEnd(slot.end.toISOString());
  };

  // drag or resize → update appointment
  const handleDropResize = async ({
    event,
    start,
    end,
  }: {
    event: BigCalendarEvent;
    start: Date;
    end: Date;
  }) => {
    await updateAppointment(
      idToken!,
      selectedCompanyId!,
      selectedClinicId!,
      event.id,
      { start: start.toISOString(), end: end.toISOString() }
    );
    refetch?.();
  };

  // clear all modal state
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

  // DTO for creation (serviceId optional for "ozel")
  type NewAppointmentDTO = {
    appointmentType: "individual" | "group" | "ozel";
    start: string;
    end: string;
    employeeId: string;
    serviceId?: string;
    patientId?: string;
    groupId?: string;
  };

  // create new appointment
  const handleNewAppointment = async (dto: NewAppointmentDTO) => {
    // Map to API shape: always provide serviceId as string
    const apiPayload = {
      ...dto,
      serviceId: dto.serviceId ?? "",
      ...(dto.patientId ? { patientId: dto.patientId } : {}),
      ...(dto.groupId ? { groupId: dto.groupId } : {}),
      // appointmentType must be "individual" or "group" for API
      appointmentType:
        dto.appointmentType === "ozel" ? "individual" : dto.appointmentType,
    };
    await createAppointment(
      idToken!,
      selectedCompanyId!,
      selectedClinicId!,
      apiPayload
    );
    resetForm();
    refetch?.();
  };

  // delete & update
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

  // style past vs upcoming
  const eventPropGetter = (ev: BigCalendarEvent) => {
    const now = new Date();
    return {
      style: {
        backgroundColor: ev.end < now ? PAST : ACCENT,
        color: "#fff",
        borderRadius: 6,
        fontSize: "0.75rem",
        padding: "2px 4px",
      },
    };
  };

  // working hours
  const minTime = new Date();
  minTime.setHours(8, 0, 0, 0);
  const maxTime = new Date();
  maxTime.setHours(22, 0, 0, 0);

  return (
    <div className="w-full h-full flex flex-col" style={{ background: BG }}>
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
        onEmployeeChange={setFilterEmp}
        services={services}
        selectedService={filterServ}
        onServiceChange={setFilterServ}
        groups={groups}
        selectedGroup={filterGrp}
        onGroupChange={setFilterGrp}
        currentUserEmail={yourEmail}
        ownerEmail={yourEmail}
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
          onNavigate={setDate}
          onView={(v: View) => setView(v as CalendarViewOption)}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={(ev: BigCalendarEvent) =>
            setAppointmentModalData(ev.resource)
          }
          onEventDrop={({ event, start, end }) =>
            void handleDropResize({
              event,
              start: typeof start === "string" ? new Date(start) : start,
              end: typeof end === "string" ? new Date(end) : end,
            })
          }
          components={{
            event: CalendarEventComponent,
          }}
          resizable
          draggableAccessor={() => true}
          eventPropGetter={eventPropGetter}
          min={minTime}
          max={maxTime}
          step={30}
          timeslots={2}
          dayLayoutAlgorithm="no-overlap"
        />
      </div>

      <NewAppointmentModal
        show={!!modalDay}
        onClose={resetForm}
        patients={patients}
        employees={employees}
        services={services}
        groups={groups}
        isOwner={isOwner}
        currentUserId={yourEmail}
        currentUserName={user?.name ?? ""}
        selectedPatient={newPatient}
        setSelectedPatient={setNewPatient}
        selectedEmployee={newEmployee}
        setSelectedEmployee={setNewEmployee}
        selectedService={newService}
        setSelectedService={setNewService}
        selectedGroup={newGroup}
        setSelectedGroup={setNewGroup}
        modalDay={modalDay ?? undefined}
        startStr={newStart}
        setStartStr={setNewStart}
        endStr={newEnd}
        setEndStr={setNewEnd}
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

      {appointmentModalData && (
        <AppointmentModal
          event={appointmentModalData}
          services={services}
          employees={employees}
          onClose={() => setAppointmentModalData(null)}
          onCancel={() => handleDelete(appointmentModalData.id)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export default CustomCalendar;
