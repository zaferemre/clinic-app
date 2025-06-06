// src/pages/Notifications/NotificationsPage.tsx

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  getNotifications,
  markPatientCalled,
  getPatientById,
  NotificationInfo,
} from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { NavigationBar } from "../../components/NavigationBar/NavigationBar";

const NotificationsPage: React.FC = () => {
  const { idToken, clinicId, clinicName } = useAuth();
  const [notifications, setNotifications] = useState<NotificationInfo[]>([]);
  const [todayStr, setTodayStr] = useState("");

  // Format today’s header (e.g. “TUESDAY 9 APRIL”)
  useEffect(() => {
    const now = new Date();
    setTodayStr(format(now, "EEEE d MMMM").toUpperCase());
  }, []);

  // Fetch all pending notifications from the server
  const fetchAll = async () => {
    if (!idToken || !clinicId) return;
    try {
      const list = await getNotifications(idToken, clinicId);
      setNotifications(list);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setNotifications([]);
    }
  };

  // On mount (or whenever idToken/clinicId changes), load notifications
  useEffect(() => {
    if (idToken && clinicId) {
      fetchAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idToken, clinicId]);

  /**
   * “Ara” (Call) button behavior:
   *   - Determine the correct patient ID string. If `n.patientId` is already a string,
   *     use it directly. If it’s an object (populated document), grab its `._id` field.
   *   - Then call getPatientById(...) with that ID, so the URL is e.g.
   *     GET /clinic/:clinicId/patients/abc123… rather than /patients/[object Object].
   *   - If a phone number exists, open the dialer. Otherwise show an alert.
   */
  const handleDial = async (rawPatientId: string | { _id: string }) => {
    if (!idToken || !clinicId) return;

    // If `rawPatientId` is an object, extract its `_id`; otherwise assume it’s already a string
    const patientIdStr =
      typeof rawPatientId === "string" ? rawPatientId : rawPatientId._id;

    console.log("⚙️ handleDial using patientId:", patientIdStr);

    try {
      const patient = await getPatientById(idToken, clinicId, patientIdStr);
      console.log("✅ Fetched patient:", patient);

      if (patient.phone) {
        // Open the device dialer (this does NOT mark the notification as “Arandı”)
        window.open(`tel:${patient.phone}`);
      } else {
        alert("Hasta telefon numarası bulunamadı.");
      }
    } catch (err: any) {
      console.error("❌ Error fetching single patient:", err);
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      alert(`Hasta bilgisi alınırken hata oluştu:\n${msg}`);
    }
  };

  /**
   * “Arandı” (Called) button behavior:
   *   - Marks that notification as called on the server
   *   - Then re‐fetches the notifications list to remove it
   */
  const handleMarkCalled = async (notifId: string) => {
    if (!idToken || !clinicId) return;
    try {
      await markPatientCalled(idToken, clinicId, notifId);
      await fetchAll();
    } catch (err: any) {
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
          {clinicName} › Çağrı Listesi
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto px-4 pt-4">
        <div className="bg-white rounded-xl shadow p-4 space-y-4">
          {notifications.length === 0 ? (
            <p className="text-sm text-brand-gray-500">Aranacak hasta yok.</p>
          ) : (
            <ul className="space-y-3">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className="bg-brand-gray-100 rounded-lg p-3 flex justify-between items-center shadow-sm"
                >
                  <div className="flex-1 pr-2">
                    <p className="font-medium text-brand-black">
                      {n.patientName}
                    </p>
                    <p className="text-xs text-brand-gray-600 mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {/* “Ara” button: only opens the phone dialer */}
                  <button
                    onClick={() => handleDial(n.patientId as any)}
                    className="
                      mr-2 px-3 py-1 rounded-lg text-sm
                      border border-brand-green-300
                      shadow-md
                      bg-brand-blue-400 hover:bg-brand-blue-500
                      text-black focus:ring-2 focus:ring-brand-blue-300
                    "
                  >
                    Ara
                  </button>

                  {/* “Arandı” button: mark as called and refresh */}
                  <button
                    onClick={() => handleMarkCalled(n.id)}
                    className="
                      bg-brand-green-400 hover:bg-brand-green-500
                      text-white px-3 py-1 rounded-lg text-sm
                      focus:outline-none focus:ring-2 focus:ring-brand-green-300
                    "
                  >
                    Arandı
                  </button>
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
