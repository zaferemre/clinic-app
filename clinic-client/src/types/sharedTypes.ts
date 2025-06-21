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
  ownerName: string;
  ownerEmail: string;
  ownerImageUrl?: string;
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
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";
  open: string;
  close: string;
}

// ─── EMPLOYEE ───────────────────────────────────────────────────────────────
export interface EmployeeInfo {
  _id?: string;
  email: string;
  name?: string;
  role?: string;
  pictureUrl?: string;
  services?: string[];
  workingHours?: WorkingHour[];
  companyId?: string;
  clinicId?: string;
}

// ─── PATIENT ────────────────────────────────────────────────────────────────
export interface Patient {
  status: string;
  createdAt: any;
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
  id: string;
  patientId?: string;
  groupId?: string;
  employeeId: string;
  serviceId: string;
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
  employeeEmail?: string;
  serviceName?: string;
  groupName?: string;
  color?: string;
}

// ─── NOTIFICATION ───────────────────────────────────────────────────────────
export interface NotificationInfo {
  id: string;
  companyId: string;
  clinicId: string;
  patientId: string;
  patientName: string;
  createdAt: string;
  status: "pending" | "done";
  note?: string;
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
// ─── CARD TYPES FOR TODAY ─────────────────────────────────────────────────────
export interface CardEmployee {
  email: string;
  name: string;
  avatarUrl?: string;
  role?: string;
}

export interface CardAppointment {
  id: string;
  patientName?: string; // for individual appointments
  groupName?: string; // for group appointments
  serviceName: string;
  serviceDuration?: number; // in minutes
  employee: CardEmployee;
  employeeEmail: string;
  extendedProps?: {
    patientId?: string;
    serviceId?: string;
    employeeEmail?: string;
  };
  start: string; // ISO-string
  end: string; // ISO-string
  status: string; // e.g. “scheduled”, “done”
}
