import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { GreetingHeader } from "../GreetingHeader/GreetingHeader";

const RolesHeader: React.FC = () => {
  const { user, selectedCompanyName, selectedClinicName } = useAuth();

  return (
    <GreetingHeader
      userName={user?.name ?? ""}
      userAvatarUrl={user?.imageUrl ?? ""}
      companyName={selectedCompanyName ?? ""}
      clinicName={selectedClinicName ?? ""}
      pageTitle="Roller"
      showBackButton={true}
    />
  );
};

export default RolesHeader;
