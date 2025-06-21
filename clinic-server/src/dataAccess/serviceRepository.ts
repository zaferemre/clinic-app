// dataAccess/serviceRepository.ts
import Service, { ServiceDocument } from "../models/Service";
import { Types } from "mongoose";

export async function listServices(
  companyId: string,
  clinicId: string
): Promise<ServiceDocument[]> {
  return Service.find({
    companyId: new Types.ObjectId(companyId),
    clinicId: new Types.ObjectId(clinicId),
  });
}

export async function findServiceById(
  companyId: string,
  clinicId: string,
  serviceId: string
): Promise<ServiceDocument | null> {
  return Service.findOne({
    _id: new Types.ObjectId(serviceId),
    companyId: new Types.ObjectId(companyId),
    clinicId: new Types.ObjectId(clinicId),
  });
}

export async function createService(
  doc: Partial<ServiceDocument>
): Promise<ServiceDocument> {
  return Service.create(doc);
}

export async function updateServiceById(
  serviceId: string,
  updates: Partial<ServiceDocument>
): Promise<ServiceDocument | null> {
  return Service.findByIdAndUpdate(serviceId, updates, { new: true });
}

export async function deleteServiceById(serviceId: string): Promise<void> {
  await Service.findByIdAndDelete(serviceId);
}
export const findById = findServiceById;
