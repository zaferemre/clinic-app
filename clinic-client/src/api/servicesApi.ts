import { API_BASE } from "../config/apiConfig";

export interface Service {
  _id: string;
  serviceName: string;
  servicePrice: number;
  serviceKapora: number;
  serviceDuration: number;
}

export const getServices = async (
  idToken: string,
  companyId: string
): Promise<Service[]> => {
  const res = await fetch(`${API_BASE}/company/${companyId}/services`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
};

export const createService = async (
  idToken: string,
  companyId: string,
  serviceName: string,
  servicePrice: number,
  serviceKapora: number,
  serviceDuration: number
): Promise<Service> => {
  const res = await fetch(`${API_BASE}/company/${companyId}/services`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      serviceName,
      servicePrice,
      serviceKapora,
      serviceDuration,
    }),
  });
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
};

export const updateService = async (
  idToken: string,
  companyId: string,
  serviceId: string,
  updates: {
    serviceName?: string;
    servicePrice?: number;
    serviceKapora?: number;
    serviceDuration?: number;
  }
): Promise<Service> => {
  const res = await fetch(
    `${API_BASE}/company/${companyId}/services/${serviceId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(updates),
    }
  );
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
};

export const deleteService = async (
  idToken: string,
  companyId: string,
  serviceId: string
): Promise<void> => {
  const res = await fetch(
    `${API_BASE}/company/${companyId}/services/${serviceId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${idToken}` },
    }
  );
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
};
