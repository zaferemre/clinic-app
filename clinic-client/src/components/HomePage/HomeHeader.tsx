import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { GreetingHeader } from "../GreetingHeader/GreetingHeader";

const HomeHeader: React.FC = () => {
  const { user, selectedCompanyName, selectedClinicName } = useAuth();
  return (
    <GreetingHeader
      userName={user?.name ?? ""}
      userAvatarUrl={user?.imageUrl ?? ""}
      companyName={selectedCompanyName ?? ""}
      clinicName={selectedClinicName ?? ""}
      pageTitle="Ana Sayfa"
      showBackButton={true}
    />
  );
};

export default HomeHeader;
