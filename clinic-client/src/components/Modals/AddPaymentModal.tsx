import React, { useState } from "react";
import AppModal from "./AppModal"; // Adjust the path if needed

type PaymentMethod = "Havale" | "Card" | "Cash" | "Unpaid";
const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: "Havale", label: "Havale" },
  { value: "Card", label: "Kart" },
  { value: "Cash", label: "Nakit" },
  { value: "Unpaid", label: "Ödenmedi" },
];

interface PaymentEntry {
  amount: number;
  method: PaymentMethod;
  note?: string;
}

interface AddPaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (entry: PaymentEntry) => Promise<void>;
  loading?: boolean;
  lastPayments?: {
    date: string;
    amount: number;
    method: string;
    note?: string;
  }[];
}

const AddPaymentModal: React.FC<AddPaymentModalProps> = ({
  open,
  onClose,
  onSubmit,
  loading = false,
  lastPayments = [],
}) => {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("Cash");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError("Geçerli bir tutar girin.");
      return;
    }
    try {
      await onSubmit({
        amount: Number(amount),
        method,
        note: note.trim() || undefined,
      });
      setAmount("");
      setNote("");
      setMethod("Cash");
      onClose();
    } catch (err: any) {
      setError(err.message || "Kayıt başarısız.");
    }
  };

  return (
    <AppModal open={open} onClose={onClose} title="Ödeme Ekle">
      <form className="space-y-3" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tutar (₺)
          </label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            className="w-full border border-gray-300 rounded-md px-2 py-1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Yöntem
          </label>
          <select
            className="w-full border border-gray-300 rounded-md px-2 py-1"
            value={method}
            onChange={(e) => setMethod(e.target.value as PaymentMethod)}
            disabled={loading}
          >
            {paymentMethods.map((pm) => (
              <option key={pm.value} value={pm.value}>
                {pm.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Not (isteğe bağlı)
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-md px-2 py-1"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={loading}
            placeholder="Açıklama girin..."
          />
        </div>
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
        <div className="flex justify-end space-x-2 pt-2">
          <button
            type="button"
            className="px-4 py-2 bg-gray-200 rounded-md"
            onClick={onClose}
            disabled={loading}
          >
            İptal
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-brand-main text-white rounded-md hover:bg-brand-green-600 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </form>
      {lastPayments.length > 0 && (
        <div className="mt-4">
          <div className="font-medium text-sm text-gray-600 mb-2">
            Müşterinin Ödeme Geçmişi
          </div>
          <ul className="text-xs space-y-1 max-h-20 overflow-y-auto">
            {lastPayments.slice(0, 5).map((p, i) => (
              <li
                key={i}
                className={p.method === "Unpaid" ? "text-red-600" : ""}
              >
                {new Date(p.date).toLocaleDateString("tr-TR")} -{" "}
                {p.amount.toLocaleString("tr-TR", {
                  style: "currency",
                  currency: "TRY",
                })}{" "}
                -{" "}
                {paymentMethods.find((pm) => pm.value === p.method)?.label ||
                  p.method}
                {p.note ? ` (${p.note})` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
    </AppModal>
  );
};

export default AddPaymentModal;
