import React from "react";

interface Props {
  companyName?: string | null;
}

const ClinicSelectorHeader: React.FC<Props> = ({ companyName }) => (
  <div className="relative z-10 flex flex-col items-center justify-center select-none pt-4">
    <img
      src="/randevi-small.png"
      alt="Randevi logo"
      className="h-14 rounded-lg mb-2 "
    />
    <div className="flex items-center mb-2">
      <div className="w-2 h-2 rounded-full bg-black mx-3 my-1 " />
    </div>
    {companyName && (
      <span className="text-xl md:text-2xl font-bold text-black tracking-wide text-center ">
        {companyName}
      </span>
    )}
  </div>
);

export default ClinicSelectorHeader;
