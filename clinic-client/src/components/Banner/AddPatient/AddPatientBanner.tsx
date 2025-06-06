// src/components/AddPatientBanner/AddPatientBanner.tsx

import React, { useState } from "react";
import AddPatient from "../../AddPatient/AddPatient";
import { UserPlusIcon } from "@heroicons/react/24/outline";

interface AddPatientBannerProps {
  clinicId: string;
  idToken: string;
}

const AddPatientBanner: React.FC<AddPatientBannerProps> = ({
  clinicId,
  idToken,
}) => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="mx-4 my-2">
      {/* — Banner (always visible) — */}
      <section className="bg-white rounded-xl shadow flex items-center justify-between px-4 py-3">
        {/* Icon */}
        <div className="flex-shrink-0">
          <UserPlusIcon className="h-8 w-8 text-brand-green-500" />
        </div>

        {/* Text */}
        <div className="flex-1 px-4">
          <h2 className="text-lg font-semibold text-brand-black">Yeni Hasta</h2>
        </div>

        {/* Toggle Button */}
        <button
          className="
            bg-brand-green-400 hover:bg-brand-green-500
            text-white font-medium
            px-3 py-1 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-brand-green-300
          "
          onClick={() => setShowForm((prev) => !prev)}
        >
          {!showForm ? "Formu Aç" : "Formu Kapat"}
        </button>
      </section>

      {/* — AddPatient Form (inline, collapsible) — */}
      {showForm && (
        <div className="mt-4 mb-10 bg-white rounded-xl shadow p-6">
          <AddPatient clinicId={clinicId} idToken={idToken} />
        </div>
      )}
    </div>
  );
};

export default AddPatientBanner;
