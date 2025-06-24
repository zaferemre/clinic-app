import * as serviceRepo from "../dataAccess/serviceRepository";
import { Types } from "mongoose";
import createError from "http-errors";

// List services for a company and clinic
export async function listServices(companyId: string, clinicId: string) {
  if (!Types.ObjectId.isValid(companyId) || !Types.ObjectId.isValid(clinicId))
    throw createError(400, "Invalid companyId or clinicId");
  return serviceRepo.listServices(companyId, clinicId);
}

// Create new service
export async function createService(
  companyId: string,
  clinicId: string,
  data: any
) {
  if (!Types.ObjectId.isValid(companyId) || !Types.ObjectId.isValid(clinicId))
    throw createError(400, "Invalid companyId or clinicId");
  const doc = {
    companyId: new Types.ObjectId(companyId),
    clinicId: new Types.ObjectId(clinicId),
    ...data,
  };
  return serviceRepo.createService(doc);
}

// Update a service
export async function updateService(
  companyId: string,
  clinicId: string,
  serviceId: string,
  updates: any
) {
  if (
    !Types.ObjectId.isValid(companyId) ||
    !Types.ObjectId.isValid(clinicId) ||
    !Types.ObjectId.isValid(serviceId)
  )
    throw createError(400, "Invalid ObjectId(s)");
  return serviceRepo.updateServiceById(serviceId, updates);
}

// Delete a service
export async function deleteService(
  companyId: string,
  clinicId: string,
  serviceId: string
) {
  if (
    !Types.ObjectId.isValid(companyId) ||
    !Types.ObjectId.isValid(clinicId) ||
    !Types.ObjectId.isValid(serviceId)
  )
    throw createError(400, "Invalid ObjectId(s)");
  return serviceRepo.deleteServiceById(serviceId);
}
