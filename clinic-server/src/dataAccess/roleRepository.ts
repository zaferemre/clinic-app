import Role, { RoleDocument } from "../models/Role";
import { Types } from "mongoose";

export async function listRoles(
  companyId: string,
  clinicId: string
): Promise<RoleDocument[]> {
  return Role.find({
    companyId: new Types.ObjectId(companyId),
    clinicId: new Types.ObjectId(clinicId),
  }).exec();
}

export async function createRole(
  doc: Partial<RoleDocument>
): Promise<RoleDocument> {
  return new Role(doc).save();
}

export async function updateRoleById(
  roleId: string,
  updates: Partial<RoleDocument>
): Promise<RoleDocument | null> {
  return Role.findByIdAndUpdate(roleId, updates, { new: true }).exec();
}

export async function deleteRoleById(
  roleId: string
): Promise<RoleDocument | null> {
  return Role.findByIdAndDelete(roleId).exec();
}
