// src/components/ServicesList/ServicesList.tsx
import React from "react";
import type { ServiceInfo } from "../../types/sharedTypes";
import { ServiceCard } from "../ServiceCard/ServiceCard";

interface Props {
  services: ServiceInfo[];
  isOwner: boolean;
  onEdit: (service: ServiceInfo) => void;
  onDelete: (id: string) => void;
}

export const ServicesList: React.FC<Props> = ({
  services,
  isOwner,
  onEdit,
  onDelete,
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {services.map((s) => (
      <ServiceCard
        key={s._id}
        service={s}
        isOwner={isOwner}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    ))}
  </div>
);
