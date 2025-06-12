// src/components/AddPatientBanner/AddPatientBanner.tsx

import React, { useState } from "react";
import AddPatient from "../../AddPatient/AddPatientModal";
import { UserPlusIcon } from "@heroicons/react/24/outline";

interface AddPatientBannerProps {
  companyId: string;
  idToken: string;
}

const AddPatientBanner: React.FC<AddPatientBannerProps> = ({
  companyId,
  idToken,
}) => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="mx-4 my-2">
      {/* — Banner (always visible) — */}
      <section className="bg-white rounded-xl shadow flex items-center justify-between px-4 py-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          <UserPlusIcon className="h-8 w-8 text-blue-500" />
        </div>

        {/* Text */}
        <div className="flex-1 px-4">
          <h2 className="text-md font-semibold text-brand-black">
            Yeni Müşteri
          </h2>
        </div>

        {/* Toggle Button */}
        <button
          className="
            bg-blue-400 hover:bg-blue-500
            text-white font-medium
            px-3 py-1 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-300
          "
          onClick={() => setShowForm((prev) => !prev)}
        >
          {!showForm ? "Formu Aç" : "Formu Kapat"}
        </button>
      </section>

      {/* — AddPatient Form (inline, collapsible) — */}
      {showForm && (
        <div className="mt-4 mb-10 bg-white rounded-xl shadow p-6">
          <AddPatient
            companyId={companyId}
            idToken={idToken}
            show={showForm}
            onClose={() => setShowForm(false)}
          />
        </div>
      )}
    </div>
  );
};

export default AddPatientBanner;
