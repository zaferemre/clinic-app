// src/api/sharedTypes.ts

export interface ServiceInfo {
  _id?: string;
  serviceName: string;
  servicePrice: number;
  serviceKapora: number; // deposit
  serviceDuration: number; // in minutes
}

export interface EmployeeInfo {
  _id?: string;
  email: string;
  name?: string;
  role?: "staff" | "manager" | "admin";
  pictureUrl?: string;
  services?: string[]; // Array of ServiceInfo._id (as string)
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

export interface Company {
  _id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  ownerImageUrl?: string;
  companyType: string;
  address?: string;
  phoneNumber?: string;
  googleUrl?: string;
  websiteUrl?: string;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
  workingHours: WorkingHour[];
  services: ServiceInfo[];
  employees: EmployeeInfo[];
  createdAt: Date;
  updatedAt: Date;
  companyImgUrl?: string; // Optional for backward compatibility
  isPaid?: boolean; // Optional for backward compatibility
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

export interface IEmployee {
  _id: string;
  email: string;
  name?: string;
  role?: string;
  pictureUrl?: string; // İleride avatar URL’si de eklemek isterseniz
  // Diğer alanlar (availability, companyId vs.) burada tanımlanabilir
  workingHours?: WorkingHour[];
  companyId?: string; // Company ID if needed
}

export interface IMessage {
  _id: string;
  companyId: string;
  patientId?: string;
  text: string;
  scheduledFor: string; // ISO
  sent: boolean;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}
