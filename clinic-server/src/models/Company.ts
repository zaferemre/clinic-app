import mongoose, { Document, Schema } from "mongoose";

export interface ServiceInfo {
  serviceName: string;
  servicePrice: number;
  serviceKapora: number;
  serviceDuration: number;
}

const serviceSchema = new Schema<ServiceInfo>(
  {
    serviceName: { type: String, required: true },
    servicePrice: { type: Number, required: true, min: 0 },
    serviceKapora: { type: Number, default: 0, min: 0 },
    serviceDuration: { type: Number, required: true, min: 1 },
  },
  { _id: true }
);

export interface EmployeeInfo {
  email: string;
  name?: string;
  role?: "staff" | "manager" | "admin";
  pictureUrl?: string;
  services?: mongoose.Types.ObjectId[];
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
    services: [{ type: Schema.Types.ObjectId, ref: "Company.services" }],
    workingHours: {
      type: [
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
      ],
      default: [],
    },
  },
  { _id: true }
);

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
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
  workingHours: WorkingHour[];
  services: ServiceInfo[];
  employees: EmployeeInfo[];
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
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
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
    services: { type: [serviceSchema], default: [] },
    employees: { type: [employeeSchema], default: [] },
  },
  { timestamps: true }
);

CompanySchema.index({ location: "2dsphere" });

export default mongoose.models.Company ||
  mongoose.model<ICompany>("Company", CompanySchema);
