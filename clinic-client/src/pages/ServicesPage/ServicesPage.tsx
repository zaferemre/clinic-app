// src/pages/ServicesPage.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getServices, deleteService } from "../../api/servicesApi";
import type { ServiceInfo } from "../../types/sharedTypes";

import { ServicesList } from "../../components/ServicesList/ServicesList";
import { ServiceModal } from "../../components/Modals/ServiceModal/ServiceModal";
import { NavigationBar } from "../../components/NavigationBar/NavigationBar";
import GreetingHeader from "../../components/GreetingHeader/GreetingHeader";
import { WrenchScrewdriverIcon } from "@heroicons/react/24/outline";

export const ServicesPage: React.FC = () => {
  const {
    idToken,
    selectedCompanyId: companyId,
    selectedClinicId: clinicId,
    selectedCompanyName,
    selectedClinicName,
    user,
    companies,
  } = useAuth();

  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [modalService, setModalService] = useState<ServiceInfo | undefined>();
  const [showModal, setShowModal] = useState(false);

  // Determine ownership by comparing user.uid to company.ownerUserId
  const selectedCompany = companies.find((c) => c._id === companyId) ?? null;
  const isOwner = selectedCompany?.ownerUserId === user?.uid;

  // Load services for the current clinic
  const loadServices = () => {
    if (!idToken || !companyId || !clinicId) return;
    getServices(idToken, companyId, clinicId)
      .then(setServices)
      .catch(() => setServices([]));
  };
  useEffect(loadServices, [idToken, companyId, clinicId]);

  // Handlers
  const handleAdd = () => {
    setModalService(undefined);
    setShowModal(true);
  };
  const handleEdit = (s: ServiceInfo) => {
    setModalService(s);
    setShowModal(true);
  };
  const handleDelete = async (id: string) => {
    if (!idToken || !companyId || !clinicId) return;
    if (!window.confirm("Bu hizmeti silmek istediğinizden emin misiniz?"))
      return;
    await deleteService(idToken, companyId, clinicId, id);
    loadServices();
  };

  // Guard: require context
  if (
    !idToken ||
    !companyId ||
    !clinicId ||
    !selectedCompanyName ||
    !selectedClinicName ||
    !user
  ) {
    return (
      <div className="p-8 text-center text-brand-gray-400">
        Lütfen önce bir şirket ve klinik seçin.
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen bg-brand-gray-100 flex flex-col pb-16">
      <GreetingHeader
        userAvatarUrl={user.photoUrl}
        clinicName={selectedClinicName}
        pageTitle="Hizmetler"
        showBackButton
      />

      {/* Add Service Button (owner only) */}
      {isOwner && services.length > 0 && (
        <div className="flex justify-end mb-4">
          <button
            onClick={handleAdd}
            className="bg-brand-main text-white px-4 py-2 rounded shadow hover:bg-brand-red-300 transition font-semibold"
          >
            + Yeni Hizmet
          </button>
        </div>
      )}

      {/* Empty State or List */}
      {services.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl shadow mb-8">
          <WrenchScrewdriverIcon className="w-16 h-16 text-brand-main mb-4" />
          <div className="text-lg font-semibold text-brand-gray-700 mb-2">
            Henüz hiç hizmet eklenmemiş.
          </div>
          <div className="text-brand-gray-500 mb-4">
            Hizmet ekleyerek randevu oluşturabilirsiniz.
          </div>
          {isOwner && (
            <button
              onClick={handleAdd}
              className="mt-2 bg-brand-main text-white px-5 py-2 rounded-xl shadow font-semibold hover:bg-brand-red-300 transition"
            >
              + Yeni Hizmet Ekle
            </button>
          )}
        </div>
      ) : (
        <ServicesList
          services={services}
          isOwner={isOwner}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <ServiceModal
        show={showModal}
        serviceToEdit={modalService}
        onClose={() => setShowModal(false)}
      />

      <NavigationBar />
    </div>
  );
};

export default ServicesPage;
