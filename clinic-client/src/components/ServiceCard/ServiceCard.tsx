import React from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { ServiceInfo } from "../../types/sharedTypes";

interface Props {
  service: ServiceInfo;
  isOwner: boolean;
  onEdit: (service: ServiceInfo) => void;
  onDelete: (id: string) => void;
}

export const ServiceCard: React.FC<Props> = ({
  service,
  isOwner,
  onEdit,
  onDelete,
}) => (
  <div className="relative bg-white border border-brand-gray-100 rounded-xl p-4 hover:shadow-lg transition-all duration-150">
    {isOwner && (
      <div className="absolute top-2 right-2 flex space-x-1">
        <button
          onClick={() => onEdit(service)}
          className="p-1 hover:bg-gray-100 rounded"
          aria-label="Düzenle"
        >
          <PencilIcon className="h-5 w-5 text-brand-main" />
        </button>
        <button
          onClick={() => service._id && onDelete(service._id)}
          className="p-1 hover:bg-gray-100 rounded"
          aria-label="Sil"
        >
          <TrashIcon className="h-5 w-5 text-red-500" />
        </button>
      </div>
    )}
    <div className="space-y-1">
      <h3 className="text-base font-bold text-brand-main truncate">
        {service.serviceName}
      </h3>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-brand-gray-600 text-sm mt-1">
        <span>
          <span className="font-medium">Ücret:</span> {service.servicePrice} TL
        </span>

        <span>
          <span className="font-medium">Süre:</span> {service.serviceDuration}{" "}
          dk
        </span>
      </div>
    </div>
  </div>
);
