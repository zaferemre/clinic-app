// src/pages/NotificationsPage.tsx
import React, { useState, useEffect } from "react";
import {
  getNotifications,
  markNotificationDone,
  createNotification,
} from "../../api/notificationApi";
import { getPatientById } from "../../api/patientApi";
import { NotificationInfo } from "../../types/sharedTypes";
import { useAuth } from "../../contexts/AuthContext";
import { NavigationBar } from "../../components/NavigationBar/NavigationBar";
import GreetingHeader from "../../components/GreetingHeader/GreetingHeader";
import NotificationList from "../../components/Lists/NotificationList";
import { ChevronDownIcon, PlusIcon } from "@heroicons/react/24/outline";
import NewNotificationModal from "../../components/Modals/NewNotificationModal";

const PRIORITY_ORDER = { high: 0, normal: 1, low: 2, undefined: 3, null: 3 };

const NotificationsPage: React.FC = () => {
  const {
    idToken,
    selectedCompanyId,
    selectedClinicId,
    selectedClinicName,
    user,
  } = useAuth();

  const [notifications, setNotifications] = useState<NotificationInfo[]>([]);
  const [sortMode, setSortMode] = useState<"newest" | "priority">("newest");
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);

  useEffect(() => {
    if (!idToken || !selectedCompanyId || !selectedClinicId) return;
    setLoading(true);
    (async () => {
      try {
        const list = await getNotifications(
          idToken,
          selectedCompanyId,
          selectedClinicId
        );
        // hydrate each with patientName (can be optimized)
        const withNames = await Promise.all(
          list.map(async (n) => {
            let patientName = n.patientName || "—";
            if (!n.patientName && n.patientId) {
              try {
                const patient = await getPatientById(
                  idToken,
                  selectedCompanyId,
                  selectedClinicId,
                  n.patientId
                );
                patientName = patient?.name || "—";
              } catch {}
            }
            return { ...n, patientName };
          })
        );
        setNotifications(withNames);
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
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
      await markNotificationDone(
        idToken,
        selectedCompanyId,
        selectedClinicId,
        notifId
      );
      setNotifications((prev) => prev.filter((n) => n.id !== notifId));
    } catch (err) {
      console.error(err);
      alert("Bildirim işaretlenirken hata oluştu.");
    }
  };

  // Only show pending ones
  let pending = notifications.filter((n) => n.status === "pending");

  // Sort
  if (sortMode === "priority") {
    pending = [...pending].sort((a, b) => {
      const pa = (a as any).priority || undefined;
      const pb = (b as any).priority || undefined;
      const cmp =
        PRIORITY_ORDER[pa as keyof typeof PRIORITY_ORDER] -
        PRIORITY_ORDER[pb as keyof typeof PRIORITY_ORDER];
      if (cmp !== 0) return cmp;
      // If same priority, newest first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  } else {
    // Newest first
    pending = [...pending].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // --- Empty State ---
  const emptyState = (
    <div className="flex flex-col items-center justify-center py-14">
      <div className="mb-3 text-5xl">🎉</div>
      <h2 className="text-xl font-bold text-brand-main mb-1">Harika!</h2>
      <p className="text-gray-500 mb-2">
        Tüm müşteriler arandı, bekleyen bildirim yok.
      </p>
      <div className="bg-brand-main/10 text-brand-main px-3 py-1 rounded-full font-semibold text-sm mt-2">
        Güncel ve takipte kalın!
      </div>
    </div>
  );

  // Notification creation handler
  const handleNewNotification = async (formData: Partial<NotificationInfo>) => {
    if (!idToken || !selectedCompanyId || !selectedClinicId) return;
    await createNotification(idToken, selectedCompanyId, selectedClinicId, {
      ...formData,
      message: formData.message || "Yeni bildirim",
      status: formData.status || "pending",
      type: formData.type || "system", // Provide default type
      companyId: selectedCompanyId,
      clinicId: selectedClinicId,
    });
    // Refresh notifications after creating
    const list = await getNotifications(
      idToken,
      selectedCompanyId,
      selectedClinicId
    );
    setNotifications(list);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-brand-gray-100 via-white to-brand-gray-50 pb-16 px-4 sm:px-4 pt-4 relative">
      <GreetingHeader
        userAvatarUrl={user?.photoUrl || ""}
        clinicName={selectedClinicName || ""}
        pageTitle="Bildirimler"
        showBackButton={true}
      />
      <div className="flex items-center justify-between mb-3 mt-2">
        <div className="flex items-center gap-2">
          <span className="inline-block min-w-[2.2em] px-3 py-1 rounded-full bg-brand-main/90 text-white text-base text-center font-bold shadow transition">
            {pending.length}
          </span>
        </div>
        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400 font-medium mr-1">
            Sırala:
          </label>
          <div className="relative">
            <select
              className="appearance-none rounded-md border border-gray-200 bg-white py-1.5 pl-3 pr-9 text-sm font-semibold shadow focus:border-brand-main focus:ring-2 focus:ring-brand-main/20 transition"
              value={sortMode}
              onChange={(e) =>
                setSortMode(e.target.value as "newest" | "priority")
              }
            >
              <option value="newest">En Yeni</option>
              <option value="priority">Öncelik</option>
            </select>
            <ChevronDownIcon className="w-4 h-4 absolute top-2 right-2 pointer-events-none text-brand-main" />
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-auto">
        <div className="bg-white/80 rounded-xl shadow-sm space-y-4 p-3 sm:p-6 transition">
          {pending.length === 0 && !loading ? (
            emptyState
          ) : (
            <NotificationList
              notifications={pending}
              onDial={handleDial}
              onDone={handleMarkCalled}
              loading={loading}
              emptyMessage="Tüm müşteriler arandı, bekleyen bildirim yok."
            />
          )}
        </div>
      </main>

      {/* Single FAB */}
      <button
        className="fixed bottom-20 right-5 z-40 rounded-full bg-brand-main text-white shadow-xl p-3 hover:bg-brand-main-600 transition flex items-center justify-center"
        aria-label="Bildirim Ekle"
        onClick={() => setShowNewModal(true)}
      >
        <PlusIcon className="w-7 h-7" />
      </button>

      <NavigationBar />

      <NewNotificationModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        mode="full"
        onSubmit={handleNewNotification}
      />
    </div>
  );
};

export default NotificationsPage;
