import React, { useEffect, useState } from "react";
import { EmployeesList } from "../../components/EmployeesList/EmployeesList";
import { NavigationBar } from "../../components/NavigationBar/NavigationBar";
import { useAuth } from "../../contexts/AuthContext";
import { getCompanyById } from "../../api/companyApi";
import JoinCodeBanner from "../../components/JoinCodeBanner/JoinCodeBanner";
import GreetingHeader from "../../components/GreetingHeader/GreetingHeader";

export const EmployeesPage: React.FC = () => {
  const {
    idToken,
    user,
    selectedCompanyId,

    clinics,
    selectedClinicId,
    selectedClinicName,
  } = useAuth();

  const [joinCode, setJoinCode] = useState<string | null>(null);

  // Find the selected company/clinic objects for logos etc.

  const selectedClinic =
    clinics.find((cl) => cl._id === selectedClinicId) || null;

  useEffect(() => {
    if (!idToken || !selectedCompanyId) {
      setJoinCode(null);
      return;
    }
    getCompanyById(idToken, selectedCompanyId)
      .then((company) => setJoinCode(company.joinCode))
      .catch(() => setJoinCode(null));
  }, [idToken, selectedCompanyId]);

  return (
    <div className="flex flex-col h-screen bg-brand-gray-100">
      <div className="flex-1 overflow-auto p-4">
        <GreetingHeader
          userAvatarUrl={user?.imageUrl ?? ""}
          clinicName={selectedClinicName ?? selectedClinic?.name ?? ""}
          pageTitle="Çalışanlar"
          showBackButton={true}
        />
        <JoinCodeBanner joinCode={joinCode} />
        <EmployeesList />
      </div>
      <NavigationBar />
    </div>
  );
};
