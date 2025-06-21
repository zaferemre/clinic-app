import { useState, useEffect, useCallback } from "react";
import { getPatients } from "../api/patientApi";
import { getServices } from "../api/servicesApi";
import { listEmployees } from "../api/employeeApi";
import type {
  Patient,
  ServiceInfo,
  EmployeeInfo,
  Group,
} from "../types/sharedTypes";

// Dynamic import for groupApi (if you want to avoid circular deps or optimize bundle)
const loadGroups = async (
  idToken: string,
  companyId: string,
  clinicId: string
): Promise<Group[]> => {
  const { listGroups } = await import("../api/groupApi");
  return listGroups(idToken, companyId, clinicId);
};

export interface UseHomeDataResult {
  patients: Patient[];
  services: ServiceInfo[];
  employees: EmployeeInfo[];
  groups: Group[];
  loading: boolean;
  error: string | null;
  unreadCount?: number;
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

  const fetchAll = useCallback(async () => {
    if (!idToken || !companyId || !clinicId) return;
    setLoading(true);
    setError(null);
    try {
      const [p, s, e, g] = await Promise.all([
        getPatients(idToken, companyId, clinicId),
        getServices(idToken, companyId, clinicId),
        listEmployees(idToken, companyId, clinicId),
        loadGroups(idToken, companyId, clinicId),
      ]);
      setPatients(p);
      setServices(s);
      setEmployees(e);
      setGroups(g);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Veri yüklenemedi.");
      }
    } finally {
      setLoading(false);
    }
  }, [idToken, companyId, clinicId]);

  // Auto-refresh on mount and when deps change
  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line
  }, [fetchAll, ...deps]);

  // Allow manual refresh (e.g. after modals)
  const refresh = fetchAll;

  return { patients, services, employees, groups, loading, error, refresh };
}
