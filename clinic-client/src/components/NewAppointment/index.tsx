// src/components/CalendarView/NewAppointment/index.tsx
import { useState, useEffect, useCallback } from "react";
import AppModal, { ModalForm } from "../Modals/AppModal";
import AppointmentTypeTabs from "./AppointmentTypeTabs";
import PatientSelect from "./PatientSelect";
import GroupSelect from "./GroupSelect";
import EmployeeSelect from "./EmployeeSelect";
import ServiceSelect from "./ServiceSelect";
import OzelDurationPicker from "./OzelDurationPicker";
import DateNavigation from "./DateNavigation";
import SlotPickerSection from "./SlotPickerSection";
import ModalActions from "./ModalActions";
import ServiceModal from "../Modals/ServiceModal/ServiceModal";
import CreatePatientForm from "../Forms/CreatePatientForm";
import { useAuth } from "../../contexts/AuthContext";
import { getAppointments } from "../../api/appointmentApi";
import type {
  Patient,
  EmployeeInfo,
  ServiceInfo,
  Group,
} from "../../types/sharedTypes";

type Kind = "individual" | "group" | "ozel";
const DEFAULT_SERVICE_DURATION = 30;

// Raw appointment shape returned by your API
interface RawAppointment {
  start: string; // ISO string
  end: string; // ISO string
  // ...other fields
}

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

export default function NewAppointmentModal({
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
}: Props) {
  const { idToken, selectedCompanyId, selectedClinicId } = useAuth();

  // State for showing sub‐flows
  const [flow, setFlow] = useState<"main" | "patient" | "service">("main");
  const [kind, setKind] = useState<Kind>(tab ?? "individual");
  const [ozelDuration, setOzelDuration] = useState(DEFAULT_SERVICE_DURATION);
  const [internalDay, setInternalDay] = useState<Date>(modalDay ?? new Date());

  // ---- NEW: busy intervals for this clinic ----
  const [busyIntervals, setBusyIntervals] = useState<
    { start: Date; end: Date }[]
  >([]);

  useEffect(() => {
    // Whenever the modal opens or the selected day changes, fetch appointments
    if (!show || !idToken || !selectedCompanyId || !selectedClinicId) return;

    getAppointments(idToken, selectedCompanyId, selectedClinicId)
      .then((appts: RawAppointment[]) => {
        // Map raw ISO strings into Date objects
        const intervals = appts.map((a) => ({
          start: new Date(a.start),
          end: new Date(a.end),
        }));
        setBusyIntervals(intervals);
      })
      .catch(() => {
        setBusyIntervals([]); // fallback
      });
  }, [show, idToken, selectedCompanyId, selectedClinicId, internalDay]);

  // Reset tab/kind when reopening
  useEffect(() => {
    if (show) {
      setKind(tab ?? "individual");
      setInternalDay(modalDay ?? new Date());
    }
  }, [show, tab, modalDay]);

  const handleSubmit = useCallback(async (): Promise<boolean> => {
    try {
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
      } else {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }, [
    kind,
    onSubmitIndividual,
    onSubmitGroup,
    onSubmitCustom,
    startStr,
    endStr,
    isOwner,
    selectedEmployee,
    currentUserId,
    selectedService,
    selectedGroup,
  ]);

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
        <AppModal
          open
          title="Yeni Randevu Oluştur"
          onClose={onClose}
          onSuccess={onClose}
        >
          <AppointmentTypeTabs kind={kind} setKind={setKind} />

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

          {kind !== "ozel" ? (
            <ServiceSelect
              services={services}
              value={selectedService}
              setValue={setSelectedService}
              onNewService={() => setFlow("service")}
            />
          ) : (
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
            setModalDay={setInternalDay}
            setStartStr={setStartStr}
            setEndStr={setEndStr}
          />

          {/* Pass the newly fetched busy intervals */}
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
            busy={busyIntervals}
          />

          <ModalForm onSubmit={handleSubmit}>
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
          </ModalForm>
        </AppModal>
      )}
    </>
  );
}
