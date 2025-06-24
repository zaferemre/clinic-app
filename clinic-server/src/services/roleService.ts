import * as roleRepo from "../dataAccess/roleRepository";
import { Types } from "mongoose";

export async function listRoles(companyId: string, clinicId: string) {
  return roleRepo.listRoles(companyId, clinicId);
}

export async function addRole(companyId: string, clinicId: string, data: any) {
  const doc = {
    companyId: new Types.ObjectId(companyId),
    clinicId: new Types.ObjectId(clinicId),
    name: data.name,
    isDefault: false,
    createdBy: data.createdBy ?? undefined,
  };
  return roleRepo.createRole(doc);
}

export async function updateRole(
  companyId: string,
  clinicId: string,
  roleId: string,
  updates: any
) {
  return roleRepo.updateRoleById(roleId, updates);
}

export async function deleteRole(
  companyId: string,
  clinicId: string,
  roleId: string
) {
  return roleRepo.deleteRoleById(roleId);
}
