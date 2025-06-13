// src/api/sharedTypes.ts

export interface ServiceInfo {
  _id?: string;
  serviceName: string;
  servicePrice: number;
  serviceKapora: number; // deposit
  serviceDuration: number; // in minutes
}

export interface WorkingHour {
  day:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";
  open: string; // "09:00"
  close: string; // "18:00"
}

export interface EmployeeInfo {
  _id?: string;
  email: string;
  name?: string;
  // role is now free-form string based on company-defined roles
  role?: string;
  pictureUrl?: string;
  services?: string[]; // Array of ServiceInfo._id
  workingHours?: WorkingHour[];
  companyId?: string;
}

export interface Company {
  _id: string;
  name: string;
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
  phoneNumber?: string;
  googleUrl?: string;
  websiteUrl?: string;
  companyImgUrl?: string;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
  workingHours: WorkingHour[];
  services: ServiceInfo[];
  employees: EmployeeInfo[];
  // New dynamic roles list
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
  isPaid?: boolean;
  subscription?: {
    status: "active" | "trialing" | "canceled";
    provider: "iyzico" | "manual" | "other";
    nextBillingDate?: Date;
  };
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
  patientName: string;
  employeeId: string;
  serviceId: string;
  start: string;
  end: string;
  title?: string;
  extendedProps: {
    serviceId: string;
    serviceName: string;
    employeeEmail: string;
  };
}

export interface NotificationInfo {
  id: string;
  patientId: { _id: string; name: string };
  patientName: string;
  createdAt: string;
  isCalled: boolean;
  note?: string;
}

export interface IMessage {
  _id: string;
  companyId: string;
  patientId?: string;
  text: string;
  scheduledFor: string;
  sent: boolean;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientSettings {
  showCredit: boolean;
  showPaymentStatus: boolean;
  showServicesReceived: boolean;
  showServicePointBalance: boolean;
  showNotes: boolean;
}
