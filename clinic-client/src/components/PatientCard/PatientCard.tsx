// src/components/PatientCard.tsx
import React from "react";

export interface ServiceEntry {
  name: string;
  pointsLeft: number;
  sessionsTaken: number;
}

export interface PaymentHistoryEntry {
  date: string; // ISO date string
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
  balanceDue: number;
  note?: string;
  services: ServiceEntry[];
  paymentHistory: PaymentHistoryEntry[];
}

interface PatientCardProps {
  patient: Patient;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onCreditChange: (id: string, newCredit: number) => void;
  onBalanceChange: (id: string, newBalance: number) => void;
  onRecordPayment: (id: string, method: "Havale" | "Card" | "Cash") => void;
}

export const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  isExpanded,
  onToggleExpand,
  onCreditChange,
  onBalanceChange,
  onRecordPayment,
}) => {
  const {
    _id,
    name,
    age,
    phone,
    credit,
    balanceDue,
    note,
    services,
    paymentHistory,
  } = patient;

  //
  // 1) Determine the “currentMethod” from either balanceDue > 0 or last history entry:
  //
  const currentMethod: "Havale" | "Card" | "Cash" | "Unpaid" =
    balanceDue > 0
      ? "Unpaid"
      : paymentHistory.length > 0
      ? paymentHistory[paymentHistory.length - 1].method
      : "Unpaid";

  //
  // 2) Determine background-color class:
  //    - If currentMethod is "Unpaid", use "bg-error" (red).
  //    - Else if credit < 3, use "bg-warn" (amber).
  //    - Otherwise, use "bg-brand-green-100" (pale green).
  //
  let bgClass = "bg-brand-green-100"; // default pale green

  if (currentMethod === "Unpaid") {
    bgClass = "bg-error"; // red
  } else if (credit < 3) {
    bgClass = "bg-warn"; // amber
  }

  return (
    <div
      className={`${bgClass} rounded-lg p-4 mb-4 shadow-lg w-full`}
      onClick={() => onToggleExpand(_id)}
    >
      {/* Header: Name + Age */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-brand-black">{name}</h3>
        {age !== undefined && (
          <span className="text-sm text-brand-gray-700">({age} yaş)</span>
        )}
      </div>

      {/* Note (if any) */}
      {note && (
        <p className="mt-1 text-sm italic text-brand-gray-600">{note}</p>
      )}

      {/* Credit & Balance Inputs */}
      <div className="flex justify-between items-center mt-3 space-x-4">
        <div className="flex items-center">
          <label className="mr-2 font-medium text-brand-black">Kredi:</label>
          <input
            type="number"
            min={0}
            value={credit}
            className="w-16 px-2 py-1 border border-brand-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-300"
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              const v = parseInt(e.currentTarget.value) || 0;
              onCreditChange(_id, v);
            }}
          />
        </div>

        <div className="flex items-center">
          <label className="mr-2 font-medium text-brand-black">Bakiye:</label>
          <input
            type="number"
            min={0}
            value={balanceDue}
            className="w-16 px-2 py-1 border border-brand-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-error"
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              const v = parseInt(e.currentTarget.value) || 0;
              onBalanceChange(_id, v);
            }}
          />
        </div>
      </div>

      {/* Payment Status Dropdown */}
      <div className="mt-3 flex items-center">
        <label className="mr-2 font-medium text-brand-black">Ödeme:</label>
        <select
          value={currentMethod}
          className="px-2 py-1 border border-brand-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-green-300 bg-white"
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            const chosen = e.currentTarget.value as
              | "Havale"
              | "Card"
              | "Cash"
              | "Unpaid";
            if (chosen === "Unpaid") {
              // Simply remain Unpaid (the background will be red on next render)
            } else {
              // Record a paid method
              onRecordPayment(_id, chosen);
            }
          }}
        >
          <option value="Unpaid">Ödenmedi</option>
          <option value="Havale">Havale ile ödendi</option>
          <option value="Card">Kart ile ödendi</option>
          <option value="Cash">Nakit ile ödendi</option>
        </select>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 border-t border-brand-gray-200 pt-3">
          {/* Phone */}
          {phone && (
            <div className="mb-2">
              <span className="font-medium text-brand-black">Telefon:</span>{" "}
              <span className="text-brand-gray-700">{phone}</span>
            </div>
          )}

          {/* Services */}
          <div className="mb-2">
            <span className="font-medium text-brand-black">Hizmetler:</span>
            {services.length > 0 ? (
              <ul className="ml-4 list-disc text-sm text-brand-gray-600">
                {services.map((s, idx) => (
                  <li key={idx}>
                    {s.name} — Kalan: {s.pointsLeft}, Oturum: {s.sessionsTaken}
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
            <span className="font-medium text-brand-black">Ödeme Geçmişi:</span>
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
        </div>
      )}
    </div>
  );
};
