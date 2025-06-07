import React, { useState } from "react";
import { PatientsList } from "../../components/PatientsList/PatientsList";
import AddPatientBanner from "../../components/Banner/AddPatient/AddPatientBanner";
import { useAuth } from "../../contexts/AuthContext";
import { NavigationBar } from "../../components/NavigationBar/NavigationBar";

const PatientsPage: React.FC = () => {
  const { idToken, companyId, companyName, user } = useAuth();
  const [showForm, setShowForm] = useState(false);

  if (!idToken || !companyId || !companyName || !user) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen pb-16 bg-brand-gray-100">
      <AddPatientBanner companyId={companyId} idToken={idToken} />
      <div className="flex-1 overflow-auto">
        <PatientsList />
      </div>

      <NavigationBar />

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center">
          <div className="bg-white rounded-t-xl shadow-lg h-[85vh] w-full max-w-md p-4">
            <AddPatientBanner companyId={companyId} idToken={idToken} />
            <button onClick={() => setShowForm(false)}>✕ Kapat</button>
          </div>
        </div>
      )}
    </div>
  );
};
export default PatientsPage;
