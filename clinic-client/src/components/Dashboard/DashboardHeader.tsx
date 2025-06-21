import React from "react";
import { GreetingHeader } from "../GreetingHeader/GreetingHeader";
import { useAuth } from "../../contexts/AuthContext";

const DashboardHeader: React.FC = () => {
  const { user, selectedCompanyName, selectedClinicName } = useAuth();
  return (
    <GreetingHeader
      userName={user?.name ?? ""}
      userAvatarUrl={user?.imageUrl ?? ""}
      companyName={selectedCompanyName ?? ""}
      clinicName={selectedClinicName ?? ""}
      pageTitle="Panel"
      showBackButton={true}
    />
  );
};

export default DashboardHeader;
