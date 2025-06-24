import Group, { GroupDocument } from "../models/Group";
import { Types } from "mongoose";

export async function listGroups(companyId: string, clinicId: string) {
  return Group.find({
    companyId: new Types.ObjectId(companyId),
    clinicId: new Types.ObjectId(clinicId),
  }).exec();
}
export async function createGroup(doc: Partial<GroupDocument>) {
  return Group.create(doc);
}
export async function findGroupById(
  companyId: string,
  clinicId: string,
  groupId: string
) {
  return Group.findOne({
    _id: new Types.ObjectId(groupId),
    companyId: new Types.ObjectId(companyId),
    clinicId: new Types.ObjectId(clinicId),
  }).exec();
}
export async function updateGroupById(
  groupId: string,
  updates: Partial<GroupDocument>
) {
  return Group.findByIdAndUpdate(new Types.ObjectId(groupId), updates, {
    new: true,
  }).exec();
}
export async function deleteGroupById(groupId: string) {
  return Group.findByIdAndDelete(new Types.ObjectId(groupId)).exec();
}
export async function addPatientToGroup(
  companyId: string,
  clinicId: string,
  groupId: string,
  patientId: string
) {
  return Group.findOneAndUpdate(
    {
      _id: new Types.ObjectId(groupId),
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
) {
  return Group.findOneAndUpdate(
    {
      _id: new Types.ObjectId(groupId),
      companyId: new Types.ObjectId(companyId),
      clinicId: new Types.ObjectId(clinicId),
    },
    { $pull: { patients: new Types.ObjectId(patientId) } },
    { new: true }
  ).exec();
}
