// src/api/servicesApi.ts
import { ServiceInfo } from "../types/sharedTypes";
import { request } from "./apiClient";

export function getServices(
  token: string,
  companyId: string,
  clinicId: string
): Promise<ServiceInfo[]> {
  return request<ServiceInfo[]>(
    `/company/${companyId}/clinics/${clinicId}/services`,
    { token }
  );
}

export function createService(
  token: string,
  companyId: string,
  clinicId: string,
  payload: {
    serviceName: string;
    servicePrice: number;
    serviceDuration: number;
  }
): Promise<ServiceInfo> {
  return request<ServiceInfo>(
    `/company/${companyId}/clinics/${clinicId}/services`,
    {
      method: "POST",
      token,
      body: payload,
    }
  );
}

export function updateService(
  token: string,
  companyId: string,
  clinicId: string,
  serviceId: string,
  updates: Partial<
    Pick<ServiceInfo, "serviceName" | "servicePrice" | "serviceDuration">
  >
): Promise<ServiceInfo> {
  return request<ServiceInfo>(
    `/company/${companyId}/clinics/${clinicId}/services/${serviceId}`,
    {
      method: "PATCH",
      token,
      body: updates,
    }
  );
}

export function deleteService(
  token: string,
  companyId: string,
  clinicId: string,
  serviceId: string
): Promise<void> {
  return request(
    `/company/${companyId}/clinics/${clinicId}/services/${serviceId}`,
    { method: "DELETE", token }
  );
}
