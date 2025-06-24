// src/pages/ProfilePage/ProfilePage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  Formats,
  View,
} from "react-big-calendar";
import { motion } from "framer-motion";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { tr } from "date-fns/locale";

import {
  InformationCircleIcon,
  XCircleIcon,
  BuildingOffice2Icon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import DashboardHeader from "../../components/Dashboard/DashboardHeader";
import { NavigationBar } from "../../components/NavigationBar/NavigationBar";
import ProfileCreateCompanyButton from "../../components/Button/ProfileCreateCompanyButton";
import ProfileCreateClinicButton from "../../components/Button/ProfileCreateClinicButton";
import { listUserAppointments } from "../../api/userApi";
import { EnrichedAppointment } from "../../types/sharedTypes";

// --- date-fns localizer ---
const locales = { tr };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// Custom Turkish formats
const calendarFormats: Formats = {
  dateFormat: "dd",
  dayFormat: "dd.MM",
  weekdayFormat: "EEEE",
  monthHeaderFormat: "MMMM yyyy",
  dayHeaderFormat: "EEEE dd.MM.yyyy",
  dayRangeHeaderFormat: ({ start, end }) =>
    `${format(start, "dd/MM/yyyy")} – ${format(end, "dd/MM/yyyy")}`,
  timeGutterFormat: "HH:mm",
  eventTimeRangeFormat: ({ start, end }, culture, local) =>
    local
      ? `${local.format(start, "HH:mm", culture)} - ${local.format(
          end,
          "HH:mm",
          culture
        )}`
      : `${format(start, "HH:mm")} - ${format(end, "HH:mm")}`,
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const {
    user,
    idToken,
    companies,
    clinics,
    memberships,
    selectedCompanyId,
    selectedClinicId,
    setSelectedCompanyId,
    setSelectedClinicId,
    setSelectedClinicName,
  } = useAuth();

  const prevCompanyRef = useRef<string | null>(selectedCompanyId);
  useEffect(() => {
    if (
      prevCompanyRef.current &&
      selectedCompanyId &&
      prevCompanyRef.current !== selectedCompanyId
    ) {
      // Company has changed!
      if (clinics.length > 0) {
        // Route to first clinic of new company
        navigate(`/clinics/${clinics[0]._id}`);
        setSelectedClinicId(clinics[0]._id);
        setSelectedClinicName(clinics[0].name);
      } else {
        // No clinics: send to clinics selection/creation page
        navigate(`/clinics`);
        setSelectedClinicId(null);
        setSelectedClinicName(null);
      }
    }
    prevCompanyRef.current = selectedCompanyId;
    // We only want to run this effect when selectedCompanyId changes,
    // and after clinics are set for the new company
    // eslint-disable-next-line
  }, [selectedCompanyId, clinics]);
  // Role
  const userRole = useMemo(() => {
    const mem =
      memberships.find(
        (m) =>
          m.companyId === selectedCompanyId && m.clinicId === selectedClinicId
      ) || memberships.find((m) => m.companyId === selectedCompanyId);
    const role = mem
      ? Array.isArray(mem.roles)
        ? mem.roles[0]
        : mem.roles
      : "staff";
    return role ?? "staff";
  }, [memberships, selectedCompanyId, selectedClinicId]);
  const isOwner = userRole === "owner";

  // Calendar
  const [events, setEvents] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<View>("month");
  const [infoVisible, setInfoVisible] = useState(false);
  const infoMessage =
    "Bu takvim, sistemdeki tüm kliniklerdeki randevularınızı içerir ve sadece siz görebilirsiniz. Randevu eklemek veya düzenlemek için lütfen ilgili kliniğin sayfasına gidin.";

  // Colors
  const clinicColors = useMemo(() => {
    const palette = ["#34D399", "#60A5FA", "#FBBF24", "#EF4444", "#8B5CF6"];
    return clinics.reduce<Record<string, string>>((map, c, i) => {
      map[c._id] = palette[i % palette.length];
      return map;
    }, {});
  }, [clinics]);

  // Load
  useEffect(() => {
    if (!user || !idToken) return;
    (async () => {
      try {
        const appts: EnrichedAppointment[] = await listUserAppointments(
          idToken
        );
        setEvents(
          appts.map((a) => ({
            title:
              a.appointmentType === "group"
                ? `Group: ${a.groupName || ""}`
                : `Service: ${a.serviceName || ""}`,
            start: new Date(a.start),
            end: new Date(a.end),
            clinicId: a.clinicId,
          }))
        );
      } catch {}
    })();
  }, [user, idToken]);

  // Animate on change
  const [animating, setAnimating] = useState(false);
  const handleSelectCompany = (cid: string) => {
    setAnimating(true);
    setTimeout(() => {
      setSelectedCompanyId(cid);
      setSelectedClinicId(null);
    }, 300);
  };
  const handleSelectClinic = (clid: string, name: string) => {
    // Simply select clinic without full page reload
    setSelectedClinicId(clid);
    setSelectedClinicName(name);
  };

  // time bounds
  const minTime = new Date();
  minTime.setHours(8, 0, 0, 0);
  const maxTime = new Date();
  maxTime.setHours(22, 0, 0, 0);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: animating ? 0 : 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-screen bg-brand-gray-100 pb-16"
    >
      <div className="flex-1 overflow-auto p-4 space-y-6">
        <DashboardHeader />

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow p-6 flex items-center space-x-6 relative">
          <img
            src={
              user?.photoUrl ??
              "https://doodleipsum.com/200x200/outline?bg=D98D63&i=ab73c64a06c5bc119fec6e11c637f4a3"
            }
            alt={user?.name ?? "User"}
            className="w-24 h-24 rounded-full"
          />
          <div>
            <h2 className="text-2xl font-bold">{user?.name ?? "User"}</h2>
            <p className="text-gray-500">{user?.email ?? ""}</p>
            <p className="mt-2 text-sm">
              <span className="font-medium">Rol:</span> {userRole}
            </p>
          </div>
          <button
            onClick={() =>
              navigate(`/clinics/${selectedClinicId}/settings/user`)
            }
            className="absolute top-4 right-4 text-sm text-brand-main hover:underline"
          >
            Düzenle
          </button>
        </div>

        {/* Unified Calendar */}
        <div className="bg-white rounded-2xl shadow p-4 relative">
          <h3 className="text-lg font-semibold mb-2">Bireysel Takvimim</h3>
          <InformationCircleIcon
            className="w-6 h-6 absolute top-4 right-4 cursor-pointer"
            onClick={() => setInfoVisible((v) => !v)}
          />
          {infoVisible && (
            <div className="absolute top-12 right-4 w-64 bg-blue-50 border-blue-200 border rounded p-3 text-blue-800 text-sm">
              <div className="flex justify-between">
                <p>{infoMessage}</p>
                <XCircleIcon
                  className="w-5 h-5 cursor-pointer"
                  onClick={() => setInfoVisible(false)}
                />
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4 mb-4">
            {clinics.map((c) => (
              <div key={c._id} className="flex items-center space-x-2">
                <span
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: clinicColors[c._id] }}
                />
                <span className="text-sm text-gray-700">{c.name}</span>
              </div>
            ))}
          </div>

          <BigCalendar
            localizer={localizer}
            culture="tr"
            events={events as any}
            formats={calendarFormats}
            views={["month", "week", "day", "agenda"]}
            defaultView="agenda"
            date={currentDate}
            view={currentView}
            onNavigate={setCurrentDate}
            onView={(v) => setCurrentView(v as View)}
            startAccessor="start"
            endAccessor="end"
            min={minTime}
            max={maxTime}
            step={30}
            timeslots={2}
            style={{ height: 500 }}
            eventPropGetter={(evt: any) => ({
              style: {
                backgroundColor: clinicColors[evt.clinicId] || "#3174ad",
                color: "#fff",
                borderRadius: 4,
              },
            })}
            onSelectEvent={() => setInfoVisible(true)}
          />
        </div>

        {/* Companies Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Şirketler</h3>
            <ProfileCreateCompanyButton onCreated={handleSelectCompany} />
          </div>
          {companies.length === 0 ? (
            <div className="text-gray-400 italic">
              Henüz bir şirkete üye değilsiniz.
            </div>
          ) : (
            <div className="space-y-2">
              {companies.map((c) => (
                <div
                  key={c._id}
                  className={`flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border ${
                    c._id === selectedCompanyId
                      ? "border-brand-main"
                      : "border-transparent"
                  } hover:shadow-md transition`}
                >
                  <div className="flex items-center gap-3">
                    <BuildingOffice2Icon className="h-6 w-6 text-brand-main" />
                    <span className="font-medium text-gray-800">{c.name}</span>
                  </div>
                  {c._id !== selectedCompanyId ? (
                    <button
                      onClick={() => handleSelectCompany(c._id)}
                      className="px-3 py-1 bg-brand-main text-white rounded-full text-xs hover:bg-brand-dark transition"
                    >
                      Seç
                    </button>
                  ) : (
                    <span className="text-xs text-brand-main font-semibold">
                      Seçili
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clinics Section */}
        {selectedCompanyId && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Klinikler</h3>
              {isOwner && (
                <ProfileCreateClinicButton onCreated={handleSelectClinic} />
              )}
            </div>
            {clinics.length === 0 ? (
              <div className="text-gray-400 italic">
                Bu şirkette klinik yok.
              </div>
            ) : (
              <div className="space-y-2">
                {clinics.map((clinic) => (
                  <div
                    key={clinic._id}
                    className={`flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border ${
                      clinic._id === selectedClinicId
                        ? "border-brand-main"
                        : "border-transparent"
                    } hover:shadow-md transition`}
                  >
                    <div className="flex items-center gap-3">
                      <PlusIcon className="h-6 w-6 text-brand-main" />
                      <span className="font-medium text-gray-800">
                        {clinic.name}
                      </span>
                    </div>
                    {clinic._id !== selectedClinicId ? (
                      <button
                        onClick={() =>
                          handleSelectClinic(clinic._id, clinic.name)
                        }
                        className="px-3 py-1 bg-brand-main text-white rounded-full text-xs hover:bg-brand-dark transition"
                      >
                        Seç
                      </button>
                    ) : (
                      <span className="text-xs text-brand-main font-semibold">
                        Seçili
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <NavigationBar />
    </motion.div>
  );
}
