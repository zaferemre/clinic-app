// src/dataAccess/groupRepository.ts
import Group, { GroupDocument } from "../models/Group";
import { Types } from "mongoose";

export async function listGroups(
  companyId: string,
  clinicId: string
): Promise<GroupDocument[]> {
  return Group.find({
    companyId: new Types.ObjectId(companyId),
    clinicId: new Types.ObjectId(clinicId),
  }).exec();
}

export async function createGroup(
  doc: Partial<GroupDocument>
): Promise<GroupDocument> {
  return Group.create(doc);
}

export async function findGroupById(
  companyId: string,
  clinicId: string,
  groupId: string
): Promise<GroupDocument | null> {
  return Group.findOne({
    _id: groupId,
    companyId: new Types.ObjectId(companyId),
    clinicId: new Types.ObjectId(clinicId),
  }).exec();
}

export async function updateGroupById(
  groupId: string,
  updates: Partial<GroupDocument>
): Promise<GroupDocument | null> {
  return Group.findByIdAndUpdate(groupId, updates, { new: true }).exec();
}

export async function deleteGroupById(groupId: string): Promise<void> {
  await Group.findByIdAndDelete(groupId).exec();
}

export async function addPatientToGroup(
  companyId: string,
  clinicId: string,
  groupId: string,
  patientId: string
): Promise<GroupDocument | null> {
  return Group.findOneAndUpdate(
    {
      _id: groupId,
      companyId: new Types.ObjectId(companyId),
      clinicId: new Types.ObjectId(clinicId),
    },
    { $addToSet: { patients: new Types.ObjectId(patientId) } },
    { new: true }
  ).exec();
}

export async function removePatientFromGroup(
  companyId: string,
  clinicId: string,
  groupId: string,
  patientId: string
): Promise<GroupDocument | null> {
  return Group.findOneAndUpdate(
    {
      _id: groupId,
      companyId: new Types.ObjectId(companyId),
      clinicId: new Types.ObjectId(clinicId),
    },
    { $pull: { patients: new Types.ObjectId(patientId) } },
    { new: true }
  ).exec();
}
