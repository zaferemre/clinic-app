// src/api/companyApi.ts

import {
  Company,
  EmployeeInfo,
  WorkingHour,
  ServiceInfo,
} from "../types/sharedTypes";
import { API_BASE } from "../config/apiConfig";

// ──────────────── Company APIs ────────────────

/**
 * Fetch the company associated with the current user's email
 */
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

/**
 * Fetch a company by its ID
 */
export async function getCompanyById(
  idToken: string,
  companyId: string
): Promise<Company> {
  const res = await fetch(`${API_BASE}/company/${companyId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/**
 * Create a new company (only if the user has none)
 */
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

/**
 * Update top-level company fields (owner-only)
 */
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

/**
 * Add or update an employee in a company
 */
export async function addEmployee(
  idToken: string,
  companyId: string,
  payload: Omit<EmployeeInfo, "_id">
): Promise<EmployeeInfo> {
  const res = await fetch(`${API_BASE}/company/${companyId}/employees`, {
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

/**
 * List all employees of a company
 */
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

// ──────────────── Working Hours APIs ────────────────

/**
 * Update working hours for a company (owner-only)
 */
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

// ──────────────── Service APIs ────────────────

/**
 * Update service offerings for a company (owner-only)
 */
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

// ──────────────── Image Upload API ────────────────

/**
 * Upload a company image
 */
export async function uploadImage(
  idToken: string,
  file: File
): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_BASE}/company/upload-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
    body: formData,
  });

  if (!res.ok) throw new Error("Image upload failed");
  const data = await res.json();
  return data.imageUrl;
}
