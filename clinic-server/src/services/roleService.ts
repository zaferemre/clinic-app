import * as repoRole from "../dataAccess/roleRepository";
import { Types } from "mongoose";

export async function listRoles(companyId: string, clinicId: string) {
  return repoRole.listRoles(companyId, clinicId);
}

export async function addRole(
  companyId: string,
  clinicId: string,
  data: { name: string; createdBy?: string }
) {
  const doc = {
    companyId: new Types.ObjectId(companyId),
    clinicId: new Types.ObjectId(clinicId),
    name: data.name,
    createdBy: data.createdBy ? new Types.ObjectId(data.createdBy) : undefined,
    isDefault: false,
  };
  return repoRole.createRole(doc);
}

export async function updateRole(
  companyId: string,
  clinicId: string,
  roleId: string,
  updates: { name?: string }
) {
  // Optional: verify role belongs to this company+clinic before updating
  return repoRole.updateRoleById(roleId, updates);
}

export async function deleteRole(
  companyId: string,
  clinicId: string,
  roleId: string
) {
  // Optional: verify role belongs to this company+clinic before deleting
  return repoRole.deleteRoleById(roleId);
}
