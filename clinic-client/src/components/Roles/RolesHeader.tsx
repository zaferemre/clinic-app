import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import GreetingHeader from "../GreetingHeader/GreetingHeader";

const RolesHeader: React.FC = () => {
  const { user, selectedClinicName } = useAuth();

  return (
    <GreetingHeader
      userAvatarUrl={user?.photoUrl ?? ""}
      clinicName={selectedClinicName ?? ""}
      pageTitle="Roller"
      showBackButton={true}
    />
  );
};

export default RolesHeader;
