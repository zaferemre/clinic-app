// src/pages/Patients.tsx
import React from "react";
import { Header } from "../../components/Header/Header";
import { PatientsList } from "../../components/PatientsList/PatientsList";
import { Footer } from "../../components/Footer/Footer";
import { useAuth } from "../../context/AuthContext";

const PatientsPage: React.FC = () => {
  const { idToken, clinicId, clinicName, user, signOut } = useAuth();

  if (!idToken || !clinicId || !clinicName || !user) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen pb-16 bg-brand-gray-100">
      <div className="flex-1 overflow-auto">
        <PatientsList
          idToken={idToken}
          clinicId={clinicId}
          onAddPatientClick={() => {
            // e.g. open a modal or navigate to AddPatient page
          }}
        />
      </div>

      <Footer />
    </div>
  );
};

export default PatientsPage;
