// src/components/AddPatientBanner.tsx
import React, { useState } from "react";
import AddPatient from "../../AddPatient/AddPatient"; // or wherever your form lives
import "./AddPatientBanner.css";

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
    <>
      <section className="add‐patient‐banner">
        <div className="banner‐content">
          <div className="banner‐icon">
            {/* You can swap out this placeholder for any image or SVG */}
            <img
              src="/icons/add_patient_icon.svg"
              alt="Add Patient"
              className="banner‐icon‐img"
            />
          </div>
          <div className="banner‐text">
            <h2>Yeni Hasta Ekle</h2>
            <p>Hızlıca yeni bir hasta kaydı oluşturmak için tıklayın.</p>
          </div>
          <button
            className="banner‐cta"
            onClick={() => setShowForm((prev) => !prev)}
          >
            {!showForm ? "Formu Aç" : "Formu Kapat"}
          </button>
        </div>
      </section>

      {showForm && (
        <div className="add‐patient‐form‐overlay">
          <div className="add‐patient‐form‐container">
            <AddPatient clinicId={clinicId} idToken={idToken} />
            <button
              className="close‐form‐btn"
              onClick={() => setShowForm(false)}
            >
              ✕ Kapat
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AddPatientBanner;
