import React from "react";

interface GreetingsProps {
  userName: string;
  className?: string;
}

const Greetings: React.FC<GreetingsProps> = ({ userName, className = "" }) => (
  <div className={`mb-6 mt-1 flex items-center justify-between ${className}`}>
    <span className="text-xl font-semibold text-gray-800">
      Merhaba,{" "}
      <span className="text-xl font-extrabold text-brand-main-400">
        {userName}!
      </span>
    </span>
  </div>
);

export default Greetings;
