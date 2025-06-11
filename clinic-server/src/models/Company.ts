// src/models/Company.ts

import mongoose, { Document, Schema } from "mongoose";
// ✂️ Only import the named schema, NOT the default export:
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
  services?: mongoose.Types.ObjectId[]; // references Service._id
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
    // This is an array of ObjectId refs—not the model itself
    services: [{ type: Schema.Types.ObjectId, ref: "Service" }],
    workingHours: { type: [workingHourSchema], default: [] },
  },
  { _id: true }
);

export interface ICompany extends Document {
  name: string;
  ownerName: string;
  ownerEmail: string;
  companyType: string;
  workingHours: WorkingHour[];
  services: IService[]; // embedded subdocs via ServiceSchema
  employees: EmployeeInfo[]; // embedded employeeSchema
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true },
    ownerName: { type: String, required: true },
    ownerEmail: { type: String, required: true, index: true },
    companyType: { type: String, required: true },
    workingHours: { type: [workingHourSchema], default: [] },
    // ✅ embed the **schema** here, not the model
    services: { type: [ServiceSchema], default: [] },
    employees: { type: [employeeSchema], default: [] },
  },
  { timestamps: true }
);

// If you have geo fields:
//
// CompanySchema.index({ location: "2dsphere" });

export default mongoose.models.Company ||
  mongoose.model<ICompany>("Company", CompanySchema);
