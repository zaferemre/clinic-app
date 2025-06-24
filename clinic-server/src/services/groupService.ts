import * as groupRepo from "../dataAccess/groupRepository";
import * as patientRepo from "../dataAccess/patientRepository";
import { Types } from "mongoose";
import createError from "http-errors";
import { getOrSetCache, invalidateCache } from "../utils/cacheHelpers";

function validId(id: string) {
  return Types.ObjectId.isValid(id);
}

export async function listGroups(companyId: string, clinicId: string) {
  if (!validId(companyId) || !validId(clinicId))
    throw createError(400, "Invalid company or clinic id");
  const cacheKey = `groups:${companyId}:${clinicId}`;
  return getOrSetCache(cacheKey, () =>
    groupRepo.listGroups(companyId, clinicId)
  );
}

export async function createGroup(
  companyId: string,
  clinicId: string,
  data: any,
  uid: string
) {
  if (!validId(companyId) || !validId(clinicId))
    throw createError(400, "Invalid company or clinic id");
  const doc = {
    companyId: new Types.ObjectId(companyId),
    clinicId: new Types.ObjectId(clinicId),
    name: data.name,
    note: data.note,
    credit: typeof data.credit === "number" ? data.credit : 0,
    maxSize: data.maxSize ?? 0,
    status: data.status ?? "active",
    patients: (Array.isArray(data.patients) ? data.patients : []).map(
      (id: string) => new Types.ObjectId(id)
    ),
    employees: (Array.isArray(data.employees) ? data.employees : []).map(
      (id: string) => new Types.ObjectId(id)
    ),
    groupType: data.groupType,
    appointments: [],
    createdBy: uid,
    customFields: data.customFields ?? {},
  };
  const group = await groupRepo.createGroup(doc);
  if (doc.patients.length) {
    await patientRepo.addGroupToPatients(
      doc.patients.map((o: Types.ObjectId) => o.toString()),
      group.id.toString()
    );
  }
  await invalidateCache(`groups:${companyId}:${clinicId}`);
  return group;
}

export async function getGroup(
  companyId: string,
  clinicId: string,
  groupId: string
) {
  if (!validId(companyId) || !validId(clinicId) || !validId(groupId))
    throw createError(400, "Invalid id(s)");
  const group = await groupRepo.findGroupById(companyId, clinicId, groupId);
  if (!group) throw createError(404, "Group not found");
  return group;
}

export async function updateGroup(
  companyId: string,
  clinicId: string,
  groupId: string,
  updates: any
) {
  const updated = await groupRepo.updateGroupById(groupId, updates);
  await invalidateCache(`groups:${companyId}:${clinicId}`);
  return updated;
}
export async function deleteGroup(
  companyId: string,
  clinicId: string,
  groupId: string
) {
  await groupRepo.deleteGroupById(groupId);
  await invalidateCache(`groups:${companyId}:${clinicId}`);
}

export async function addPatientToGroup(
  companyId: string,
  clinicId: string,
  groupId: string,
  patientId: string
) {
  if (!validId(groupId) || !validId(patientId))
    throw createError(400, "Invalid groupId or patientId");
  const updatedGroup = await groupRepo.addPatientToGroup(
    companyId,
    clinicId,
    groupId,
    patientId
  );
  await patientRepo.addGroupToPatients([patientId], groupId);
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
  const updatedGroup = await groupRepo.removePatientFromGroup(
    companyId,
    clinicId,
    groupId,
    patientId
  );
  await patientRepo.removeGroupFromPatients([patientId], groupId);
  return updatedGroup;
}
