// src/components/ClinicSelector/EmptyClinics.tsx
import React from "react";
import { BuildingOffice2Icon } from "@heroicons/react/24/outline";
import CreateClinicButton from "../Button/CreateClinicButton/CreateClinicButton";

interface Props {
  onCreated: (id: string) => void;
}

const EmptyClinics: React.FC<Props> = ({ onCreated }) => (
  <div className="w-full flex flex-col items-center">
    <div className="rounded-full bg-white p-6 mb-4">
      <BuildingOffice2Icon className="w-14 h-14 text-black" />
    </div>
    <div className="text-xl font-semibold text-black mb-1 text-center">
      Henüz bir klinik yok!
    </div>
    <div className="text-gray-500 mb-7 text-center max-w-xs">
      <span className="font-medium text-black">
        İlk kliniğinizi eklemek için aşağıdaki butonu kullanın.
      </span>
    </div>
    <div className="w-full max-w-sm">
      <CreateClinicButton onCreated={onCreated} />
    </div>
  </div>
);

export default EmptyClinics;
