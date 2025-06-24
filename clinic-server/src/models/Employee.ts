import { Schema, model, Document, Types } from "mongoose";
import { workingHourSchema, WorkingHour } from "./WorkingHour";

export interface EmployeeDocument extends Document {
  companyId: Types.ObjectId;
  clinicId: Types.ObjectId; // Can be a string for legacy reasons
  userUid: string; // Firebase UID
  email?: string;
  name?: string;
  phone?: string;
  roles: string[];
  pictureUrl?: string;
  services: Types.ObjectId[];
  workingHours: WorkingHour[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<EmployeeDocument>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    clinicId: {
      type: Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
      index: true,
    },
    userUid: { type: String, required: true, index: true },
    email: { type: String },
    name: { type: String },
    phone: { type: String },
    roles: { type: [String], default: [] },
    pictureUrl: { type: String },
    services: [{ type: Schema.Types.ObjectId, ref: "Service" }],
    workingHours: { type: [workingHourSchema], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default model<EmployeeDocument>("Employee", EmployeeSchema);
