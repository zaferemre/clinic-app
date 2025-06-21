// src/components/CalendarView/NewAppointment/index.tsx
import React, { useState, useEffect } from "react";
import AppointmentTypeTabs from "./AppointmentTypeTabs";
import PatientSelect from "./PatientSelect";
import GroupSelect from "./GroupSelect";
import EmployeeSelect from "./EmployeeSelect";
import ServiceSelect from "./ServiceSelect";
import OzelDurationPicker from "./OzelDurationPicker";
import DateNavigation from "./DateNavigation";
import SlotPickerSection from "./SlotPickerSection";
import ModalActions from "./ModalActions";
import AppModal from "../Modals/AppModal";
import ServiceModal from "../Modals/ServiceModal/ServiceModal";
import CreatePatientForm from "../Forms/CreatePatientForm";

import { useAuth } from "../../contexts/AuthContext";
import type {
  Patient,
  EmployeeInfo,
  ServiceInfo,
  Group,
} from "../../types/sharedTypes";

type Kind = "individual" | "group" | "ozel";

interface Props {
  show: boolean;
  onClose: () => void;
  patients: Patient[];
  employees: EmployeeInfo[];
  services: ServiceInfo[];
  groups: Group[];
  isOwner: boolean;
  currentUserId: string;
  currentUserName: string;
  selectedPatient: string;
  setSelectedPatient: (id: string) => void;
  selectedEmployee: string;
  setSelectedEmployee: (id: string) => void;
  selectedService: string;
  setSelectedService: (id: string) => void;
  selectedGroup: string;
  setSelectedGroup: (id: string) => void;
  modalDay?: Date;
  startStr: string;
  setStartStr: (val: string) => void;
  endStr: string;
  setEndStr: (val: string) => void;
  tab?: Kind;
  onSubmitIndividual?: (
    start: string,
    end: string,
    employeeId: string,
    serviceId: string
  ) => void;
  onSubmitGroup?: (
    groupId: string,
    start: string,
    end: string,
    employeeId: string,
    serviceId: string
  ) => void;
  onSubmitCustom?: (start: string, end: string, employeeId: string) => void;
  onAddPatient: () => void;
  onServiceAdded?: () => void;
}

const DEFAULT_SERVICE_DURATION = 30;

const NewAppointmentModal: React.FC<Props> = ({
  show,
  onClose,
  patients,
  employees,
  services,
  groups,
  isOwner,
  currentUserId,
  currentUserName,
  selectedPatient,
  setSelectedPatient,
  selectedEmployee,
  setSelectedEmployee,
  selectedService,
  setSelectedService,
  selectedGroup,
  setSelectedGroup,
  modalDay,
  startStr,
  setStartStr,
  endStr,
  setEndStr,
  tab,
  onSubmitIndividual,
  onSubmitGroup,
  onSubmitCustom,
  onAddPatient,
  onServiceAdded,
}) => {
  const { idToken, selectedCompanyId, selectedClinicId } = useAuth();
  const [flow, setFlow] = useState<"main" | "patient" | "service">("main");
  const [kind, setKind] = useState<Kind>(tab ?? "individual");
  const [ozelDuration, setOzelDuration] = useState(DEFAULT_SERVICE_DURATION);
  const [internalDay, setInternalDay] = useState<Date>(modalDay ?? new Date());

  useEffect(() => {
    setKind(tab ?? "individual");
  }, [tab, show]);

  useEffect(() => {
    if (modalDay) setInternalDay(modalDay);
  }, [modalDay]);

  if (!show) return null;

  return (
    <>
      {flow === "service" && (
        <ServiceModal
          show
          onClose={() => setFlow("main")}
          onSaved={onServiceAdded}
        />
      )}

      {flow === "patient" &&
        idToken &&
        selectedCompanyId &&
        selectedClinicId && (
          <CreatePatientForm
            show
            idToken={idToken}
            companyId={selectedCompanyId}
            clinicId={selectedClinicId}
            onClose={() => setFlow("main")}
            onCreated={() => {
              setFlow("main");
              onAddPatient();
            }}
          />
        )}

      {flow === "main" && (
        <AppModal open title="Yeni Randevu Oluştur" onClose={onClose}>
          <AppointmentTypeTabs kind={kind} setKind={setKind} />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (kind === "individual" && onSubmitIndividual) {
                onSubmitIndividual(
                  startStr,
                  endStr,
                  isOwner ? selectedEmployee : currentUserId,
                  selectedService
                );
              } else if (kind === "group" && onSubmitGroup) {
                onSubmitGroup(
                  selectedGroup,
                  startStr,
                  endStr,
                  isOwner ? selectedEmployee : currentUserId,
                  selectedService
                );
              } else if (kind === "ozel" && onSubmitCustom) {
                onSubmitCustom(
                  startStr,
                  endStr,
                  isOwner ? selectedEmployee : currentUserId
                );
              }
            }}
            className="space-y-5"
          >
            {kind === "individual" && (
              <PatientSelect
                patients={patients}
                value={selectedPatient}
                setValue={setSelectedPatient}
                onNewPatient={() => setFlow("patient")}
              />
            )}

            {kind === "group" && (
              <GroupSelect
                groups={groups}
                value={selectedGroup}
                setValue={setSelectedGroup}
              />
            )}

            <EmployeeSelect
              employees={employees}
              isOwner={isOwner}
              value={selectedEmployee}
              setValue={setSelectedEmployee}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
            />

            {kind !== "ozel" && (
              <ServiceSelect
                services={services}
                value={selectedService}
                setValue={setSelectedService}
                onNewService={() => setFlow("service")}
              />
            )}

            {kind === "ozel" && (
              <OzelDurationPicker
                duration={ozelDuration}
                setDuration={setOzelDuration}
                setStartStr={setStartStr}
                setEndStr={setEndStr}
                day={internalDay}
              />
            )}

            <DateNavigation
              day={internalDay}
              setDay={setInternalDay}
              setModalDay={(d) => setInternalDay(d)}
              setStartStr={setStartStr}
              setEndStr={setEndStr}
            />

            <SlotPickerSection
              kind={kind}
              selectedService={selectedService}
              serviceDuration={
                kind === "ozel"
                  ? ozelDuration
                  : services.find((s) => s._id === selectedService)
                      ?.serviceDuration ?? DEFAULT_SERVICE_DURATION
              }
              day={internalDay}
              startStr={startStr}
              setStartStr={setStartStr}
              setEndStr={setEndStr}
            />

            <ModalActions
              onClose={onClose}
              creating={false}
              canSubmit={
                !!(isOwner ? selectedEmployee : currentUserId) &&
                !!startStr &&
                !!endStr &&
                ((kind === "individual" &&
                  !!selectedPatient &&
                  !!selectedService) ||
                  (kind === "group" && !!selectedGroup && !!selectedService) ||
                  kind === "ozel")
              }
            />
          </form>
        </AppModal>
      )}
    </>
  );
};

export default NewAppointmentModal;
