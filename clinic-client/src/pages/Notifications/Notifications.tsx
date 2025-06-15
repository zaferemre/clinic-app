// src/pages/Notifications/NotificationsPage.tsx
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  getNotifications,
  markNotificationCalled,
} from "../../api/notificationApi";
import { getPatientById } from "../../api/patientApi";

import { NotificationInfo } from "../../types/sharedTypes";

import { useAuth } from "../../contexts/AuthContext";
import { NavigationBar } from "../../components/NavigationBar/NavigationBar";

import { PhoneIcon, CheckIcon } from "@heroicons/react/24/outline";

const NotificationsPage: React.FC = () => {
  const { idToken, companyId, companyName } = useAuth();
  const [notifications, setNotifications] = useState<NotificationInfo[]>([]);
  const [todayStr, setTodayStr] = useState("");

  // Format today’s header (e.g. “TUESDAY 9 APRIL”)
  useEffect(() => {
    const now = new Date();
    setTodayStr(format(now, "EEEE d MMMM").toUpperCase());
  }, []);

  const fetchAll = async () => {
    if (!idToken || !companyId) return;
    try {
      const list = await getNotifications(idToken, companyId);
      setNotifications(list);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setNotifications([]);
    }
  };

  useEffect(() => {
    if (idToken && companyId) fetchAll();
  }, [idToken, companyId, fetchAll]);

  const handleDial = async (patientId: string) => {
    if (!idToken || !companyId) return;
    try {
      const patient = await getPatientById(idToken, companyId, patientId);
      if (patient.phone) {
        window.open(`tel:${patient.phone}`);
      } else {
        alert("Müşteri telefon numarası bulunamadı.");
      }
    } catch (err: unknown) {
      console.error("❌ Error fetching single patient:", err);
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      alert(`Müşteri bilgisi alınırken hata oluştu:\n${msg}`);
    }
  };

  const handleMarkCalled = async (notifId: string) => {
    if (!idToken || !companyId) return;
    try {
      await markNotificationCalled(idToken, companyId, notifId);
      await fetchAll();
    } catch (err: unknown) {
      console.error("❌ Error marking called:", err);
      const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
      alert(msg);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-brand-gray-100 pb-16">
      {/* Header */}
      <header className="pt-4 px-4">
        <p className="text-xs text-brand-green-500 tracking-wide">{todayStr}</p>
        <h1 className="mt-1 text-2xl font-bold text-brand-black">
          {companyName} › Çağrı Listesi
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto px-4 pt-4">
        <div className="bg-white rounded-xl shadow p-4 space-y-4">
          {notifications.length === 0 ? (
            <p className="text-sm text-brand-gray-500">Aranacak müşteri yok.</p>
          ) : (
            <ul className="space-y-3">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className="bg-brand-gray-100 rounded-lg p-3 flex items-start justify-between shadow-sm"
                >
                  <div className="flex-1 pr-4">
                    <p className="font-medium text-brand-black">
                      {n.patientName}
                    </p>
                    <p className="text-xs text-brand-gray-600 mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                    {n.note && (
                      <p className="text-xs italic text-brand-gray-500 mt-1">
                        “{n.note}”
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        handleDial(
                          typeof n.patientId === "string"
                            ? n.patientId
                            : n.patientId?._id
                        )
                      }
                      className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200"
                      aria-label="Ara"
                    >
                      <PhoneIcon className="w-5 h-5 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleMarkCalled(n.id)}
                      className="p-2 bg-green-100 rounded-lg hover:bg-green-200"
                      aria-label="Arandı"
                    >
                      <CheckIcon className="w-5 h-5 text-green-600" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <NavigationBar />
    </div>
  );
};

export default NotificationsPage;
