import React, { useState } from "react";

interface JoinCodeBannerProps {
  joinCode: string | null | undefined;
  label?: string; // Optional, defaults to "Klinik Kodu"
  description?: string; // Optional, defaults to sensible text
}

const JoinCodeBanner: React.FC<JoinCodeBannerProps> = ({
  joinCode,
  label = "Klinik Kodu",
  description = "Bu kodu çalışanlarınızla paylaşarak onların kliniğe katılmasını sağlayabilirsiniz.",
}) => {
  const [copied, setCopied] = useState(false);

  if (!joinCode) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="my-4">
      <div className="font-semibold text-brand-main mb-1">{label}</div>
      <div className="text-xs text-gray-500 mb-2">{description}</div>
      <div className="flex items-center gap-2">
        <span className="text-xs sm:text-sm bg-gray-50 border px-3 py-1 rounded-xl font-mono tracking-wider select-all">
          {joinCode}
        </span>
        <button
          className={`px-3 py-1 rounded-xl text-xs sm:text-sm font-medium transition ${
            copied
              ? "bg-green-100 text-green-600"
              : "bg-brand-main text-white hover:bg-brand-green"
          }`}
          onClick={handleCopy}
          type="button"
        >
          {copied ? "Kopyalandı!" : "Kopyala"}
        </button>
      </div>
    </div>
  );
};

export default JoinCodeBanner;
