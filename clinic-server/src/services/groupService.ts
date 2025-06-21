// src/services/groupService.ts
import * as repoGroup from "../dataAccess/groupRepository";
import * as repoPatient from "../dataAccess/patientRepository";
import { Types } from "mongoose";
import createError from "http-errors";

// Helper: validate that a string is a Mongo ObjectId
function validId(id: string) {
  return Types.ObjectId.isValid(id);
}

export async function listGroups(companyId: string, clinicId: string) {
  if (!validId(companyId) || !validId(clinicId))
    throw createError(400, "Invalid company or clinic id");
  return repoGroup.listGroups(companyId, clinicId);
}

export async function createGroup(
  companyId: string,
  clinicId: string,
  data: any,
  userId: string
) {
  if (!validId(companyId)) throw createError(400, "Invalid companyId");
  if (!validId(clinicId)) throw createError(400, "Invalid clinicId");

  // Safely parse incoming patient IDs into ObjectIds
  const patients: Types.ObjectId[] = Array.isArray(data.patients)
    ? data.patients
        .filter((id: string) => validId(id))
        .map((id: string) => new Types.ObjectId(id))
    : [];

  const doc = {
    companyId: new Types.ObjectId(companyId),
    clinicId: new Types.ObjectId(clinicId),
    name: data.name,
    note: data.note,
    credit: typeof data.credit === "number" ? data.credit : 0,
    maxSize:
      typeof data.size === "number"
        ? data.size
        : typeof data.maxSize === "number"
        ? data.maxSize
        : 0,
    status:
      data.status === "active" ||
      data.status === "inactive" ||
      data.status === "archived"
        ? data.status
        : "active",
    patients,
    employees: Array.isArray(data.employees)
      ? data.employees
          .filter((id: string) => validId(id))
          .map((id: string) => new Types.ObjectId(id))
      : [],
    groupType: data.groupType,
    appointments: [] as Types.ObjectId[],
    createdBy: userId,
    customFields: data.customFields ?? {},
  };

  const group = await repoGroup.createGroup(doc as Partial<typeof doc>);

  // Keep patient → group backreference in sync
  if (patients.length) {
    await repoPatient.addGroupToPatients(
      patients.map((o) => o.toString()),
      (group as { _id: Types.ObjectId | string })._id.toString()
    );
  }

  return group;
}

export async function getGroup(
  companyId: string,
  clinicId: string,
  groupId: string
) {
  if (!validId(companyId) || !validId(clinicId) || !validId(groupId))
    throw createError(400, "Invalid ids");
  const g = await repoGroup.findGroupById(companyId, clinicId, groupId);
  if (!g) throw createError(404, "Group not found");
  return g;
}

export async function updateGroup(
  companyId: string,
  clinicId: string,
  groupId: string,
  updates: any
) {
  if (!validId(companyId) || !validId(clinicId) || !validId(groupId))
    throw createError(400, "Invalid ids");
  const updated = await repoGroup.updateGroupById(groupId, updates);
  if (!updated) throw createError(404, "Group not found");
  return updated;
}

export async function deleteGroup(
  companyId: string,
  clinicId: string,
  groupId: string
) {
  if (!validId(groupId)) throw createError(400, "Invalid groupId");
  // remove group from patients
  await repoPatient.removeGroupFromAllPatients(groupId);
  // delete group doc
  await repoGroup.deleteGroupById(groupId);
}

export async function addPatientToGroup(
  companyId: string,
  clinicId: string,
  groupId: string,
  patientId: string
) {
  if (!validId(groupId) || !validId(patientId))
    throw createError(400, "Invalid groupId or patientId");
  const updatedGroup = await repoGroup.addPatientToGroup(
    companyId,
    clinicId,
    groupId,
    patientId
  );
  if (!updatedGroup) throw createError(404, "Group not found");
  // also update patient→groups backref
  await repoPatient.addGroupToPatients([patientId], groupId);
  return updatedGroup;
}

export async function removePatientFromGroup(
  companyId: string,
  clinicId: string,
  groupId: string,
  patientId: string
) {
  if (!validId(groupId) || !validId(patientId))
    throw createError(400, "Invalid groupId or patientId");
  const updatedGroup = await repoGroup.removePatientFromGroup(
    companyId,
    clinicId,
    groupId,
    patientId
  );
  if (!updatedGroup) throw createError(404, "Group not found");
  // also remove from patient→groups backref
  await repoPatient.removeGroupFromPatients([patientId], groupId);
  return updatedGroup;
}
