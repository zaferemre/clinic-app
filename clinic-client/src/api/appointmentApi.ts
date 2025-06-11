import { CalendarEvent } from "../types/sharedTypes";
import { API_BASE } from "../config/apiConfig";

// Fetch appointments for a company (optionally filtered by employeeEmail or serviceId)
export async function getAppointments(
  idToken: string,
  companyId: string,
  employeeEmail?: string,
  serviceId?: string
): Promise<CalendarEvent[]> {
  let url = `${API_BASE}/company/${companyId}/appointments`;
  const params: string[] = [];

  if (employeeEmail)
    params.push(`employeeEmail=${encodeURIComponent(employeeEmail)}`);
  if (serviceId) params.push(`serviceId=${encodeURIComponent(serviceId)}`);

  if (params.length > 0) url += `?${params.join("&")}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to fetch appointments");
  }

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

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to create appointment");
  }

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

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to delete appointment");
  }
}

// Update appointment
export async function updateAppointment(
  idToken: string,
  companyId: string,
  appointmentId: string,
  start: string,
  end: string,
  serviceId?: string,
  employeeEmail?: string
) {
  const url = `${API_BASE}/company/${companyId}/appointments/${appointmentId}`;
  const body: any = { start, end };
  if (serviceId) body.serviceId = serviceId;
  if (employeeEmail) body.employeeEmail = employeeEmail;

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `Update failed (${res.status})`);
  }

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

export async function getAppointmentById(
  idToken: string,
  companyId: string,
  appointmentId: string
): Promise<CalendarEvent> {
  const res = await fetch(
    `${API_BASE}/company/${companyId}/appointments/${appointmentId}`,
    {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    }
  );
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
