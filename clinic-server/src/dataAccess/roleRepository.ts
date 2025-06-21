import Role, { RoleDocument } from "../models/Role";
import { Types } from "mongoose";

export function listRoles(
  companyId: string,
  clinicId: string
): Promise<RoleDocument[]> {
  return Role.find({
    companyId: new Types.ObjectId(companyId),
    clinicId: new Types.ObjectId(clinicId),
  }).exec();
}

export function createRole(doc: {
  companyId: Types.ObjectId;
  clinicId: Types.ObjectId;
  name: string;
  createdBy?: Types.ObjectId;
  isDefault?: boolean;
}): Promise<RoleDocument> {
  return new Role(doc).save();
}

export function updateRoleById(
  roleId: string,
  updates: Partial<Pick<RoleDocument, "name" | "isDefault">>
): Promise<RoleDocument | null> {
  return Role.findByIdAndUpdate(roleId, updates, { new: true }).exec();
}

export function deleteRoleById(roleId: string): Promise<RoleDocument | null> {
  return Role.findByIdAndDelete(roleId).exec();
}
