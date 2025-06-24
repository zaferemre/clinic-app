// src/hooks/useEnrichedAppointments.ts
import { useState, useEffect, useCallback } from "react";
import { getAppointments } from "../api/appointmentApi";
import { listEmployees } from "../api/employeeApi";
import { getServices } from "../api/servicesApi";
import { getPatients } from "../api/patientApi";
import { listGroups } from "../api/groupApi";
import type {
  Appointment,
  EnrichedAppointment,
  EmployeeInfo,
  ServiceInfo,
  Group,
  Patient,
} from "../types/sharedTypes";

interface Result {
  appointments: EnrichedAppointment[];
  employees: EmployeeInfo[];
  services: ServiceInfo[];
  refetch: () => Promise<void>;
}

export function useEnrichedAppointments(
  token: string,
  companyId: string,
  clinicId: string
): Result {
  const [appointments, setAppointments] = useState<EnrichedAppointment[]>([]);
  const [employees, setEmployees] = useState<EmployeeInfo[]>([]);
  const [services, setServices] = useState<ServiceInfo[]>([]);

  const fetchAll = useCallback(async () => {
    if (!token || !companyId || !clinicId) return;
    try {
      const [rawAppointments, emps, srvs, pats, grps] = await Promise.all([
        getAppointments(token, companyId, clinicId),
        listEmployees(token, companyId, clinicId),
        getServices(token, companyId, clinicId),
        getPatients(token, companyId, clinicId),
        listGroups(token, companyId, clinicId),
      ]);

      setEmployees(emps);
      setServices(srvs);

      const patientMap = new Map<string, Patient>(pats.map((p) => [p._id, p]));
      const employeeMap = new Map<string, EmployeeInfo>(
        emps.map((e) => [e.userId, e])
      );
      const serviceMap = new Map<string, ServiceInfo>(
        srvs.map((s) => [s._id!, s])
      );
      const groupMap = new Map<string, Group>(grps.map((g) => [g._id, g]));

      const enriched: EnrichedAppointment[] = rawAppointments.map(
        ({ _id, ...a }: Appointment & { _id: string }) => ({
          _id, // keep the original Mongo ID
          id: _id, // alias it for the calendar
          ...a,
          patientName: a.patientId
            ? patientMap.get(a.patientId)?.name
            : undefined,
          employeeName: a.employeeId
            ? employeeMap.get(a.employeeId)?.name
            : undefined,
          serviceName: a.serviceId
            ? serviceMap.get(a.serviceId)?.serviceName
            : undefined,
          groupName: a.groupId ? groupMap.get(a.groupId)?.name : undefined,
        })
      );

      setAppointments(enriched);
    } catch (err) {
      console.error("Failed to fetch enriched appointments:", err);
    }
  }, [token, companyId, clinicId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { appointments, employees, services, refetch: fetchAll };
}
