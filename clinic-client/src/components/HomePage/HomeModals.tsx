// src/components/HomePage/HomeModals.tsx
import React from "react";
import CreatePatientForm from "../Forms/CreatePatientForm";
import NewAppointmentModal from "../NewAppointment";
import { ServiceModal } from "../Modals/ServiceModal/ServiceModal";
import type {
  Patient,
  EmployeeInfo,
  ServiceInfo,
  Group,
} from "../../types/sharedTypes";

export type HomeModalType =
  | "addPatient"
  | "addAppointment"
  | "addService"
  | null;

interface HomeModalsProps {
  activeModal: HomeModalType;
  closeModal: () => void;
  onAddPatientInModal: () => void;
  onServiceAdded?: () => void;

  // the rest of the modal props...
  idToken: string;
  companyId: string;
  clinicId: string;
  patients: Patient[];
  employees: EmployeeInfo[];
  services: ServiceInfo[];
  groups: Group[];
  isOwner: boolean;
  currentUserId: string;
  currentUserName: string;
  selectedPatient: string;
  setSelectedPatient: (v: string) => void;
  selectedEmployee: string;
  setSelectedEmployee: (v: string) => void;
  selectedService: string;
  setSelectedService: (v: string) => void;
  selectedGroup: string;
  setSelectedGroup: (v: string) => void;
  startStr: string;
  setStartStr: (v: string) => void;
  endStr: string;
  setEndStr: (v: string) => void;
  onSubmitIndividual: (
    start: string,
    end: string,
    emp: string,
    service: string
  ) => void;
  onSubmitGroup: (
    group: string,
    start: string,
    end: string,
    emp: string,
    service: string
  ) => void;
  onSubmitCustom: (start: string, end: string, emp: string) => void;
}

export const HomeModals: React.FC<HomeModalsProps> = ({
  activeModal,
  closeModal,
  onAddPatientInModal,
  onServiceAdded,
  ...modalProps
}) => (
  <>
    {/* Add Patient */}
    <CreatePatientForm
      show={activeModal === "addPatient"}
      onClose={closeModal}
      idToken={modalProps.idToken}
      companyId={modalProps.companyId}
      clinicId={modalProps.clinicId}
      onCreated={onAddPatientInModal}
    />

    {/* Appointment */}
    <NewAppointmentModal
      show={activeModal === "addAppointment"}
      onClose={closeModal}
      {...modalProps}
      onAddPatient={onAddPatientInModal}
      onServiceAdded={onServiceAdded}
    />

    {/* Service */}
    <ServiceModal
      show={activeModal === "addService"}
      onClose={closeModal}
      onSaved={onServiceAdded}
    />
  </>
);

export default HomeModals;
