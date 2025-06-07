import { IMessage } from "../types/sharedTypes";
import { API_BASE } from "../config/apiConfig";
export async function getMessages(
  idToken: string,
  companyId: string
): Promise<IMessage[]> {
  const res = await fetch(`${API_BASE}/company/${companyId}/messages`, {
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Could not fetch messages.");
  return res.json();
}
export const scheduleAutoRemind = async (
  token: string,
  companyId: string,
  payload: { offsetHours: number }
) => {
  const res = await fetch(
    `${API_BASE}/company/${companyId}/messages/auto-remind`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error || "Otomatik hatırlatma kurulamadı");
  }
  return res.json();
};

export async function schedulePatientMessage(
  idToken: string,
  companyId: string,
  patientId: string,
  body: { text: string; scheduledFor: string }
): Promise<IMessage> {
  const res = await fetch(
    `${API_BASE}/company/${companyId}/messages/patient/${patientId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to schedule message");
  }
  return res.json();
}

export async function scheduleBulkMessage(
  idToken: string,
  companyId: string,
  body: { text: string; scheduledFor: string }
): Promise<IMessage> {
  const res = await fetch(`${API_BASE}/company/${companyId}/messages/bulk`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to schedule bulk message");
  }
  return res.json();
}
