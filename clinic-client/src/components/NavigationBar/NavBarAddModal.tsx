// src/components/NavigationBar/NavBarAddModal.tsx
import React from "react";
import AppModal from "../Modals/AppModal";

interface Props {
  showAddModal: boolean;
  setShowAddModal: (v: boolean) => void;
  setShowAddPatient: (v: boolean) => void;
  setActiveModal: (v: "randevu" | "service" | null) => void;
}

const NavBarAddModal: React.FC<Props> = ({
  showAddModal,
  setShowAddModal,
  setShowAddPatient,
  setActiveModal,
}) => (
  <AppModal
    open={showAddModal}
    onClose={() => setShowAddModal(false)}
    title="Ekle"
  >
    <div className="flex flex-col gap-4">
      <button
        onClick={() => {
          setShowAddPatient(true);
          setShowAddModal(false);
        }}
        className="w-full py-3 bg-brand-main text-white rounded-xl"
      >
        Hasta Ekle
      </button>
      <button
        onClick={() => {
          setActiveModal("randevu");
          setShowAddModal(false);
        }}
        className="w-full py-3 bg-brand-main text-white rounded-xl"
      >
        Randevu Ekle
      </button>
      <button
        onClick={() => {
          setActiveModal("service");
          setShowAddModal(false);
        }}
        className="w-full py-3 bg-brand-main text-white rounded-xl"
      >
        Hizmet Ekle
      </button>
    </div>
  </AppModal>
);

export default NavBarAddModal;
