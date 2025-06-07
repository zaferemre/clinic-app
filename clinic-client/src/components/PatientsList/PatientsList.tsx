import React, { useState, useEffect } from "react";
import {
  PatientCard,
  Patient as CardPatient,
} from "../PatientCard/PatientCard";
import {
  getPatients,
  updatePatientField,
  recordPayment,
} from "../../api/patientApi";
import { Patient } from "../../types/sharedTypes";
import { useAuth } from "../../contexts/AuthContext";

export const PatientsList: React.FC = () => {
  const { idToken, companyId } = useAuth();
  const [patients, setPatients] = useState<CardPatient[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 0 = “Tümü”, 1 = “Ödenmedi”, 2 = “Az Kredi”
  const [filterMode, setFilterMode] = useState<0 | 1 | 2>(0);

  // Search query
  const [searchTerm, setSearchTerm] = useState<string>("");

  // ─────────────────────────────────────────────────────────────────────────────
  // Fetch all patients when idToken or companyId changes
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!idToken || !companyId) {
      setPatients([]);
      return;
    }

    getPatients(idToken, companyId)
      .then((apiData: Patient[]) => {
        // Map from API → CardPatient (no more balanceDue)
        const cardPatients: CardPatient[] = apiData.map((p) => ({
          _id: p._id,
          name: p.name,
          age: p.age,
          phone: p.phone,
          credit: p.credit,
          services: p.services,
          paymentHistory: p.paymentHistory,
          note: p.note,
        }));
        setPatients(cardPatients);
      })
      .catch((err) => console.error("Failed to fetch patients:", err));
  }, [companyId, idToken]);

  // Toggle expand/collapse
  const handleToggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Parent callback: update credit
  const handleCreditChange = (id: string, newCredit: number) => {
    setPatients((prev) =>
      prev.map((p) => (p._id === id ? { ...p, credit: newCredit } : p))
    );
    if (idToken && companyId) {
      updatePatientField(idToken, companyId, id, { credit: newCredit }).catch(
        (err) => console.error("Credit update failed:", err)
      );
    }
  };

  // Parent callback: record payment
  const handleRecordPayment = (
    id: string,
    method: "Havale" | "Card" | "Cash"
  ) => {
    if (idToken && companyId) {
      recordPayment(idToken, companyId, id, method).catch((err) =>
        console.error("Record payment failed:", err)
      );
    }
  };

  // Parent callback: delete patient
  const handleDeletePatient = (deletedId: string) => {
    setPatients((prev) => prev.filter((p) => p._id !== deletedId));
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Build the filtered list of patients
  // ─────────────────────────────────────────────────────────────────────────────
  const filteredPatients = patients
    // a) filter by search term
    .filter((p) =>
      p.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
    )
    // b) apply paid/unpaid or low-credit filters
    .filter((p) => {
      const latestMethod =
        p.paymentHistory.length > 0
          ? p.paymentHistory[p.paymentHistory.length - 1].method
          : "Unpaid";

      if (filterMode === 1) {
        // “Ödenmedi”: last method = Unpaid
        return latestMethod === "Unpaid";
      } else if (filterMode === 2) {
        // “Az Kredi”: credit < 3
        return p.credit < 3;
      }
      // filterMode === 0 → all
      return true;
    });

  return (
    <div className="space-y-4">
      {/* — Search + Filters — */}
      <div className="px-4 pt-4 space-y-3">
        <input
          type="text"
          placeholder="Hasta adı ara..."
          className="
            w-full
            border border-brand-gray-300 rounded-md
            px-3 py-2
            focus:outline-none focus:ring-2 focus:ring-brand-green-300
          "
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex space-x-2">
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
      </div>

      {/* — Patient Cards — */}
      <div className="px-4 pb-16">
        {filteredPatients.length > 0 ? (
          filteredPatients.map((pat) => (
            <PatientCard
              key={pat._id}
              patient={pat}
              isExpanded={expandedId === pat._id}
              onToggleExpand={handleToggleExpand}
              onCreditChange={handleCreditChange}
              onRecordPayment={handleRecordPayment}
              onDeletePatient={handleDeletePatient}
            />
          ))
        ) : (
          <p className="text-center text-brand-gray-500 mt-8">
            Görüntülenecek hasta yok.
          </p>
        )}
      </div>
    </div>
  );
};
