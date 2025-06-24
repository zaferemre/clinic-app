import React from "react";
import GreetingHeader from "../GreetingHeader/GreetingHeader";
import { useAuth } from "../../contexts/AuthContext";

const DashboardHeader: React.FC = () => {
  const { user, selectedClinicName } = useAuth();
  return (
    <GreetingHeader
      userAvatarUrl={user?.photoUrl ?? ""}
      clinicName={selectedClinicName ?? ""}
      pageTitle="Panel"
      showBackButton={true}
    />
  );
};

export default DashboardHeader;
