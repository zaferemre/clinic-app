import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import GreetingHeader from "../GreetingHeader/GreetingHeader";
import Greetings from "../GreetingHeader/Greetings";

const HomeHeader: React.FC = () => {
  const { user, selectedClinicName } = useAuth();
  return (
    <>
      <GreetingHeader
        userAvatarUrl={user?.imageUrl ?? ""}
        clinicName={selectedClinicName ?? ""}
        pageTitle="Ana Sayfa"
        showBackButton={true}
      />
      <Greetings userName={user?.name ?? ""} />
    </>
  );
};

export default HomeHeader;
