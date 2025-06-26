// src/types/sharedTypes.ts

// ─── CLINIC ────────────────────────────────────────────────────────────────
export interface Clinic {
  _id: string;
  name: string;
  address?: {
    province: string;
    district: string;
    town: string;
    neighborhood: string;
  };
  companyId: string;
  workingHours: WorkingHour[];
  phoneNumber?: string;
  websiteUrl?: string;
  services: ServiceInfo[];
  employees: EmployeeInfo[];
  createdAt: string;
  updatedAt: string;
}

// ─── COMPANY ───────────────────────────────────────────────────────────────
export interface Company {
  _id: string;
  name: string;
  ownerUserId: string;
  companyType: string;
  address?: {
    province: string;
    district: string;
    town: string;
    neighborhood: string;
  };
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
  };
  phoneNumber?: string;
  googleUrl?: string;
  websiteUrl?: string;
  companyImgUrl?: string;
  location?: { type: "Point"; coordinates: [number, number] };
  clinics: Clinic[];
  workingHours: WorkingHour[];
  services: ServiceInfo[];
  employees: EmployeeInfo[];
  roles: string[];
  joinCode: string;
  isPaid?: boolean;
  subscription: {
    plan: "free" | "basic" | "pro" | "enterprise";
    status: "active" | "trialing" | "canceled";
    provider: "iyzico" | "manual" | "other";
    nextBillingDate?: string;
    allowedFeatures: string[];
    maxClinics: number;
  };
  settings?: {
    allowPublicBooking?: boolean;
    inactivityThresholdDays?: number;
    [key: string]: unknown;
  };
  createdAt: string;
  updatedAt: string;
}

// ─── SERVICE ────────────────────────────────────────────────────────────────
export interface ServiceInfo {
  _id?: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  companyId?: string;
  clinicId?: string;
}

// ─── WORKING HOUR ──────────────────────────────────────────────────────────
export interface WorkingHour {
  day:
    | "Pazartesi"
    | "Salı"
    | "Çarşamba"
    | "Perşembe"
    | "Cuma"
    | "Cumartesi"
    | "Pazar";
  open: string;
  close: string;
}

// ─── EMPLOYEE ───────────────────────────────────────────────────────────────
export interface EmployeeInfo {
  userId: string; // Firebase UID, used everywhere
  name?: string;
  pictureUrl?: string;
  role?: string | string[];
  services?: string[];
  workingHours?: WorkingHour[];
  companyId?: string;
  clinicId?: string;
}

// ─── PATIENT ────────────────────────────────────────────────────────────────
export interface Patient {
  status: string;
  createdAt: string;
  _id: string;
  companyId: string;
  clinicId: string;
  name: string;
  age?: number;
  phone?: string;
  credit: number;
  services: { name: string; pointsLeft?: number; sessionsTaken?: number }[];
  paymentHistory: {
    date: string;
    method: "Havale" | "Card" | "Cash" | "Unpaid";
    amount: number;
    note?: string;
  }[];
  note?: string;
}

// ─── GROUP ──────────────────────────────────────────────────────────────────
export interface Group {
  _id: string;
  companyId: string;
  clinicId: string;
  name: string;
  patients: string[];
  employees: string[];
  size: number;
  maxSize: number;
  note?: string;
  credit: number;
  status: "active" | "inactive" | string;
  groupType: string;
  appointments: Appointment[];
  createdBy: string;
  customFields?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ─── APPOINTMENT ────────────────────────────────────────────────────────────
export interface Appointment {
  _id: string;
  id?: string; // alias for _id for calendar compatibility
  patientId?: string;
  groupId?: string;
  employeeId: string;
  serviceId?: string;
  clinicId: string;
  start: string;
  end: string;
  appointmentType: "individual" | "group";
  status: "scheduled" | "done" | "cancelled" | "no-show";
  [key: string]: any;
}

export type CalendarEvent = Appointment;

export interface EnrichedAppointment extends Appointment {
  patientName?: string;
  employeeName?: string;
  serviceName?: string;
  groupName?: string;
  color?: string;
}

// ─── NOTIFICATION ───────────────────────────────────────────────────────────
// ─── NOTIFICATION ───────────────────────────────────────────────────────────
export interface NotificationInfo {
  id: string;
  _id?: string;
  companyId: string;
  clinicId: string;
  patientId?: string;
  groupId?: string;
  type: "call" | "sms" | "email" | "whatsapp" | "system";
  status: "pending" | "sent" | "failed" | "done";
  message: string;
  title?: string;
  trigger?: string;
  workerUid?: string;
  targetUserId?: string;
  note?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
  priority?: "low" | "normal" | "high";
  meta?: any;
  patientName?: string; // for UI use
}

// ─── MESSAGE ────────────────────────────────────────────────────────────────
export interface IMessage {
  _id: string;
  companyId: string;
  clinicId?: string;
  patientId?: string;
  text: string;
  scheduledFor: string;
  sent: boolean;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── PATIENT SETTINGS ───────────────────────────────────────────────────────
export interface PatientSettings {
  showCredit: boolean;
  showPaymentStatus: boolean;
  showServicesReceived: boolean;
  showServicePointBalance: boolean;
  showNotes: boolean;
}

export type CreateClinicPayload = {
  name: string;
  address: {
    province: string;
    district: string;
    town?: string;
    neighborhood?: string;
  };
  phoneNumber: string;
  location: { type: "Point"; coordinates: number[] };
  workingHours: WorkingHour[];
  services: string[];
};

// ─── ROLE ────────────────────────────────────────────────────────────────
export interface Role {
  _id: string;
  name: string;
  createdBy: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── CARD TYPES FOR TODAY ─────────────────────────────────────────────────────
export interface CardEmployee {
  userId: string; // Firebase UID
  name: string;
  avatarUrl?: string;
  role?: string;
}

export interface CardAppointment {
  id: string;
  employeeId: string;
  employee: CardEmployee; // required
  groupName?: string;
  patientName?: string;
  serviceName?: string;
  serviceDuration?: number;
  start: string;
  end: string;
  status: string;
  extendedProps?: {
    patientId?: string;
    serviceId?: string;
    employeeId?: string;
  };
}
// ─── USER ────────────────────────────────────────────────────────────────
export interface UserMembership {
  companyId: string;
  companyName: string;
  clinicId?: string;
  clinicName?: string;
  roles: string[]; // Role IDs or names
}

export interface UserPreferences {
  theme?: "light" | "dark";
  language?: string;
  notificationsEnabled?: boolean;
  [key: string]: unknown;
}

export interface User {
  uid: string; // Firebase UID
  email: string;
  phoneNumber?: string;

  photoUrl?: string;
  // App profile fields:
  name: string;
  memberships: UserMembership[]; // All company/clinic memberships
  preferences?: UserPreferences;
  createdAt: string;
  updatedAt: string;
  // Add anything else you track per-user
}
