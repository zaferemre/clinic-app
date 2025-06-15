import React from "react";

interface GreetingHeaderProps {
  userName: string;
  userAvatarUrl?: string;
  companyName: string;
  companyLogoUrl?: string;
}

export const GreetingHeader: React.FC<GreetingHeaderProps> = ({
  userName,
  userAvatarUrl,
  companyName,
  companyLogoUrl,
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <div className="flex items-center gap-2">
          {companyLogoUrl && (
            <img
              src={companyLogoUrl}
              alt="Company"
              className="w-9 h-9 rounded-full border border-brand-main bg-white object-cover"
            />
          )}
          <span className="text-lg font-extrabold text-brand-main">
            {companyName}
          </span>
        </div>
        <div className="text-base mt-1 text-gray-700">
          Hoş geldin, <span className="font-semibold">{userName}</span>!
        </div>
      </div>
      {userAvatarUrl && (
        <img
          src={userAvatarUrl}
          alt="Kullanıcı"
          className="w-10 h-10 rounded-full border border-gray-200 object-cover"
        />
      )}
    </div>
  );
};
