// src/api/notificationApi.ts

import { NotificationInfo } from "../types/sharedTypes";
import { API_BASE } from "../config/apiConfig";

export async function getNotifications(
  idToken: string,
  companyId: string
): Promise<NotificationInfo[]> {
  const res = await fetch(`${API_BASE}/company/${companyId}/notifications`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function markNotificationCalled(
  idToken: string,
  companyId: string,
  notificationId: string
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/company/${companyId}/notifications/${notificationId}/mark-called`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    }
  );
  if (!res.ok) throw new Error(await res.text());
}

export async function flagPatientCall(
  idToken: string,
  companyId: string,
  patientId: string
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/company/${companyId}/patients/${patientId}/flag-call`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    }
  );
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to flag patient for call");
  }
}

export async function markPatientCalled(
  idToken: string,
  companyId: string,
  notificationId: string
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/company/${companyId}/notifications/${notificationId}/mark-called`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    }
  );
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to mark notification as called");
  }
}
