// src/api/patientApi.ts

import { Patient } from "../types/sharedTypes";
import { API_BASE } from "../config/apiConfig";

export async function getPatients(
  idToken: string,
  companyId: string
): Promise<Patient[]> {
  const res = await fetch(`${API_BASE}/company/${companyId}/patients`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createPatient(
  idToken: string,
  companyId: string,
  payload: Omit<Patient, "_id">
): Promise<Patient> {
  const res = await fetch(`${API_BASE}/company/${companyId}/patients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updatePatientField(
  idToken: string,
  companyId: string,
  patientId: string,
  updates: Partial<{
    credit: number;
    name: string;
    age: number;
    phone: string;
    note: string;
  }>
): Promise<Patient> {
  const res = await fetch(
    `${API_BASE}/company/${companyId}/patients/${patientId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(updates),
    }
  );
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to update patient");
  }
  return res.json();
}

export async function deletePatient(
  idToken: string,
  companyId: string,
  patientId: string
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/company/${companyId}/patients/${patientId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    }
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Hasta silinemedi.");
  }
}

export async function recordPayment(
  idToken: string,
  companyId: string,
  patientId: string,
  method: "Havale" | "Card" | "Cash"
): Promise<Patient> {
  const res = await fetch(
    `${API_BASE}/company/${companyId}/patients/${patientId}/payment`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ method }),
    }
  );
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to record payment");
  }
  return res.json();
}

export async function getPatientById(
  idToken: string,
  companyId: string,
  patientId: string
): Promise<Patient> {
  const res = await fetch(
    `${API_BASE}/company/${companyId}/patients/${patientId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Hasta bilgisi alınamadı.");
  }
  return res.json();
}
