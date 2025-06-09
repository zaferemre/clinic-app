// src/api/appointmentApi.ts

import { CalendarEvent } from "../types/sharedTypes";
import { API_BASE } from "../config/apiConfig";

// Fetch appointments for a company (optionally filtered by employee and service)
export async function getAppointments(
  idToken: string,
  companyId: string,
  employeeId?: string,
  serviceId?: string,
  serviceName?: string
): Promise<CalendarEvent[]> {
  let url = `${API_BASE}/company/${companyId}/appointments`;
  const params: string[] = [];
  if (employeeId) params.push(`employeeId=${encodeURIComponent(employeeId)}`);
  if (serviceId) params.push(`serviceId=${encodeURIComponent(serviceId)}`);
  if (serviceName)
    params.push(`serviceName=${encodeURIComponent(serviceName)}`);
  if (params.length > 0) url += `?${params.join("&")}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Create a new appointment
export async function createAppointment(
  idToken: string,
  companyId: string,
  patientId: string,
  employeeEmail: string,
  serviceId: string,
  start: string,
  end: string
) {
  const res = await fetch(`${API_BASE}/company/${companyId}/appointments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ patientId, employeeEmail, serviceId, start, end }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Delete appointment
export async function deleteAppointment(
  idToken: string,
  companyId: string,
  appointmentId: string
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/company/${companyId}/appointments/${appointmentId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    }
  );
  if (!res.ok) throw new Error(await res.text());
}

export async function updateAppointment(
  token: string,
  companyId: string,
  appointmentId: string,
  start: string,
  end: string
) {
  const url = `${API_BASE}/company/${companyId}/appointments/${appointmentId}`;
  console.log("PATCH ➔", url, { start, end });
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ start, end }),
  });
  console.log("PATCH ◀", res.status, await res.text());
  if (!res.ok) throw new Error(`Update failed (${res.status})`);
  return await res.json();
}

// Get appointments for a specific patient
export async function getPatientAppointments(
  idToken: string,
  companyId: string,
  patientId: string
): Promise<
  {
    id: string;
    start: string;
    end: string;
    status: string;
    employeeEmail: string;
  }[]
> {
  const res = await fetch(
    `${API_BASE}/company/${companyId}/patients/${patientId}/appointments`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    }
  );
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to fetch patient appointments");
  }
  return res.json();
}
