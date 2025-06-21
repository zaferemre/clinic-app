import { useState, useEffect, useCallback } from "react";
import { getPatients } from "../api/patientApi";
import { getServices } from "../api/servicesApi";
import { listEmployees } from "../api/employeeApi";
import { listGroups as apiListGroups } from "../api/groupApi";
import { getNotifications } from "../api/notificationApi";
import type {
  Patient,
  ServiceInfo,
  EmployeeInfo,
  Group,
  NotificationInfo,
} from "../types/sharedTypes";

export interface UseHomeDataResult {
  patients: Patient[];
  services: ServiceInfo[];
  employees: EmployeeInfo[];
  groups: Group[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
  latestNotification: NotificationInfo | null;
  refresh: () => Promise<void>;
}

export function useHomeData(
  idToken: string | undefined,
  companyId: string | undefined,
  clinicId: string | undefined,
  deps: unknown[] = []
): UseHomeDataResult {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [employees, setEmployees] = useState<EmployeeInfo[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestNotification, setLatestNotification] =
    useState<NotificationInfo | null>(null);

  const fetchAll = useCallback(async () => {
    if (!idToken || !companyId || !clinicId) return;
    setLoading(true);
    setError(null);

    try {
      // Fetch core data
      const [p, s, e, g, notifications] = await Promise.all([
        getPatients(idToken, companyId, clinicId),
        getServices(idToken, companyId, clinicId),
        listEmployees(idToken, companyId, clinicId),
        apiListGroups(idToken, companyId, clinicId),
        getNotifications(idToken, companyId, clinicId),
      ]);

      setPatients(p);
      setServices(s);
      setEmployees(e);
      setGroups(g);

      // Compute notification data
      const pending = notifications.filter((n) => n.status === "pending");
      setUnreadCount(pending.length);
      // Most recent by timestamp
      const sortedByDate = [...notifications].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setLatestNotification(sortedByDate[0] || null);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Veri yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [idToken, companyId, clinicId]);

  // Auto-refresh
  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAll, ...deps]);

  return {
    patients,
    services,
    employees,
    groups,
    loading,
    error,
    unreadCount,
    latestNotification,
    refresh: fetchAll,
  };
}
