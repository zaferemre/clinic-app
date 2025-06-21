// services/serviceService.ts
import * as repoSvc from "../dataAccess/serviceRepository";
import { Types } from "mongoose";
import createError from "http-errors";

export async function listServices(companyId: string, clinicId: string) {
  return repoSvc.listServices(companyId, clinicId);
}

export async function createService(
  companyId: string,
  clinicId: string,
  data: any
) {
  const doc = {
    companyId: new Types.ObjectId(companyId),
    clinicId: new Types.ObjectId(clinicId),
    ...data,
  };
  return repoSvc.createService(doc);
}

export async function updateService(
  companyId: string,
  clinicId: string,
  serviceId: string,
  updates: any
) {
  return repoSvc.updateServiceById(serviceId, updates);
}

export async function deleteService(
  companyId: string,
  clinicId: string,
  serviceId: string
) {
  return repoSvc.deleteServiceById(serviceId);
}
