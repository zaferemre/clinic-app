// src/pages/Messaging/MessagingPage.tsx

import React from "react";
import NavigationBar from "../../components/NavigationBar/NavigationBar";

const MessagingPage: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-brand-gray-100">
      {/* Bottom Navigation */}
      <NavigationBar />
    </div>
  );
};

export default MessagingPage;
