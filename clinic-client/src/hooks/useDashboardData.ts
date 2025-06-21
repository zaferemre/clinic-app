import { useEffect, useState, useRef } from "react";

import { useAuth } from "../contexts/AuthContext";
import {
  CalendarEvent,
  NotificationInfo,
  ServiceInfo,
} from "../types/sharedTypes";
import { getPatients } from "../api/patientApi";
import { getAppointments } from "../api/appointmentApi";
import { getNotifications } from "../api/notificationApi";
import { getServices } from "../api/servicesApi";

export function useDashboardData() {
  const { idToken, selectedCompanyId, selectedClinicId } = useAuth();
  const [patientCount, setPatientCount] = useState(0);
  const [todayAppointments, setTodayAppointments] = useState<CalendarEvent[]>(
    []
  );
  const [unreadAlerts, setUnreadAlerts] = useState<NotificationInfo[]>([]);
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const pollInterval = useRef<number | null>(null);

  useEffect(() => {
    if (!idToken || !selectedCompanyId || !selectedClinicId) return;
    const fetchAllDashboardData = async () => {
      try {
        const [patients, events, notifications, servicesList] =
          await Promise.all([
            getPatients(idToken, selectedCompanyId, selectedClinicId),
            getAppointments(idToken, selectedCompanyId, selectedClinicId),
            getNotifications(idToken, selectedCompanyId, selectedClinicId),
            getServices(idToken, selectedCompanyId, selectedClinicId),
          ]);

        setPatientCount(patients.length);

        const todayStr = new Date().toISOString().split("T")[0];
        setTodayAppointments(
          events.filter((ev) => ev.start.startsWith(todayStr))
        );

        setUnreadAlerts(notifications.filter((n) => n.status === "pending"));

        setServices(servicesList);
      } catch (error) {
        // Optionally handle errors here
        console.error("Failed to fetch dashboard data:", error);
      }
    };
    fetchAllDashboardData();
    pollInterval.current = window.setInterval(fetchAllDashboardData, 30000);
    return () => {
      if (pollInterval.current !== null) clearInterval(pollInterval.current);
    };
  }, [idToken, selectedCompanyId, selectedClinicId]);

  return { patientCount, todayAppointments, unreadAlerts, services };
}
