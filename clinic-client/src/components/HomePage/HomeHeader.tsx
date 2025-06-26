import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import Greetings from "../GreetingHeader/Greetings";
import HomeGreetingHeader from "../GreetingHeader/HomeGreetingsHeader";

const HomeHeader: React.FC = () => {
  const { user, selectedClinicName } = useAuth();
  return (
    <>
      <HomeGreetingHeader
        userAvatarUrl={user?.photoUrl ?? ""}
        clinicName={selectedClinicName ?? ""}
        pageTitle="Ana Sayfa"
        showBackButton={true}
      />
      <Greetings userName={user?.name ?? ""} />
    </>
  );
};

export default HomeHeader;
