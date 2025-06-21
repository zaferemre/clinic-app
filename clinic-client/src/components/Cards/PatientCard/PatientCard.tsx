// src/components/Cards/PatientCard/PatientCard.tsx
import React, { useState, useEffect } from "react";
import {
  PencilIcon,
  PhoneIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import EditPatientModal from "../../Modals/EditPatientModal";
import GroupPreviewList from "../../Lists/GroupPreviewList";
import {
  flagPatientCall,
  deletePatient,
  getPatientAppointments,
} from "../../../api/patientApi";
import { useAuth } from "../../../contexts/AuthContext";
import type { Patient, Group } from "../../../types/sharedTypes";

interface PatientCardProps {
  patient: Patient;
  groups?: Group[];
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onDeletePatient: (deletedId: string) => void;
  onUpdatePatient?: (updated: Partial<Patient>) => void;
}

const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  groups = [],
  isExpanded,
  onToggleExpand,
  onDeletePatient,
  onUpdatePatient,
}) => {
  const { idToken, selectedCompanyId, selectedClinicId } = useAuth();
  const [pastAppointments, setPastAppointments] = useState<
    { id: string; start: string; status: string; employeeEmail: string }[]
  >([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callNote, setCallNote] = useState("");
  const [sendingCall, setSendingCall] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  function isIdEqual(a: any, b: any) {
    return a?.toString?.() === b?.toString?.();
  }

  const myGroups = groups.filter(
    (g) =>
      Array.isArray(g.patients) &&
      g.patients.some((pid) => isIdEqual(pid, patient._id))
  );

  const lastPayment = patient.paymentHistory?.length
    ? patient.paymentHistory[patient.paymentHistory.length - 1].method
    : "Yok";

  const activityCount = pastAppointments.length;
  const lastAppointment = activityCount
    ? new Date(
        Math.max(
          ...pastAppointments.map((appt) => new Date(appt.start).getTime())
        )
      ).toLocaleDateString("tr-TR")
    : "Yok";

  const createdAtString = patient.createdAt
    ? new Date(patient.createdAt).toLocaleString("tr-TR", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "";

  // Fetch past appointments on mount
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!idToken || !selectedCompanyId || !selectedClinicId) return;
      setLoadingHistory(true);
      try {
        const data = await getPatientAppointments(
          idToken,
          selectedCompanyId,
          selectedClinicId,
          patient._id
        );
        if (!cancelled) {
          setPastAppointments(
            data.map((appt: any) => ({
              id: appt.id,
              start: appt.start,
              status: appt.status,
              employeeEmail: appt.employeeEmail || "-",
            }))
          );
        }
      } catch {
        if (!cancelled) setPastAppointments([]);
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [idToken, selectedCompanyId, selectedClinicId, patient._id]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Bu müşteriyi silmek istediğinize emin misiniz?"))
      return;
    try {
      await deletePatient(
        idToken!,
        selectedCompanyId!,
        selectedClinicId!,
        patient._id
      );
      onDeletePatient(patient._id);
    } catch (err: any) {
      alert(err.message || "Silme işlemi başarısız.");
    }
  };

  const handleCallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCallModal(true);
  };

  const handleConfirmCall = async () => {
    setSendingCall(true);
    try {
      await flagPatientCall(
        idToken!,
        selectedCompanyId!,
        selectedClinicId!,
        patient._id,
        callNote
      );
      setShowCallModal(false);
      setCallNote("");
    } catch (err: any) {
      alert(err.message || "Çağrı eklenemedi.");
    } finally {
      setSendingCall(false);
    }
  };

  // Determine pill styles
  const pillBase = "rounded px-2 py-0.5 text-xs";
  const creditStyle = "bg-brand-main-50 text-brand-main-700";
  const activityStyle =
    activityCount > 0 ? "bg-warn/10 text-warn" : "bg-error/10 text-error";
  const apptStyle =
    lastAppointment !== "Yok"
      ? "bg-success/10 text-success"
      : "bg-error/10 text-error";
  const paymentStyle =
    lastPayment !== "Yok"
      ? "bg-brand-main-50 text-brand-main-700"
      : "bg-error/10 text-error";

  return (
    <div
      className={`bg-white rounded-2xl p-4 mb-3 shadow transition focus-within:ring-2 focus-within:ring-brand-main${
        isExpanded ? " ring-2 ring-brand-main" : ""
      }`}
      onClick={() => onToggleExpand(patient._id)}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => e.key === "Enter" && onToggleExpand(patient._id)}
    >
      {/* Core Info */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">
              {patient.name}
            </h3>
            {patient.age && (
              <span className="text-xs text-gray-500">{patient.age} yaş</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className={`${pillBase} ${creditStyle}`}>
              Kredi: {patient.credit}
            </span>
            <span className={`${pillBase} ${activityStyle}`}>
              Aktivite: {activityCount} randevu
            </span>
            <span className={`${pillBase} ${apptStyle}`}>
              Son Randevu: {lastAppointment}
            </span>
            <span className={`${pillBase} ${paymentStyle}`}>
              Ödeme: {lastPayment}
            </span>
          </div>
        </div>
        <button
          className="ml-4 text-gray-500 hover:text-brand-main focus:outline-none"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(patient._id);
          }}
          aria-label={isExpanded ? "Detayları gizle" : "Detayları göster"}
        >
          {isExpanded ? (
            <ChevronUpIcon className="w-5 h-5" />
          ) : (
            <ChevronDownIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Note */}
      {patient.note && (
        <div className="mt-3 text-sm text-gray-500 italic">
          “{patient.note}”
        </div>
      )}

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 space-y-4 text-sm text-gray-700">
          <div className="flex gap-3 justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowEditModal(true);
              }}
              className="p-2 rounded-full bg-brand-main-50 hover:bg-brand-main-100 text-brand-main transition"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
            <button
              onClick={handleCallClick}
              className="p-2 rounded-full bg-brand-main-50 hover:bg-brand-main-100 text-brand-main transition"
            >
              <PhoneIcon className="w-5 h-5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-red-500 transition"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
          <div>
            <span className="font-medium text-gray-900">Gruplar:</span>
            <GroupPreviewList groups={myGroups} />
          </div>
          <div>
            <span className="font-medium text-gray-900">Hizmetler:</span>
            {patient.services?.length ? (
              <ul className="ml-4 list-disc">
                {patient.services.map((s, i) => (
                  <li key={i}>
                    {s.name} (Kalan: {s.pointsLeft ?? 0}, Oturum:{" "}
                    {s.sessionsTaken ?? 0})
                  </li>
                ))}
              </ul>
            ) : (
              <span className="ml-2 text-gray-500">Yok</span>
            )}
          </div>
          <div>
            <span className="font-medium text-gray-900">Ödeme Geçmişi:</span>
            {patient.paymentHistory?.length ? (
              <ul className="ml-4 list-disc">
                {patient.paymentHistory.map((ph, i) => (
                  <li key={i}>
                    {new Date(ph.date).toLocaleDateString()} - {ph.method}
                    {ph.note && ` (${ph.note})`}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="ml-2 text-gray-500">Yok</span>
            )}
          </div>
          <div>
            <span className="font-medium text-gray-900">
              Geçmiş Randevular:
            </span>
            {loadingHistory ? (
              <span className="ml-2 text-gray-500">Yükleniyor...</span>
            ) : pastAppointments.length ? (
              <ul className="ml-4 list-disc">
                {pastAppointments.map((a, i) => (
                  <li key={i}>
                    {new Date(a.start).toLocaleDateString()} - {a.employeeEmail}{" "}
                    - {a.status}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="ml-2 text-gray-500">Yok</span>
            )}
          </div>
          <div>
            <span className="font-medium text-gray-900">Kayıt Tarihi:</span>
            <span className="ml-2 text-gray-600">{createdAtString}</span>
          </div>
        </div>
      )}

      {/* Call Modal */}
      {showCallModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
          onClick={() => setShowCallModal(false)}
        >
          <div
            className="bg-white rounded-lg p-6 w-80 max-w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-lg font-semibold mb-3 text-gray-900">
              Çağrı Notu Girin
            </h4>
            <textarea
              rows={4}
              value={callNote}
              onChange={(e) => setCallNote(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 mb-4 focus:ring-2 focus:ring-brand-main focus:border-brand-main"
              placeholder="Notunuzu buraya yazın..."
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowCallModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-md text-gray-700 hover:bg-gray-300"
              >
                İptal
              </button>
              <button
                onClick={handleConfirmCall}
                disabled={sendingCall}
                className="px-4 py-2 bg-brand-main text-white rounded-md hover:bg-brand-main-600 disabled:opacity-50"
              >
                {sendingCall ? "Kaydediliyor..." : "Kaydet & Çağrı"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <EditPatientModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        patient={patient}
        onUpdated={onUpdatePatient}
      />
    </div>
  );
};

export default PatientCard;
