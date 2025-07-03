import { Schema, model, Document, Types } from "mongoose";
import { workingHourSchema, WorkingHour } from "./WorkingHour";

export interface ClinicDocument extends Document {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  name: string;
  address: {
    province: string;
    district: string;
    town?: string;
    neighborhood?: string;
    street?: string;
    building?: string;
    zip?: string;
  };
  phoneNumber?: string;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
  workingHours: WorkingHour[];
  services?: Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ClinicSchema = new Schema<ClinicDocument>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    name: { type: String, required: true },
    address: {
      province: { type: String, default: "" },
      district: { type: String, default: "" },
      town: { type: String, default: "" },
      neighborhood: { type: String, default: "" },
      street: { type: String, default: "" },
      building: { type: String, default: "" },
      zip: { type: String, default: "" },
    },
    phoneNumber: { type: String },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: undefined },
    },
    workingHours: { type: [workingHourSchema], default: [] },
    services: [{ type: Schema.Types.ObjectId, ref: "Service" }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default model<ClinicDocument>("Clinic", ClinicSchema);
