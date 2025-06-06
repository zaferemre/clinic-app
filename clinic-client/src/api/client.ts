// src/api/client.ts

const API_BASE = import.meta.env.VITE_RAILWAY_LINK || "http://localhost:3001"; // Use VITE_API_BASE from .env or fallback to localhost

export type PatientDetail = {
  _id: string;
  name: string;
  age?: number;
  phone?: string;
  credit: number;
  balanceDue: number;
  services: {
    name: string;
    pointsLeft?: number;
    sessionsTaken?: number;
  }[];
  paymentHistory: {
    date: string;
    method: "Havale" | "Card" | "Cash" | "Unpaid";
    amount: number;
    note?: string;
  }[];
  note?: string;
};

export interface Clinic {
  _id: string;
  name: string;
  ownerEmail: string;
  workers: {
    email: string;
    name?: string;
    role?: string;
  }[];
}

export interface IMessage {
  _id: string;
  clinicId: string;
  patientId?: string;
  text: string;
  scheduledFor: string; // ISO
  sent: boolean;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  _id: string;
  name: string;
  age?: number;
  phone?: string;
  credit: number;
  services: {
    name: string;
    pointsLeft?: number;
    sessionsTaken?: number;
  }[];
  paymentHistory: {
    date: string;
    method: "Havale" | "Card" | "Cash" | "Unpaid";
    amount: number;
    note?: string;
  }[];
  note?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  color?: string;
  workerEmail?: string;
}

export interface WorkerInfo {
  _id: string;
  email: string;
  name?: string;
  role?: string;
}

export interface NotificationInfo {
  id: string;
  patientId: { _id: string; name: string };
  patientName: string;
  createdAt: string;
  isCalled: boolean;
}

// ───────────────────────────────────────────
//  Clinic APIs
// ───────────────────────────────────────────

// src/api/client.ts
export async function getClinicByEmail(idToken: string): Promise<Clinic> {
  const res = await fetch(`${API_BASE}/clinic/by-email`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`, // ← must supply the Firebase ID token here
    },
  });
  if (res.status === 404) {
    throw new Error("No clinic found for this user.");
  }
  if (res.status === 401) {
    throw new Error("Not authenticated. Invalid or missing token.");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Unknown error when fetching clinic.");
  }
  return res.json();
}

export async function getClinicById(
  idToken: string,
  clinicId: string
): Promise<Clinic> {
  const res = await fetch(`${API_BASE}/clinic/${clinicId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch clinic details");
  return res.json();
}

export async function getPatientById(
  idToken: string,
  clinicId: string,
  patientId: string
): Promise<PatientDetail> {
  const res = await fetch(
    `${API_BASE}/clinic/${clinicId}/patients/${patientId}`,
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

export async function createClinic(
  idToken: string,
  name: string
): Promise<Clinic> {
  const res = await fetch(`${API_BASE}/clinic/new`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ name }),
  });
  if (res.status === 409) {
    const data = await res.json();
    return data.clinic as Clinic;
  }
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Unknown error");
  }
  return res.json();
}

export async function getMessages(
  idToken: string,
  clinicId: string
): Promise<IMessage[]> {
  const res = await fetch(`${API_BASE}/clinic/${clinicId}/messages`, {
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Could not fetch messages.");
  return res.json();
}

export async function deletePatient(
  idToken: string,
  clinicId: string,
  patientId: string
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/clinic/${clinicId}/patients/${patientId}`,
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

export async function markUnpaid(
  idToken: string,
  clinicId: string,
  patientId: string
): Promise<Patient> {
  const res = await fetch(
    `${API_BASE}/clinic/${clinicId}/patients/${patientId}/unpaid`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    }
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Unpaid işlemi başarısız.");
  }
  return res.json();
}

export const scheduleAutoRemind = async (
  token: string,
  clinicId: string,
  payload: { offsetHours: number }
) => {
  const res = await fetch(
    `${API_BASE}/clinic/${clinicId}/messages/auto-remind`,
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
  clinicId: string,
  patientId: string,
  body: { text: string; scheduledFor: string }
): Promise<IMessage> {
  const res = await fetch(
    `${API_BASE}/clinic/${clinicId}/messages/patient/${patientId}`,
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
  clinicId: string,
  body: { text: string; scheduledFor: string }
): Promise<IMessage> {
  const res = await fetch(`${API_BASE}/clinic/${clinicId}/messages/bulk`, {
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

export async function addWorker(
  idToken: string,
  clinicId: string,
  payload: { email: string; name?: string; role?: string }
): Promise<WorkerInfo> {
  const res = await fetch(`${API_BASE}/clinic/${clinicId}/workers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to add worker");
  }
  return res.json();
}
/**
 * Fetch exactly “GET /clinic/:clinicId/workers” now that we added that endpoint.
 */
export async function getWorkers(
  idToken: string,
  clinicId: string
): Promise<
  Array<{
    email: string;
    name: string;
    pictureUrl?: string;
    role?: string;
  }>
> {
  const res = await fetch(`${API_BASE}/clinic/${clinicId}/workers`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Sunucu hatası (status ${res.status})`);
  }
  const workersArray = await res.json();
  return workersArray;
}
export async function removeWorker(
  idToken: string,
  clinicId: string,
  email: string
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/clinic/${clinicId}/workers/${encodeURIComponent(email)}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    }
  );
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to remove worker");
  }
}

export async function updateWorker(
  idToken: string,
  clinicId: string,
  email: string,
  updates: Partial<{ name: string; role: string }>
): Promise<WorkerInfo> {
  const res = await fetch(
    `${API_BASE}/clinic/${clinicId}/workers/${encodeURIComponent(email)}`,
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
    throw new Error(data.error || "Failed to update worker");
  }
  return res.json();
}

// ───────────────────────────────────────────
//  Patient APIs
// ───────────────────────────────────────────

export async function getPatients(
  idToken: string,
  clinicId: string
): Promise<Patient[]> {
  const res = await fetch(`${API_BASE}/clinic/${clinicId}/patients`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch patients");
  return res.json();
}

export async function createPatient(
  idToken: string,
  clinicId: string,
  payload: {
    name: string;
    gender: "Male" | "Female" | "Other";
    age?: number;
    phone: string;
    services: {
      name: string;
      pointsLeft?: number;
      sessionsTaken?: number;
    }[];
    paymentHistory: {
      date: string;
      method: "Havale" | "Card" | "Cash" | "Unpaid";
      amount: number;
      note: string;
    }[];
    note?: string;
  }
): Promise<Patient> {
  const res = await fetch(`${API_BASE}/clinic/${clinicId}/patients`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to create patient");
  }
  return res.json();
}

export async function updatePatientField(
  idToken: string,
  clinicId: string,
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
    `${API_BASE}/clinic/${clinicId}/patients/${patientId}`,
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

export async function recordPayment(
  idToken: string,
  clinicId: string,
  patientId: string,
  method: "Havale" | "Card" | "Cash"
): Promise<Patient> {
  const res = await fetch(
    `${API_BASE}/clinic/${clinicId}/patients/${patientId}/payment`,
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

export async function getPatientAppointments(
  idToken: string,
  clinicId: string,
  patientId: string
): Promise<
  {
    id: string;
    start: string;
    end: string;
    status: string;
    workerEmail: string;
  }[]
> {
  const res = await fetch(
    `${API_BASE}/clinic/${clinicId}/patients/${patientId}/appointments`,
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

// ───────────────────────────────────────────
//  Notification APIs
// ───────────────────────────────────────────

export async function getNotifications(
  token: string,
  clinicId: string
): Promise<NotificationInfo[]> {
  const res = await fetch(`${API_BASE}/clinic/${clinicId}/notifications`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error || "Bildirimler alınamadı");
  }
  const data = (await res.json()) as NotificationInfo[];
  return data;
}

export async function flagPatientCall(
  idToken: string,
  clinicId: string,
  patientId: string
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/clinic/${clinicId}/patients/${patientId}/flag-call`,
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
  clinicId: string,
  notificationId: string
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/clinic/${clinicId}/notifications/${notificationId}/mark-called`,
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

// ───────────────────────────────────────────
//  Appointment APIs
// ───────────────────────────────────────────

export async function getAppointments(
  idToken: string,
  clinicId: string
): Promise<CalendarEvent[]> {
  const res = await fetch(`${API_BASE}/clinic/${clinicId}/appointments`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch appointments");
  }
  return res.json();
}
export async function deleteAppointment(
  idToken: string,
  clinicId: string,
  appointmentId: string
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/clinic/${clinicId}/appointments/${appointmentId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    }
  );
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Silme hatası (status ${res.status})`);
  }
}
export async function createAppointment(
  idToken: string,
  clinicId: string,
  patientId: string,
  workerEmail: string,
  start: string,
  end: string
): Promise<any> {
  const res = await fetch(`${API_BASE}/clinic/${clinicId}/appointments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ patientId, workerEmail, start, end }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Failed to create appointment");
  }
  return res.json();
}
