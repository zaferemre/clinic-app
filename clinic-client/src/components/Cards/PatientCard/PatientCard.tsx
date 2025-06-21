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

  // Defensive: Handle ObjectId or string in group.patients and patient._id
  function isIdEqual(a: any, b: any) {
    return a?.toString?.() === b?.toString?.();
  }

  // Groups this patient is in
  const myGroups = groups.filter(
    (g) =>
      Array.isArray(g.patients) &&
      g.patients.some((pid) => isIdEqual(pid, patient._id))
  );

  // Last payment
  const lastPayment = patient.paymentHistory?.length
    ? patient.paymentHistory[patient.paymentHistory.length - 1].method
    : "Yok";

  // Activity summary
  const activityCount = pastAppointments.length;
  const lastAppointment = activityCount
    ? new Date(
        Math.max(
          ...pastAppointments.map((appt) => new Date(appt.start).getTime())
        )
      ).toLocaleDateString("tr-TR")
    : "Yok";

  // Format createdAt as readable string
  const createdAtString = patient.createdAt
    ? new Date(patient.createdAt).toLocaleString("tr-TR", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "";

  useEffect(() => {
    if (!isExpanded) return;
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
    // eslint-disable-next-line
  }, [isExpanded, idToken, selectedCompanyId, selectedClinicId, patient._id]);

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

  // Compact view: only show name, credit, activity, last randevu, last payment, expand chevron
  return (
    <div
      className={`bg-white rounded-2xl p-4 mb-3 shadow transition ${
        isExpanded ? "ring-2 ring-brand-main" : ""
      }`}
      onClick={() => onToggleExpand(patient._id)}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === "Enter") onToggleExpand(patient._id);
      }}
    >
      {/* Collapsed core info */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold">{patient.name}</h3>
            {patient.age && (
              <span className="text-xs text-brand-gray-400">
                {patient.age} yaş
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-1 text-xs">
            <span className="bg-brand-orange/10 rounded px-2 py-0.5">
              Kredi: {patient.credit}
            </span>
            <span className="bg-brand-red/10 rounded px-2 py-0.5">
              Aktivite: {activityCount} randevu
            </span>
            <span className="bg-brand-green/10 rounded px-2 py-0.5">
              Son Randevu: {lastAppointment}
            </span>
            <span className="bg-brand-green/10 rounded px-2 py-0.5">
              Ödeme: {lastPayment}
            </span>
          </div>
        </div>
        {/* Expand/collapse */}
        <button
          className="ml-2 text-brand-main focus:outline-none"
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

      {/* Show note below if present */}
      {patient.note && (
        <div className="mb-2 mt-2 text-xs text-brand-gray-500 italic">
          “{patient.note}”
        </div>
      )}

      {/* Expanded details */}
      {isExpanded && (
        <div className="mt-3 space-y-2 text-sm">
          {/* Action buttons */}
          <div className="flex gap-2 mb-2 justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowEditModal(true);
              }}
              className="p-2 rounded-full bg-brand-green/20 hover:bg-brand-green/40"
            >
              <PencilIcon className="w-5 h-5 text-brand-green" />
            </button>
            <button
              onClick={handleCallClick}
              className="p-2 rounded-full bg-brand-main/10 hover:bg-brand-main/20"
            >
              <PhoneIcon className="w-5 h-5 text-brand-main" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-full bg-brand-red/20 hover:bg-brand-red/40"
            >
              <TrashIcon className="w-5 h-5 text-brand-red" />
            </button>
          </div>
          <div>
            <span className="font-semibold">Gruplar:</span>
            <GroupPreviewList groups={myGroups} />
          </div>
          <div>
            <span className="font-semibold">Hizmetler:</span>
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
              <span className="ml-2 text-brand-gray-400">Yok</span>
            )}
          </div>
          <div>
            <span className="font-semibold">Ödeme Geçmişi:</span>
            {patient.paymentHistory?.length ? (
              <ul className="ml-4 list-disc">
                {patient.paymentHistory.map((ph, i) => (
                  <li key={i}>
                    {new Date(ph.date).toLocaleDateString()} - {ph.method}{" "}
                    {ph.note && `(${ph.note})`}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="ml-2 text-brand-gray-400">Yok</span>
            )}
          </div>
          <div>
            <span className="font-semibold">Geçmiş Randevular:</span>
            {loadingHistory ? (
              <span className="ml-2 text-brand-gray-400">Yükleniyor...</span>
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
              <span className="ml-2 text-brand-gray-400">Yok</span>
            )}
          </div>
          {/* Created at */}
          <div>
            <span className="font-semibold">Kayıt Tarihi:</span>
            <span className="ml-2">{createdAtString}</span>
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
            className="bg-white rounded-xl p-6 w-80 max-w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h4 className="text-lg font-semibold mb-3">Çağrı Notu Girin</h4>
            <textarea
              rows={4}
              value={callNote}
              onChange={(e) => setCallNote(e.target.value)}
              className="w-full border rounded-md p-2 mb-4 focus:ring-2 focus:ring-blue-200"
              placeholder="Notunuzu buraya yazın..."
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowCallModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-md"
              >
                İptal
              </button>
              <button
                onClick={handleConfirmCall}
                disabled={sendingCall}
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                {sendingCall ? "Kaydediliyor..." : "Kaydet & Çağrı"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
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
