import React, { useState, useEffect } from "react";
import {
  getPatientAppointments,
  flagPatientCall,
  deletePatient,
} from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export interface ServiceEntry {
  name: string;
  pointsLeft?: number;
  sessionsTaken?: number;
}

export interface PaymentHistoryEntry {
  date: string;
  method: "Havale" | "Card" | "Cash" | "Unpaid";
  amount: number;
  note?: string;
}

export interface Patient {
  _id: string;
  name: string;
  age?: number;
  phone?: string;
  credit: number;
  services: ServiceEntry[];
  paymentHistory: PaymentHistoryEntry[];
  note?: string;
}

interface PatientCardProps {
  patient: Patient;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onCreditChange: (id: string, newCredit: number) => void;
  onRecordPayment: (id: string, method: "Havale" | "Card" | "Cash") => void;
  onDeletePatient: (deletedId: string) => void;
}

export const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  isExpanded,
  onToggleExpand,
  onCreditChange,
  onRecordPayment,
  onDeletePatient,
}) => {
  const { idToken, clinicId } = useAuth();
  const navigate = useNavigate();

  const { _id, name, age, phone, credit, services, paymentHistory, note } =
    patient;

  const [localCredit, setLocalCredit] = useState<number>(credit);
  const [pastAppointments, setPastAppointments] = useState<
    {
      id: string;
      start: string;
      end: string;
      status: string;
      workerEmail: string;
    }[]
  >([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Whenever the parent’s credit changes, update local state:
  useEffect(() => {
    setLocalCredit(credit);
  }, [credit]);

  // Load appointment history when expanded:
  const loadHistory = async () => {
    if (!idToken || !clinicId) return;
    setLoadingHistory(true);
    try {
      const data = await getPatientAppointments(idToken, clinicId, _id);
      setPastAppointments(data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
      setPastAppointments([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Handle “flag patient call”:
  const handleFlagCall = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!idToken || !clinicId) return;
    try {
      await flagPatientCall(idToken, clinicId, _id);
      alert("Hasta çağrı listesine eklendi.");
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Bilinmeyen bir hata oluştu.");
      }
    }
  };

  // Handle “delete patient”:
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!idToken || !clinicId) return;
    if (!window.confirm("Bu hastayı silmek istediğinize emin misiniz?")) return;

    try {
      await deletePatient(idToken, clinicId, _id);
      alert("Hasta başarıyla silindi.");
      onDeletePatient(_id);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Silme işlemi başarısız.";
      alert(msg);
    }
  };

  // When the user edits the credit field:
  const handleCreditChangeLocal = (newCredit: number) => {
    setLocalCredit(newCredit);
    onCreditChange(_id, newCredit);
  };

  // When the user chooses a payment method:
  const handlePaymentMethodChange = (
    newMethod: "Havale" | "Card" | "Cash" | "Unpaid"
  ) => {
    if (newMethod === "Unpaid") {
      // Don’t record “Unpaid” in the API
      return;
    }
    onRecordPayment(_id, newMethod);
  };

  // Compute whether they have no payment history or low credit:
  const hasNoHistory = paymentHistory.length === 0;
  const isLowCredit = credit < 2;

  let bgClass = "bg-white";
  if (hasNoHistory && isLowCredit) {
    bgClass = "bg-gradient-to-r from-blue-100 to-amber-100";
  } else if (hasNoHistory) {
    bgClass = "bg-blue-100";
  } else if (isLowCredit) {
    bgClass = "bg-warn";
  }

  return (
    <div
      className={`
        ${bgClass} rounded-lg p-4 mb-4 shadow-md w-full cursor-pointer
        transform active:scale-95 transition
      `}
      onClick={() => {
        onToggleExpand(_id);
        if (!isExpanded) {
          loadHistory();
        }
      }}
    >
      {/* ───── Header ───── */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-lg font-semibold text-brand-black">{name}</h3>
          {age !== undefined && (
            <span className="text-sm text-brand-gray-700">({age} yaş)</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/patients/${_id}/edit`);
            }}
            className="
              text-sm text-brand-green-400 hover:text-brand-blue-700
              px-2 py-1 border border-brand-green-300 rounded-lg
            "
          >
            Düzenle
          </button>
          <button
            onClick={handleFlagCall}
            className="text-lg text-brand-gray-500 hover:text-brand-gray-700 px-2 py-1 rounded-lg"
            aria-label="Hasta Çağrı Listesine Ekle"
          >
            📞
          </button>
          <button
            onClick={handleDelete}
            className="text-lg text-error hover:text-red-700 px-2 py-1 rounded-lg"
            aria-label="Hastayı Sil"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* ───── Optional Note ───── */}
      {note && (
        <p className="mt-1 text-sm italic text-brand-gray-600">{note}</p>
      )}

      {/* ───── Credit & Payment Method ───── */}
      <div className="flex flex-wrap items-center mt-3 space-x-4 space-y-2">
        {/* Credit Field */}
        <div className="flex items-center">
          <label className="mr-2 font-medium text-brand-black">Kredi:</label>
          <input
            type="number"
            min={0}
            value={localCredit}
            className="
              w-16 px-2 py-1
              border border-brand-gray-300 rounded-md
              focus:outline-none focus:ring-2 focus:ring-brand-green-300
            "
            onClick={(e) => e.stopPropagation()}
            onChange={(e) =>
              handleCreditChangeLocal(parseInt(e.currentTarget.value, 10) || 0)
            }
          />
        </div>

        {/* Payment Method Dropdown */}
        <div className="flex items-center">
          <label className="mr-2 font-medium text-brand-black">Ödeme:</label>
          <select
            value={
              paymentHistory.length > 0
                ? paymentHistory[paymentHistory.length - 1].method
                : "Unpaid"
            }
            onChange={(e) =>
              handlePaymentMethodChange(
                e.currentTarget.value as "Havale" | "Card" | "Cash" | "Unpaid"
              )
            }
            className="
              px-2 py-1
              border border-brand-gray-300
              rounded-lg text-sm
              focus:outline-none focus:ring-2 focus:ring-brand-green-300
            "
            onClick={(e) => e.stopPropagation()}
          >
            <option value="Unpaid">Ödenmedi</option>
            <option value="Havale">Havale</option>
            <option value="Card">Kart</option>
            <option value="Cash">Nakit</option>
          </select>
        </div>
      </div>

      {/* ───── Expanded Details ───── */}
      {isExpanded && (
        <div className="mt-4 border-t border-brand-gray-200 pt-3 space-y-3">
          {/* Phone */}
          {phone && (
            <div>
              <span className="font-medium text-brand-black">Telefon:</span>{" "}
              <span className="text-brand-gray-700">{phone}</span>
            </div>
          )}

          {/* Services */}
          <div>
            <span className="font-medium text-brand-black">Hizmetler:</span>{" "}
            {services.length > 0 ? (
              <ul className="ml-4 list-disc text-sm text-brand-gray-600">
                {services.map((s, idx) => (
                  <li key={idx}>
                    {s.name} — Kalan: {s.pointsLeft ?? 0}, Oturum:{" "}
                    {s.sessionsTaken ?? 0}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="ml-2 text-sm text-brand-gray-600">
                Kayıt yok
              </span>
            )}
          </div>

          {/* Payment History */}
          <div>
            <span className="font-medium text-brand-black">Ödeme Geçmişi:</span>{" "}
            {paymentHistory.length > 0 ? (
              <ul className="ml-4 list-disc text-sm text-brand-gray-600">
                {paymentHistory.map((ph, i) => (
                  <li key={i}>
                    {new Date(ph.date).toLocaleDateString()} — {ph.method} —{" "}
                    {ph.amount}₺ {ph.note && `(${ph.note})`}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="ml-2 text-sm text-brand-gray-600">
                Geçmiş yok
              </span>
            )}
          </div>

          {/* Past Appointments */}
          <div>
            <span className="font-medium text-brand-black">
              Geçmiş Randevular:
            </span>{" "}
            {loadingHistory ? (
              <p className="ml-2 text-sm text-brand-gray-600">Yükleniyor...</p>
            ) : pastAppointments.length > 0 ? (
              <ul className="ml-4 list-disc text-sm text-brand-gray-600">
                {pastAppointments.map((a) => (
                  <li key={a.id}>
                    {new Date(a.start).toLocaleDateString()} — {a.workerEmail} —{" "}
                    {a.status}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="ml-2 text-sm text-brand-gray-600">
                Geçmiş yok
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
