import React, { useState, useEffect } from "react";
import {
  getNotifications,
  markNotificationCalled,
} from "../../api/notificationApi";
import { getPatientById } from "../../api/patientApi";
import { NotificationInfo } from "../../types/sharedTypes";
import { useAuth } from "../../contexts/AuthContext";
import { NavigationBar } from "../../components/NavigationBar/NavigationBar";
import { PhoneIcon, CheckIcon } from "@heroicons/react/24/outline";
import GreetingHeader from "../../components/GreetingHeader/GreetingHeader";

const NotificationsPage: React.FC = () => {
  const {
    idToken,
    selectedCompanyId,
    selectedClinicId,
    selectedClinicName,
    user,
  } = useAuth();

  const [notifications, setNotifications] = useState<NotificationInfo[]>([]);

  // Fetch & hydrate notifications once
  useEffect(() => {
    if (!idToken || !selectedCompanyId || !selectedClinicId) return;
    (async () => {
      try {
        const list = await getNotifications(
          idToken,
          selectedCompanyId,
          selectedClinicId
        );
        // hydrate each with patientName
        const withNames = await Promise.all(
          list.map(async (n) => {
            const patient = await getPatientById(
              idToken,
              selectedCompanyId,
              selectedClinicId,
              n.patientId
            );
            return { ...n, patientName: patient.name || "—" };
          })
        );
        setNotifications(withNames);
      } catch {
        setNotifications([]);
      }
    })();
  }, [idToken, selectedCompanyId, selectedClinicId]);

  const handleDial = async (patientId: string) => {
    if (!idToken || !selectedCompanyId || !selectedClinicId) return;
    try {
      const patient = await getPatientById(
        idToken,
        selectedCompanyId,
        selectedClinicId,
        patientId
      );
      if (patient.phone) window.open(`tel:${patient.phone}`);
      else alert("Müşteri telefon numarası bulunamadı.");
    } catch (err) {
      console.error(err);
      alert("Müşteri bilgisi alınırken hata oluştu.");
    }
  };

  const handleMarkCalled = async (notifId: string) => {
    if (!idToken || !selectedCompanyId || !selectedClinicId) return;
    try {
      await markNotificationCalled(
        idToken,
        selectedCompanyId,
        selectedClinicId,
        notifId
      );
      // Remove it from local list immediately
      setNotifications((prev) => prev.filter((n) => n.id !== notifId));
    } catch (err) {
      console.error(err);
      alert("Bildirim işaretlenirken hata oluştu.");
    }
  };

  // Only show pending ones
  const pending = notifications.filter((n) => n.status === "pending");

  return (
    <div className="flex flex-col h-screen bg-brand-gray-100 pb-16 px-4 pt-4">
      {/* --- Replace header with GreetingHeader --- */}
      <GreetingHeader
        userAvatarUrl={user?.imageUrl || ""}
        clinicName={selectedClinicName || ""}
        pageTitle="Bildirimler"
        showBackButton={true}
      />

      <main className="flex-1 overflow-auto ">
        <div className="bg-white rounded-xl shadow p-4 space-y-4">
          {pending.length === 0 ? (
            <p className="text-sm text-brand-gray-500">Aranacak müşteri yok.</p>
          ) : (
            <ul className="space-y-3">
              {pending.map((n) => (
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
                      onClick={() => handleDial(n.patientId)}
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
