// src/components/PatientCard/PatientCard.tsx
import React, { useState, useEffect } from "react";
import {
  PencilIcon,
  PhoneIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { deletePatient } from "../../api/patientApi";
import { getPatientAppointments } from "../../api/appointmentApi";
import { flagPatientCall } from "../../api/notificationApi";
import { useAuth } from "../../contexts/AuthContext";
import EditPatientModal from "../Modals/EditPatientModal";
import type { Patient } from "../../types/sharedTypes";

interface PatientCardProps {
  patient: Patient;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onCreditChange: (id: string, newCredit: number) => void;
  onRecordPayment: (id: string, method: "Havale" | "Card" | "Cash") => void;
  onDeletePatient: (deletedId: string) => void;
  onUpdatePatient?: (updated: Partial<Patient>) => void;
}

export const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  isExpanded,
  onToggleExpand,
  onCreditChange,
  onRecordPayment,
  onDeletePatient,
  onUpdatePatient,
}) => {
  const { idToken, companyId } = useAuth();
  const [localCredit, setLocalCredit] = useState(patient.credit);
  const [pastAppointments, setPastAppointments] = useState<
    { id: string; start: string; status: string; employeeEmail: string }[]
  >([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [showCallModal, setShowCallModal] = useState(false);
  const [callNote, setCallNote] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    setLocalCredit(patient.credit);
  }, [patient.credit]);

  const loadHistory = async () => {
    if (!idToken || !companyId) return;
    setLoadingHistory(true);
    try {
      const data = await getPatientAppointments(
        idToken,
        companyId,
        patient._id
      );
      setPastAppointments(data);
    } catch {
      setPastAppointments([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const openCallModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCallNote("");
    setShowCallModal(true);
  };
  const confirmCall = async () => {
    setShowCallModal(false);
    if (!idToken || !companyId) return;
    try {
      await flagPatientCall(idToken, companyId, patient._id, callNote);
      alert("Müşteri çağrı listesine eklendi.");
    } catch (err: any) {
      alert(err.message || "Çağrı eklenemedi.");
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Bu müşteriyi silmek istediğinize emin misiniz?"))
      return;
    try {
      await deletePatient(idToken!, companyId!, patient._id);
      onDeletePatient(patient._id);
    } catch (err: any) {
      alert(err.message || "Silme işlemi başarısız.");
    }
  };

  const handleCreditChangeLocal = (newCredit: number) => {
    setLocalCredit(newCredit);
    onCreditChange(patient._id, newCredit);
  };
  const handlePaymentMethodChange = (method: any) => {
    if (method !== "Unpaid") onRecordPayment(patient._id, method);
  };

  let bgClass = "bg-white";
  if (patient.paymentHistory.length === 0 && patient.credit < 2)
    bgClass = "bg-gradient-to-r from-blue-50 to-amber-50";
  else if (patient.paymentHistory.length === 0) bgClass = "bg-blue-50";
  else if (patient.credit < 2) bgClass = "bg-amber-50";

  return (
    <div
      className={`${bgClass} rounded-xl p-6 mb-6 shadow hover:shadow-lg transition cursor-pointer relative`}
      onClick={() => {
        onToggleExpand(patient._id);
        if (!isExpanded) loadHistory();
      }}
    >
      {/* Expand/Collapse Icon */}
      <div className="absolute top-4 right-4 text-gray-400">
        {isExpanded ? (
          <ChevronUpIcon className="w-5 h-5" />
        ) : (
          <ChevronDownIcon className="w-5 h-5" />
        )}
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-2xl font-semibold text-gray-800">
            {patient.name}
          </h3>
          {patient.age != null && (
            <span className="text-sm text-gray-500">{patient.age} yaş</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {/* Edit */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowEditModal(true);
            }}
            className="p-2 bg-green-100 rounded hover:bg-green-200"
            aria-label="Düzenle"
          >
            <PencilIcon className="w-5 h-5 text-green-600" />
          </button>
          {/* Call */}
          <button
            onClick={openCallModal}
            className="p-2 bg-blue-100 rounded hover:bg-blue-200"
            aria-label="Çağrı Listesine Ekle"
          >
            <PhoneIcon className="w-5 h-5 text-blue-600" />
          </button>
          {/* Delete */}
          <button
            onClick={handleDelete}
            className="p-2 bg-red-100 rounded hover:bg-red-200"
            aria-label="Sil"
          >
            <TrashIcon className="w-5 h-5 text-red-600" />
          </button>
        </div>
      </div>

      {/* Note */}
      {patient.note && (
        <p className="mb-4 italic text-gray-600">“{patient.note}”</p>
      )}

      {/* Credit & Payment */}
      <div className="flex flex-wrap items-center gap-6 mb-4">
        <div className="flex items-center">
          <label className="mr-2 font-medium text-gray-700">
            Kalan Servis Kredisi
          </label>
          <input
            type="number"
            min={0}
            value={localCredit}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) =>
              handleCreditChangeLocal(parseInt(e.currentTarget.value) || 0)
            }
            className="w-20 px-2 py-1 border rounded focus:ring-2 focus:ring-green-200"
          />
        </div>
        <div className="flex items-center">
          <label className="mr-2 font-medium text-gray-700">Ödeme Durumu</label>
          <select
            value={
              patient.paymentHistory.length > 0
                ? patient.paymentHistory[patient.paymentHistory.length - 1]
                    .method
                : "Unpaid"
            }
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => handlePaymentMethodChange(e.currentTarget.value)}
            className="px-2 py-1 border rounded focus:ring-2 focus:ring-green-200"
          >
            <option value="Unpaid">Ödenmedi</option>
            <option value="Havale">Havale</option>
            <option value="Card">Kart</option>
            <option value="Cash">Nakit</option>
          </select>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Phone */}
          {patient.phone && (
            <div>
              <span className="font-medium text-gray-700">Telefon:</span>{" "}
              <span className="text-gray-600">{patient.phone}</span>
            </div>
          )}
          {/* Services */}
          <div>
            <span className="font-medium text-gray-700">Hizmetler:</span>
            {patient.services.length > 0 ? (
              <ul className="ml-5 list-disc text-gray-600">
                {patient.services.map((s, i) => (
                  <li key={i}>
                    {s.name} (Kalan: {s.pointsLeft || 0}, Oturum:{" "}
                    {s.sessionsTaken || 0})
                  </li>
                ))}
              </ul>
            ) : (
              <span className="ml-2 text-gray-600">Yok</span>
            )}
          </div>
          {/* Payment History */}
          <div>
            <span className="font-medium text-gray-700">Ödeme Geçmişi:</span>
            {patient.paymentHistory.length > 0 ? (
              <ul className="ml-5 list-disc text-gray-600">
                {patient.paymentHistory.map((ph, i) => (
                  <li key={i}>
                    {new Date(ph.date).toLocaleDateString()} - {ph.method}
                    {ph.note ? ` (${ph.note})` : ""}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="ml-2 text-gray-600">Yok</span>
            )}
          </div>
          {/* Past Appointments */}
          <div>
            <span className="font-medium text-gray-700">
              Geçmiş Randevular:
            </span>
            {loadingHistory ? (
              <p className="ml-2 text-gray-600">Yükleniyor...</p>
            ) : pastAppointments.length > 0 ? (
              <ul className="ml-5 list-disc text-gray-600">
                {pastAppointments.map((a) => (
                  <li key={a.id}>
                    {new Date(a.start).toLocaleDateString()} - {a.employeeEmail}{" "}
                    - {a.status}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="ml-2 text-gray-600">Yok</span>
            )}
          </div>
        </div>
      )}

      {/* Call Note Modal */}
      {showCallModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowCallModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-lg p-6 w-80 max-w-full mx-4"
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
                onClick={confirmCall}
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
              >
                Kaydet & Çağrı
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Patient Modal */}
      <EditPatientModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        patient={patient}
        onUpdated={(updated) => onUpdatePatient?.(updated)}
      />
    </div>
  );
};
