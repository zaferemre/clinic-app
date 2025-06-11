import {
  Company,
  EmployeeInfo,
  WorkingHour,
  ServiceInfo,
} from "../types/sharedTypes";
import { API_BASE } from "../config/apiConfig";

// ──────────────── Company APIs ────────────────

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

export async function updateEmployee(
  idToken: string,
  companyId: string,
  employeeId: string,
  updates: {
    role: EmployeeInfo["role"];
    workingHours: WorkingHour[];
  }
): Promise<EmployeeInfo> {
  const res = await fetch(
    `${API_BASE}/company/${companyId}/employees/${employeeId}`,
    {
      method: "PATCH",
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

export async function removeEmployee(
  idToken: string,
  companyId: string,
  employeeId: string
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/company/${companyId}/employees/${employeeId}`,
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

// ──────────────── Working Hours API ────────────────

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

// ──────────────── Service API ────────────────

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
