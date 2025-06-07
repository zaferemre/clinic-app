// src/pages/WorkersPage.tsx
import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { EmployeesList } from "../EmployeesList/EmployeesList";
import { NavigationBar } from "../NavigationBar/NavigationBar";

const EmployeesPage: React.FC = () => {
  const { companyId } = useAuth();
  const [copyFeedback, setCopyFeedback] = useState<string>("");

  // Klinik ID’sini panoya kopyalar ve kısa süreli “Kopyalandı!” bildirimi gösterir
  const handleCopycompanyId = () => {
    if (!companyId) return;
    navigator.clipboard
      .writeText(companyId)
      .then(() => {
        setCopyFeedback("Klinik kodu kopyalandı!");
        setTimeout(() => setCopyFeedback(""), 2000);
      })
      .catch((err) => {
        console.error("Kopyalama sırasında hata:", err);
      });
  };

  return (
    <div className="flex flex-col h-screen bg-brand-gray-100">
      {/* ── Klinik Kodu ve “Kopyala” Butonu ─────────────────────────────────────────── */}
      {companyId && (
        <div className="mx-4 mt-4 mb-2 flex items-center space-x-2">
          <span className="text-sm font-medium text-brand-black">
            Klinik Kodu:
          </span>
          <div className="flex items-center bg-white border border-brand-gray-300 rounded-lg px-2 py-1">
            <span className="text-sm text-brand-gray-700">{companyId}</span>
            <button
              onClick={handleCopycompanyId}
              className="
                ml-2 text-sm text-brand-blue-500 hover:text-brand-blue-700
                focus:outline-none focus:ring-2 focus:ring-brand-blue-300
                px-2 py-0.5 rounded
              "
            >
              Kopyala
            </button>
          </div>
          {copyFeedback && (
            <span className="ml-2 text-sm text-green-600">{copyFeedback}</span>
          )}
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <EmployeesList />
      </div>

      <NavigationBar />
    </div>
  );
};

export default EmployeesPage;
