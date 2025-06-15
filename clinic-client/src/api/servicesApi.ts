import { ServiceInfo } from "../types/sharedTypes";
import { request } from "./apiClient";

export function getServices(
  token: string,
  companyId: string
): Promise<ServiceInfo[]> {
  return request<ServiceInfo[]>(`/company/${companyId}/services`, { token });
}

export function createService(
  token: string,
  companyId: string,
  payload: Omit<ServiceInfo, "_id">
): Promise<ServiceInfo> {
  return request<ServiceInfo>(`/company/${companyId}/services`, {
    method: "POST",
    token,
    body: payload,
  });
}

export function updateService(
  token: string,
  companyId: string,
  serviceId: string,
  updates: Partial<Omit<ServiceInfo, "_id">>
): Promise<ServiceInfo> {
  return request<ServiceInfo>(`/company/${companyId}/services/${serviceId}`, {
    method: "PUT",
    token,
    body: updates,
  });
}

export function deleteService(
  token: string,
  companyId: string,
  serviceId: string
): Promise<void> {
  return request(`/company/${companyId}/services/${serviceId}`, {
    method: "DELETE",
    token,
  });
}

export type Service = ServiceInfo;
