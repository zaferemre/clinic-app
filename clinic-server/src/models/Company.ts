// src/models/Company.ts

import mongoose, { Document, Schema } from "mongoose";
// 🔥 Import only the named ServiceSchema, not the default model
import { IService, ServiceSchema } from "./Service";

export interface WorkingHour {
  day:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";
  open: string; // "HH:mm"
  close: string; // "HH:mm"
}
const workingHourSchema = new Schema<WorkingHour>(
  {
    day: {
      type: String,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      required: true,
    },
    open: { type: String, required: true },
    close: { type: String, required: true },
  },
  { _id: false }
);

export interface EmployeeInfo {
  email: string;
  name?: string;
  role?: "staff" | "manager" | "admin";
  pictureUrl?: string;
  services?: mongoose.Types.ObjectId[]; // ← refs to Service._id
  workingHours?: WorkingHour[];
}
const employeeSchema = new Schema<EmployeeInfo>(
  {
    email: { type: String, required: true },
    name: { type: String },
    role: {
      type: String,
      enum: ["staff", "manager", "admin"],
      default: "staff",
    },
    pictureUrl: {
      type: String,
      default: "https://doodleipsum.com/700?i=533d71e7733d1ad05ecdc25051eed663",
    },
    // ⚠️ array of ObjectId refs, not embedding the model
    services: [{ type: Schema.Types.ObjectId, ref: "Service" }],
    workingHours: { type: [workingHourSchema], default: [] },
  },
  { _id: true }
);

export interface ICompany extends Document {
  name: string;
  ownerName: string;
  ownerEmail: string;
  ownerImageUrl?: string;
  companyType: string;
  address?: string;
  phoneNumber?: string;
  googleUrl?: string;
  websiteUrl?: string;
  companyImgUrl?: string;
  location?: { type: "Point"; coordinates: [number, number] };
  workingHours: WorkingHour[];
  // ⚠️ embedded subdocuments via ServiceSchema
  services: IService[];
  employees: EmployeeInfo[];
  isPaid?: boolean;
  subscription?: {
    status: "active" | "trialing" | "canceled";
    provider: "iyzico" | "manual" | "other";
    nextBillingDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true },
    ownerName: { type: String, required: true },
    ownerEmail: { type: String, required: true, index: true },
    ownerImageUrl: {
      type: String,
      default: "https://doodleipsum.com/700?i=533d71e7733d1ad05ecdc25051eed663",
    },
    companyType: { type: String, required: true },
    address: { type: String },
    phoneNumber: { type: String },
    googleUrl: { type: String },
    websiteUrl: { type: String },
    companyImgUrl: {
      type: String,
      default: "https://doodleipsum.com/700?i=533d71e7733d1ad05ecdc25051eed663",
    },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (arr: number[]) => arr.length === 2,
          message: "Location must be [lng, lat]",
        },
      },
    },
    workingHours: { type: [workingHourSchema], default: [] },
    // ① embed services as subdocs via ServiceSchema
    services: { type: [ServiceSchema], default: [] },
    // ② embed employees
    employees: { type: [employeeSchema], default: [] },
    isPaid: { type: Boolean, default: false },
    subscription: {
      status: {
        type: String,
        enum: ["active", "trialing", "canceled"],
        default: "canceled",
      },
      provider: {
        type: String,
        enum: ["iyzico", "manual", "other"],
        default: "manual",
      },
      nextBillingDate: { type: Date },
    },
  },
  { timestamps: true }
);

CompanySchema.index({ location: "2dsphere" });

export default mongoose.models.Company ||
  mongoose.model<ICompany>("Company", CompanySchema);
