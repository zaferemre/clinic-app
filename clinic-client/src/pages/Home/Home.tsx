import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { GreetingHeader } from "../../components/GreetingHeader/GreetingHeader";
import { QuickActionsRow } from "../../components/QuickActionsRow/QuickActionsRow";
import { UpcomingAppointments } from "../../components/UpcomingAppointments/UpcomingAppointments";
import { HomeNavGrid } from "../../components/HomeNavGrid/HomeNavGrid";
import { NavigationBar } from "../../components/NavigationBar/NavigationBar";
import { useTodaysAppointments } from "../../hooks/useTodaysAppointments";
import { getNotifications } from "../../api/notificationApi";
import type { NotificationInfo } from "../../types/sharedTypes";

const Home: React.FC = () => {
  const { idToken, companyId, companyName, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // pass empty string for null so the hook signature stays `string`
  const { appointments: todaysAppointments, employees: allEmployees } =
    useTodaysAppointments(idToken ?? "", companyId ?? "");

  // Fetch unread notifications count
  useEffect(() => {
    const fetchUnread = async () => {
      if (!idToken || !companyId) {
        setUnreadCount(0);
        return;
      }
      try {
        const allNotifs: NotificationInfo[] = await getNotifications(
          idToken,
          companyId
        );
        setUnreadCount(allNotifs.filter((n) => !n.isCalled).length);
      } catch {
        setUnreadCount(0);
      }
    };
    fetchUnread();
  }, [idToken, companyId]);

  // only render once we're fully authenticated & have company info
  if (!idToken || !companyId || !companyName || !user) return null;

  return (
    <div className="flex flex-col h-screen bg-gray-50 pb-16">
      <div className="flex-1 overflow-auto px-4 py-4 space-y-4">
        {/* Greeting and company info */}
        <GreetingHeader
          userName={user.name}
          userAvatarUrl={user.imageUrl || ""}
          companyName={companyName}
        />

        {/* Nav grid */}
        <div className="rounded-2xl shadow bg-white p-2">
          <HomeNavGrid unreadCount={unreadCount} />
        </div>

        {/* Quick Actions */}
        <QuickActionsRow
          onAddAppointment={() => {}}
          onAddPatient={() => {}}
          onAddService={() => {}}
        />

        {/* Today's appointments */}
        <UpcomingAppointments
          appointments={todaysAppointments}
          user={{ email: user.email, role: user.role ?? "" }}
          employees={allEmployees}
        />
      </div>
      <NavigationBar />
    </div>
  );
};

export default Home;
