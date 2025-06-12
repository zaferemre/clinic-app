import mongoose, { Document, Schema } from "mongoose";

// Re-use your existing sub-schemas (workingHourSchema, employeeSchema)
import { WorkingHour, workingHourSchema } from "./WorkingHour";
import { EmployeeInfo, employeeSchema } from "./Employee";
import { IService, ServiceSchema } from "./Service";

const AddressSchema = new Schema(
  {
    province: { type: String, required: true },
    district: { type: String, required: true },
    town: { type: String, required: true },
    neighborhood: { type: String, required: true },
  },
  { _id: false }
);

const companyServiceSchema = new Schema(
  {
    serviceName: { type: String, required: true },
    servicePrice: { type: Number, required: true, min: 0 },
    serviceKapora: { type: Number, default: 0, min: 0 },
    serviceDuration: { type: Number, required: true, min: 1 },
  },
  { _id: true }
);
export interface CompanyDoc extends Document {
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
  services: mongoose.Types.Subdocument[];
  employees: EmployeeInfo[];
  roles: string[]; // dynamically managed
  isPaid: boolean;
  subscription?: {
    status: "active" | "trialing" | "canceled";
    provider: "iyzico" | "manual" | "other";
    nextBillingDate?: Date;
  };
}

const CompanySchema = new Schema<CompanyDoc>(
  {
    name: { type: String, required: true },
    ownerName: { type: String, required: true },
    ownerEmail: { type: String, required: true, index: true },
    ownerImageUrl: { type: String, default: "" },
    companyType: { type: String, required: true },
    address: { type: AddressSchema },
    phoneNumber: { type: String },
    googleUrl: { type: String },
    websiteUrl: { type: String },
    companyImgUrl: { type: String, default: "" },
    services: { type: [companyServiceSchema], default: [] },
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
    employees: { type: [employeeSchema], default: [] },

    // <-- dynamic roles array
    roles: {
      type: [String],
      default: ["owner", "admin", "manager", "staff"],
    },

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
  mongoose.model<CompanyDoc>("Company", CompanySchema);
