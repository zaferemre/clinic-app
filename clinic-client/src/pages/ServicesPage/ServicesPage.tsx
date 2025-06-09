import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  Service,
  getServices,
  createService,
  updateService,
  deleteService,
} from "../../api/servicesApi";

import { API_BASE } from "../../config/apiConfig";
import { ServicesList } from "../../components/ServicesList/ServicesList";
import { ServiceModal } from "../../components/Modals/ServiceModal/ServiceModal";
import { NavigationBar } from "../../components/NavigationBar/NavigationBar";

export const ServicesPage: React.FC = () => {
  const { idToken, companyId, user } = useAuth();
  const currentEmail = user!.email;

  const [ownerEmail, setOwnerEmail] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [modalService, setModalService] = useState<Service | undefined>();
  const [showModal, setShowModal] = useState(false);

  const isOwner = currentEmail === ownerEmail;

  useEffect(() => {
    if (!idToken || !companyId) return;
    fetch(`${API_BASE}/company/${companyId}`, {
      headers: { Authorization: `Bearer ${idToken}` },
    })
      .then((res) => res.json())
      .then((c) => setOwnerEmail(c.ownerEmail))
      .catch(() => setOwnerEmail(""));
  }, [idToken, companyId]);

  const load = () => {
    if (!idToken || !companyId) return;
    getServices(idToken, companyId)
      .then(setServices)
      .catch(() => setServices([]));
  };
  useEffect(load, [idToken, companyId]);

  const handleAdd = () => {
    setModalService(undefined);
    setShowModal(true);
  };
  const handleEdit = (s: Service) => {
    setModalService(s);
    setShowModal(true);
  };
  const handleDelete = async (id: string) => {
    if (!window.confirm("Bu hizmeti silmek istediğinizden eminson?")) return;
    await deleteService(idToken!, companyId!, id);
    load();
  };
  const handleSubmit = async (data: {
    serviceName: string;
    servicePrice: number;
    serviceKapora: number;
    serviceDuration: number;
    _id?: string;
  }) => {
    if (data._id) {
      await updateService(idToken!, companyId!, data._id, {
        serviceName: data.serviceName,
        servicePrice: data.servicePrice,
        serviceKapora: data.serviceKapora,
        serviceDuration: data.serviceDuration,
      });
    } else {
      await createService(
        idToken!,
        companyId!,
        data.serviceName,
        data.servicePrice,
        data.serviceKapora,
        data.serviceDuration
      );
    }
    setShowModal(false);
    load();
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Hizmetler</h1>
        {isOwner && (
          <button
            onClick={handleAdd}
            className="bg-brand-red-300 text-white px-4 py-2 rounded"
          >
            + Yeni Hizmet
          </button>
        )}
      </div>
      <ServicesList
        services={services}
        isOwner={isOwner}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <ServiceModal
        show={showModal}
        serviceToEdit={modalService}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
      />
      <NavigationBar />
    </div>
  );
};
