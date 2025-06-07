// src/api/companyApi.ts

import {
  Company,
  EmployeeInfo,
  WorkingHour,
  ServiceInfo,
} from "../types/sharedTypes";

import { API_BASE } from "../config/apiConfig";
// ──────────────── Company APIs ────────────────

// Fetch company by current user's email
export async function getCompanyByEmail(idToken: string): Promise<Company> {
  const res = await fetch(`${API_BASE}/company`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Fetch company by ID
export async function getCompanyById(
  idToken: string,
  companyId: string
): Promise<Company> {
  const res = await fetch(`${API_BASE}/company/${companyId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Create new company
export async function createCompany(
  idToken: string,
  payload: Partial<
    Omit<
      Company,
      "_id" | "ownerEmail" | "ownerName" | "createdAt" | "updatedAt"
    >
  >
): Promise<Company> {
  const res = await fetch(`${API_BASE}/company`, {
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

// Update company
export async function updateCompany(
  idToken: string,
  updates: Partial<
    Omit<
      Company,
      "_id" | "ownerEmail" | "ownerName" | "createdAt" | "updatedAt"
    >
  >
): Promise<Company> {
  const res = await fetch(`${API_BASE}/company`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ──────────────── Employee APIs ────────────────

// Add employee
export async function addEmployee(
  idToken: string,
  payload: Omit<EmployeeInfo, "_id">
): Promise<EmployeeInfo> {
  const res = await fetch(`${API_BASE}/company/employees`, {
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

// List all employees
export async function getEmployees(
  idToken: string,
  companyId: string
): Promise<EmployeeInfo[]> {
  const res = await fetch(`${API_BASE}/company/${companyId}/employees`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Update employee
export async function updateEmployee(
  idToken: string,
  employeeId: string,
  updates: Partial<EmployeeInfo>
): Promise<EmployeeInfo> {
  const res = await fetch(`${API_BASE}/company/employees/${employeeId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Remove employee
export async function removeEmployee(
  idToken: string,
  employeeId: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/company/employees/${employeeId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
  });
  if (!res.ok) throw new Error(await res.text());
}

// ──────────────── Working Hours APIs ────────────────
// Update working hours
export async function updateWorkingHours(
  idToken: string,
  workingHours: WorkingHour[]
): Promise<WorkingHour[]> {
  const res = await fetch(`${API_BASE}/company/working-hours`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ workingHours }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// (If you want specific endpoints for updating working hours, add here)

// ──────────────── Service APIs ────────────────
// Update services
export async function updateServices(
  idToken: string,
  services: ServiceInfo[]
): Promise<ServiceInfo[]> {
  const res = await fetch(`${API_BASE}/company/services`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ services }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
// (If you want to add/edit/remove services, add here. Pattern is identical.)
