// src/api/selfRegisterApi.ts

import { request } from "./apiClient";

export function selfRegisterPatient(
  companyId: string,
  clinicId: string,
  token: string,
  payload: {
    name: string;
    phone: string;
    email?: string;
    kvkkAccepted: boolean;
    clinicKvkkAccepted?: boolean;
  }
): Promise<{ ok: boolean; patientId: string }> {
  return request(`/self-register/${companyId}/${clinicId}/${token}`, {
    method: "POST",
    body: payload,
  });
}
