// src/components/PatientsList.tsx
import React, { useState, useEffect } from "react";
import { PatientCard, Patient } from "../PatientCard/PatientCard";

interface PatientsListProps {
  idToken: string;
  clinicId: string;
  onAddPatientClick?: () => void;
}

export const PatientsList: React.FC<PatientsListProps> = ({
  idToken,
  clinicId,
  onAddPatientClick,
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 0 = “Tümü”, 1 = “Ödenmedi”, 2 = “Az Kredi”
  const [filterMode, setFilterMode] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    // Fetch all patients for this clinic
    fetch(`${import.meta.env.VITE_API_BASE_URL}/clinic/${clinicId}/patients`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    })
      .then((res) => res.json())
      .then((data: Patient[]) => {
        setPatients(data);
      })
      .catch((err) => console.error("Failed to fetch patients:", err));
  }, [clinicId, idToken]);

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleCreditChange = (id: string, newCredit: number) => {
    setPatients((prev) =>
      prev.map((p) => (p._id === id ? { ...p, credit: newCredit } : p))
    );
    fetch(
      `${import.meta.env.VITE_API_BASE_URL}/clinic/${clinicId}/patients/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ credit: newCredit }),
      }
    ).catch((err) => console.error("Credit update failed:", err));
  };

  const handleBalanceChange = (id: string, newBalance: number) => {
    setPatients((prev) =>
      prev.map((p) => (p._id === id ? { ...p, balanceDue: newBalance } : p))
    );
    fetch(
      `${import.meta.env.VITE_API_BASE_URL}/clinic/${clinicId}/patients/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ balanceDue: newBalance }),
      }
    ).catch((err) => console.error("Balance update failed:", err));
  };

  const handleRecordPayment = (
    id: string,
    method: "Havale" | "Card" | "Cash"
  ) => {
    const newEntry = {
      date: new Date().toISOString(),
      method,
      amount: 0,
      note: "",
    };

    setPatients((prev) =>
      prev.map((p) =>
        p._id === id
          ? {
              ...p,
              paymentHistory: [...p.paymentHistory, newEntry],
              balanceDue: 0,
            }
          : p
      )
    );

    fetch(
      `${
        import.meta.env.VITE_API_BASE_URL
      }/clinic/${clinicId}/patients/${id}/record-payment`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ method, date: newEntry.date }),
      }
    ).catch((err) => console.error("Record payment failed:", err));
  };

  // Filter logic based on filterMode:
  const filteredPatients = patients.filter((p) => {
    // Determine currentMethod the same way PatientCard does:
    const currentMethod: "Havale" | "Card" | "Cash" | "Unpaid" =
      p.balanceDue > 0
        ? "Unpaid"
        : p.paymentHistory.length > 0
        ? p.paymentHistory[p.paymentHistory.length - 1].method
        : "Unpaid";

    if (filterMode === 1) {
      // “Ödenmedi” only
      return currentMethod === "Unpaid";
    } else if (filterMode === 2) {
      // “Az Kredi” only: credit < 3 AND NOT unpaid
      return currentMethod !== "Unpaid" && p.credit < 3;
    }
    // filterMode === 0 => all
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filter Buttons */}
      <div className="flex space-x-2 px-4 pt-4">
        <button
          className={`flex-1 px-3 py-1 rounded-md text-center font-medium text-sm ${
            filterMode === 0
              ? "bg-brand-green-400 text-white"
              : "bg-brand-gray-200 text-brand-gray-700 hover:bg-brand-gray-300"
          }`}
          onClick={() => setFilterMode(0)}
        >
          Tümü
        </button>
        <button
          className={`flex-1 px-3 py-1 rounded-md text-center font-medium text-sm ${
            filterMode === 1
              ? "bg-error text-white"
              : "bg-brand-gray-200 text-brand-gray-700 hover:bg-brand-gray-300"
          }`}
          onClick={() => setFilterMode(1)}
        >
          Ödenmedi
        </button>
        <button
          className={`flex-1 px-3 py-1 rounded-md text-center font-medium text-sm ${
            filterMode === 2
              ? "bg-warn text-white"
              : "bg-brand-gray-200 text-brand-gray-700 hover:bg-brand-gray-300"
          }`}
          onClick={() => setFilterMode(2)}
        >
          Az Kredi
        </button>
      </div>

      {/* “Yeni Hasta Ekle” Button */}
      {onAddPatientClick && (
        <div className="px-4">
          <button
            onClick={onAddPatientClick}
            className="w-full bg-brand-green-400 text-white py-2 rounded-md text-center font-medium hover:bg-brand-green-500"
          >
            Yeni Hasta Ekle
          </button>
        </div>
      )}

      {/* Patient Cards */}
      <div className="px-4 pb-16">
        {filteredPatients.map((pat) => (
          <PatientCard
            key={pat._id}
            patient={pat}
            isExpanded={expandedId === pat._id}
            onToggleExpand={handleToggle}
            onCreditChange={handleCreditChange}
            onBalanceChange={handleBalanceChange}
            onRecordPayment={handleRecordPayment}
          />
        ))}

        {filteredPatients.length === 0 && (
          <p className="text-center text-brand-gray-500 mt-8">
            Görüntülenecek hasta yok.
          </p>
        )}
      </div>
    </div>
  );
};
