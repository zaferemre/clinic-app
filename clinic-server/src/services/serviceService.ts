import * as repo from "../dataAccess/serviceRepository";

export function getServices(companyId: string) {
  return repo.findServices(companyId);
}

export function createService(companyId: string, dto: any) {
  return repo.addService(companyId, dto);
}

export function updateService(
  companyId: string,
  serviceId: string,
  updates: any
) {
  return repo.updateService(companyId, serviceId, updates);
}

export function deleteService(companyId: string, serviceId: string) {
  return repo.deleteService(companyId, serviceId);
}
