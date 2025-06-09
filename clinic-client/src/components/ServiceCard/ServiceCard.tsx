import React from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Service } from "../../api/servicesApi";

interface Props {
  service: Service;
  isOwner: boolean;
  onEdit: (service: Service) => void;
  onDelete: (id: string) => void;
}

export const ServiceCard: React.FC<Props> = ({
  service,
  isOwner,
  onEdit,
  onDelete,
}) => (
  <div className="relative bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all duration-150">
    {isOwner && (
      <div className="absolute top-2 right-2 flex space-x-2">
        <button
          onClick={() => onEdit(service)}
          className="p-1 hover:bg-gray-100 rounded"
          aria-label="Düzenle"
        >
          <PencilIcon className="h-5 w-5 text-indigo-600" />
        </button>
        <button
          onClick={() => onDelete(service._id)}
          className="p-1 hover:bg-gray-100 rounded"
          aria-label="Sil"
        >
          <TrashIcon className="h-5 w-5 text-red-600" />
        </button>
      </div>
    )}
    <div className="space-y-1">
      <h3 className="text-base font-semibold text-gray-800 truncate">
        {service.serviceName}
      </h3>
      <div className="flex flex-wrap gap-2 text-gray-500 text-xs">
        <span>Ücret: {service.servicePrice} TL</span>
        <span>Kapora: {service.serviceKapora} TL</span>
        <span>Süre: {service.serviceDuration} dk</span>
      </div>
    </div>
  </div>
);
