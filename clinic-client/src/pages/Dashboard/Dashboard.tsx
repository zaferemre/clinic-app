// src/pages/Dashboard/Dashboard.tsx

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getPatients } from "../../api/patientApi";
import { getAppointments } from "../../api/appointmentApi";
import { getNotifications } from "../../api/notificationApi";
import { CalendarEvent, NotificationInfo } from "../../types/sharedTypes";
import { NavigationBar } from "../../components/NavigationBar/NavigationBar";

// Heroicons
import {
  UsersIcon,
  UserGroupIcon,
  CalendarIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

export const Dashboard: React.FC = () => {
  const { idToken, companyId } = useAuth();
  const [patientCount, setPatientCount] = useState(0);
  const [todayAppointments, setTodayAppointments] = useState<CalendarEvent[]>(
    []
  );
  const [unreadAlerts, setUnreadAlerts] = useState<NotificationInfo[]>([]);

  const navigate = useNavigate();
  // Keep a ref to the interval ID so we can clear it on unmount.
  const pollInterval = useRef<number | null>(null);

  // Fetch everything needed for the dashboard at once:
  const fetchAllDashboardData = async () => {
    if (!idToken || !companyId) return;

    // 1) Patients count
    getPatients(idToken, companyId)
      .then((data) => setPatientCount(data.length))
      .catch(() => setPatientCount(0));

    // 2) Today's appointments
    getAppointments(idToken, companyId)
      .then((events) => {
        const todayStr = new Date().toISOString().split("T")[0];
        const todays = events.filter((ev) => ev.start.startsWith(todayStr));
        setTodayAppointments(todays);
      })
      .catch(() => setTodayAppointments([]));

    // 3) Unread alerts
    getNotifications(idToken, companyId)
      .then((list) => {
        setUnreadAlerts(list);
      })
      .catch(() => setUnreadAlerts([]));
  };

  // On mount (and whenever idToken or companyId changes), do an initial fetch
  // and then start polling every 30 seconds.
  useEffect(() => {
    if (!idToken || !companyId) return;

    // Initial load:
    fetchAllDashboardData();

    // Then set up a 30-second poll:
    pollInterval.current = window.setInterval(fetchAllDashboardData, 30_000);

    return () => {
      // Clear the interval on unmount or when companyId/idToken changes:
      if (pollInterval.current !== null) {
        clearInterval(pollInterval.current);
      }
    };
  }, [idToken, companyId]);

  // Show a little red dot if there are any unread alerts:
  const showAlertDot = unreadAlerts.length > 0;

  return (
    <div className="flex flex-col h-screen bg-brand-gray-100">
      {/* Scrollable area */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        <h1 className="text-2xl font-semibold text-brand-black">Panel</h1>

        {/* 4‐Box Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Patients Box */}
          <div
            className="
              relative
              flex flex-col items-center justify-center
              bg-white hover:bg-blue-100 transition
              rounded-xl shadow p-6 cursor-pointer
            "
            onClick={() => navigate("/patients")}
          >
            <UsersIcon className="h-10 w-10 text-blue-500" />
            <p className="mt-3 text-lg font-medium text-blue-600">Patients</p>
            <span className="mt-1 text-sm text-blue-500">
              {patientCount} kayıtlı
            </span>
          </div>

          {/* Employees Box */}
          <div
            className="
              relative
              flex flex-col items-center justify-center
              bg-white hover:bg-pink-100 transition
              rounded-xl shadow p-6 cursor-pointer
            "
            onClick={() => navigate("/workers")}
          >
            <UserGroupIcon className="h-10 w-10 text-pink-500" />
            <p className="mt-3 text-lg font-medium text-pink-600">Employees</p>
          </div>

          {/* Calendar Box */}
          <div
            className="
              relative
              flex flex-col items-center justify-center
              bg-white hover:bg-yellow-100 transition
              rounded-xl shadow p-6 cursor-pointer
            "
            onClick={() => navigate("/calendar")}
          >
            <CalendarIcon className="h-10 w-10 text-yellow-500" />
            <p className="mt-3 text-lg font-medium text-yellow-600">Calendar</p>
            <span className="mt-1 text-sm text-yellow-500">
              {todayAppointments.length} bugün
            </span>
          </div>

          {/* Alerts Box */}
          <div
            className="
              relative
              flex flex-col items-center justify-center
              bg-white hover:bg-red-100 transition
              rounded-xl shadow p-6 cursor-pointer
            "
            onClick={() => navigate("/notifications")}
          >
            {/* Red dot in top right if there are unread alerts */}
            {showAlertDot && (
              <span className="absolute top-3 right-3 h-3 w-3 bg-red-500 rounded-full" />
            )}

            <BellIcon className="h-10 w-10 text-red-500" />
            <p className="mt-3 text-lg font-medium text-red-600">Alerts</p>
            <span className="mt-1 text-sm text-red-500">
              {unreadAlerts.length} beklemede
            </span>
          </div>

          {/* Messaging Box */}
          <div
            className="
              relative
              flex flex-col items-center justify-center
              bg-white hover:bg-green-100 transition
              rounded-xl shadow p-6 cursor-pointer
            "
            onClick={() => navigate("/messaging")}
          >
            <ChatBubbleLeftRightIcon className="h-10 w-10 text-green-500" />
            <p className="mt-3 text-lg font-medium text-green-600">Messaging</p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <NavigationBar />
    </div>
  );
};
