import React, { useState, useMemo } from "react";
import {
  PencilIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import PatientPreviewList from "../../Lists/PatientPreviewList";
import EditGroupForm from "../../Forms/EditGroupForm";
import { useAuth } from "../../../contexts/AuthContext";
import { useEnrichedAppointments } from "../../../hooks/useEnrichedAppointments";
import type {
  Group,
  Patient,
  EnrichedAppointment,
} from "../../../types/sharedTypes";

interface GroupCardProps {
  group: Group;
  patients: Patient[];
  isExpanded?: boolean; // NEW
  onToggleExpand?: (id: string) => void;
}

const GroupCard: React.FC<GroupCardProps> = ({
  group,
  patients,
  isExpanded: controlledExpanded,
  onToggleExpand,
}) => {
  const [localExpanded, setLocalExpanded] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  // If isExpanded is provided, use that, else use local state
  const expanded = controlledExpanded ?? localExpanded;

  const handleToggle = () => {
    if (onToggleExpand) {
      onToggleExpand(group._id);
    } else {
      setLocalExpanded((e) => !e);
    }
  };
  // Auth + hook to fetch all appointments
  const { idToken, selectedCompanyId, selectedClinicId } = useAuth();
  const { appointments } = useEnrichedAppointments(
    idToken!,
    selectedCompanyId!,
    selectedClinicId!
  );

  // Filter appointments for this group
  const groupAppointments = useMemo<EnrichedAppointment[]>(
    () => (appointments || []).filter((a) => a.groupId === group._id),
    [appointments, group._id]
  );

  // Find patients in the group
  const groupPatientIds = (group.patients ?? []).map((id) => id?.toString());
  const groupPatients = (patients ?? []).filter((p) =>
    groupPatientIds.includes(p._id?.toString())
  );

  // Extra info fields (groupType, note)
  const extraInfo: { label: string; value: string }[] = [];
  if (group.groupType) extraInfo.push({ label: "Tip", value: group.groupType });
  if (group.note) extraInfo.push({ label: "Not", value: group.note });

  return (
    <div
      className={`bg-white mx-3 rounded-2xl shadow p-4 mb-3 transition relative ${
        expanded ? "ring-2 ring-brand-main" : ""
      }`}
      tabIndex={0}
      role="button"
      onClick={handleToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleToggle();
      }}
      style={{ cursor: "pointer" }}
    >
      {/* Header */}
      <div className="flex justify-between items-center gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg text-brand-main">
              {group.name}
            </span>
            <span className="ml-1 text-xs bg-gray-200 rounded-full px-2 py-0.5">
              {groupPatients.length}/{group.maxSize}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mt-1 text-xs">
            <span
              className={`rounded px-2 py-1 ${
                group.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              Durum: {group.status}
            </span>
            <span className="bg-brand-main-50 rounded px-2 py-1">
              Kredi: {group.credit}
            </span>
          </div>
          {extraInfo.map((f) => (
            <div key={f.label} className="text-xs mt-1 text-gray-500">
              <b>{f.label}:</b> {f.value}
            </div>
          ))}
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowEdit(true);
            }}
            className="p-2 rounded-full bg-green-50 hover:bg-green-100"
            aria-label="Edit group"
            tabIndex={0}
            type="button"
          >
            <PencilIcon className="w-5 h-5 text-green-600" />
          </button>
          <button
            className="mt-1"
            onClick={(e) => {
              e.stopPropagation();
              handleToggle();
            }}
            aria-label={expanded ? "Kapat" : "Aç"}
            tabIndex={0}
            type="button"
          >
            {expanded ? (
              <ChevronUpIcon className="w-5 h-5 text-brand-gray-400" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-brand-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded: show patients & appointments */}
      {expanded && (
        <div className="mt-3 space-y-4">
          <div>
            <span className="font-semibold text-brand-black">Hastalar:</span>
            {groupPatients.length > 0 ? (
              <PatientPreviewList patients={groupPatients} />
            ) : (
              <span className="ml-2 text-brand-gray-400">
                Henüz hasta eklenmedi
              </span>
            )}
          </div>

          <div>
            <span className="font-semibold text-brand-black">Randevular:</span>
            {groupAppointments.length > 0 ? (
              <ul className="ml-4 list-disc text-sm">
                {groupAppointments.map((a) => (
                  <li key={a.id}>
                    {new Date(a.start).toLocaleDateString("tr-TR")} –{" "}
                    {a.employeeName || a.employeeEmail || "-"} – {a.status}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="ml-2 text-brand-gray-400">Yok</span>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <EditGroupForm group={group} onClose={() => setShowEdit(false)} />
      )}
    </div>
  );
};

export default GroupCard;
