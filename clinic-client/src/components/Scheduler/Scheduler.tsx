// src/components/Scheduler.tsx
import React, { useState, useEffect } from "react";
import {
  ScheduleComponent,
  Day,
  Week,
  WorkWeek,
  Month,
  Inject,
  ResourcesDirective,
  ResourceDirective,
  ViewsDirective,
  ViewDirective,
} from "@syncfusion/ej2-react-schedule";
import { useAuth } from "../../contexts/AuthContext";
import { getAppointments, createAppointment } from "../../api/appointmentApi";

interface EmployeeResource {
  text: string;
  id: string;
  color: string;
}
interface Appointment {
  Id: string;
  Subject: string;
  StartTime: Date;
  EndTime: Date;
  ResourceId: string;
}

export const Scheduler: React.FC = () => {
  const { idToken, companyId, user } = useAuth();
  const [events, setEvents] = useState<Appointment[]>([]);
  const [employees, setEmployees] = useState<EmployeeResource[]>([]);

  // load employees as resources
  useEffect(() => {
    fetch(`/company/${companyId}/employees`, {
      headers: { Authorization: `Bearer ${idToken}` },
    })
      .then((r) => r.json())
      .then((list: any[]) =>
        setEmployees(
          list.map((e) => ({
            text: e.name,
            id: e.email,
            color: "#" + (((1 << 24) * Math.random()) | 0).toString(16),
          }))
        )
      );
  }, [companyId, idToken]);

  // load appointments
  useEffect(() => {
    getAppointments(idToken!, companyId!).then((apiEvents) =>
      setEvents(
        apiEvents.map((ev: any) => ({
          Id: ev.id,
          Subject: ev.title,
          StartTime: new Date(ev.start),
          EndTime: new Date(ev.end),
          ResourceId: ev.extendedProps.employeeEmail,
        }))
      )
    );
  }, [companyId, idToken]);

  // intercept creates & block invalid
  const onActionBegin = async (args: any) => {
    if (args.requestType === "eventCreate") {
      const appointment = args.data[0];
      // only allow if the user matches the resource (or is owner)
      if (
        appointment.ResourceId !== user!.email &&
        /* check owner flag */ false
      ) {
        args.cancel = true;
        alert("You can only create your own appointments.");
        return;
      }
      // send to server
      try {
        await createAppointment(
          idToken!,
          companyId!,
          appointment.patientId || "", // TODO: Replace with actual patientId
          appointment.ResourceId,
          appointment.serviceId || "", // TODO: Replace with actual serviceId
          appointment.StartTime.toISOString(),
          appointment.EndTime.toISOString()
        );
      } catch (e) {
        console.error("Failed to create appointment:", e);
        args.cancel = true;
        alert("Slot already taken or error.");
      }
    }
  };

  return (
    <ScheduleComponent
      height="auto"
      selectedDate={new Date()}
      eventSettings={{ dataSource: events }}
      group={{ byGroupID: false, resources: ["Employees"] }}
      actionBegin={onActionBegin}
    >
      <ResourcesDirective>
        <ResourceDirective
          field="ResourceId"
          title="Employee"
          name="Employees"
          dataSource={employees}
          textField="text"
          idField="id"
          colorField="color"
        />
      </ResourcesDirective>
      <ViewsDirective>
        <ViewDirective option="Day" />
        <ViewDirective option="WorkWeek" isSelected={false} />
        <ViewDirective option="Week" />
        {/* Custom 3-day view */}
        <ViewDirective option="TimelineDay" displayName="3 Days" interval={3} />
        <ViewDirective option="Month" />
      </ViewsDirective>
      <Inject services={[Day, Week, WorkWeek, Month /*TimelineDay*/]} />
    </ScheduleComponent>
  );
};
