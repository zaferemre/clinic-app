// src/api/appointmentApi.ts

import { CalendarEvent } from "../types/sharedTypes";
import { API_BASE } from "../config/apiConfig";

// Fetch appointments for a company (optionally filtered by employee)
export async function getAppointments(
  idToken: string,
  companyId: string,
  employeeId?: string
): Promise<CalendarEvent[]> {
  let url = `${API_BASE}/company/${companyId}/appointments`;
  if (employeeId) url += `?employeeId=${employeeId}`;
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

// Update appointment (e.g. start/end/service/employee)
export async function updateAppointment(
  idToken: string,
  companyId: string,
  appointmentId: string,
  updates: {
    start?: string;
    end?: string;
    serviceId?: string;
    employeeEmail?: string;
  }
) {
  const res = await fetch(
    `${API_BASE}/company/${companyId}/appointments/${appointmentId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(updates),
    }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
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
