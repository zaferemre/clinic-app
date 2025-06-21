import React from "react";
import BackButton from "../Button/BackButton";

interface GreetingHeaderProps {
  userName: string;
  userAvatarUrl?: string;
  companyName: string;

  clinicName: string;
  pageTitle?: string;
  showBackButton?: boolean;
}

export const GreetingHeader: React.FC<GreetingHeaderProps> = ({
  userName,
  userAvatarUrl,
  companyName,

  clinicName,
  pageTitle,
  showBackButton = false,
}) => {
  return (
    <header className="flex items-center justify-between mb-4 px-2 pt-2 bg-transparent">
      <div className="flex flex-col min-w-0 w-full">
        {/* DATE & BACK BUTTON */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            {showBackButton && <BackButton />}
          </div>
        </div>
        {/* MAIN HEADER */}
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <span className="text-base font-bold text-brand-main truncate">
            {companyName}
          </span>
          <span className="mx-1 text-brand-main font-bold">•</span>
          <span className="text-base font-semibold text-brand-black truncate">
            {clinicName}
          </span>
          {pageTitle && (
            <>
              <span className="mx-1 text-black font-bold">•</span>
              <span className="text-base font-semibold text-gray-600 truncate">
                {pageTitle}
              </span>
            </>
          )}
        </div>
        {/* Welcome Row */}
        <div className="mt-1 text-sm text-gray-500">
          Merhaba,{" "}
          <span className="font-semibold text-brand-black">{userName}</span>!
        </div>
      </div>
      {userAvatarUrl && (
        <div className="flex-shrink-0 ml-2">
          <img
            src={userAvatarUrl}
            alt="Kullanıcı"
            className="w-14 mt-8 rounded-full border-4 border-brand-main object-cover"
          />
        </div>
      )}
    </header>
  );
};
