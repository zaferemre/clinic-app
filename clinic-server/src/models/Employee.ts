import { Schema, model, Document } from "mongoose";
import { workingHourSchema, WorkingHour } from "./WorkingHour";

export interface EmployeeDocument extends Document {
  companyId: Schema.Types.ObjectId;
  clinicId: Schema.Types.ObjectId;
  userId: string; // Firebase UID
  email: string;
  name?: string;
  phone?: string;
  role:
    | "owner"
    | "staff"
    | "admin"
    | "doctor"
    | "nurse"
    | "receptionist"
    | "other";
  pictureUrl?: string;
  services: Schema.Types.ObjectId[];
  workingHours: WorkingHour[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<EmployeeDocument>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: true },
    userId: { type: String, required: true, index: true },
    email: { type: String, required: true },
    name: { type: String },
    phone: { type: String },
    role: {
      type: String,
      enum: [
        "owner",
        "staff",
        "admin",
        "doctor",
        "nurse",
        "receptionist",
        "other",
      ],
      default: "other",
    },
    pictureUrl: { type: String },
    services: [{ type: Schema.Types.ObjectId, ref: "Service" }],
    workingHours: { type: [workingHourSchema], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default model<EmployeeDocument>("Employee", EmployeeSchema);
