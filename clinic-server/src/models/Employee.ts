import mongoose, { Schema } from "mongoose";
import { WorkingHour, workingHourSchema } from "./WorkingHour";

export interface EmployeeInfo {
  _id?: mongoose.Types.ObjectId;
  email: string;
  name?: string;
  role?: "staff" | "manager" | "admin" | "owner";
  pictureUrl?: string;
  services?: mongoose.Types.ObjectId[]; // now just references
  workingHours?: WorkingHour[];
}

export const employeeSchema = new Schema<EmployeeInfo>(
  {
    email: { type: String, required: true },
    name: { type: String },
    role: {
      type: String,
      enum: ["owner", "staff", "manager", "admin"],
      default: "staff",
    },
    pictureUrl: { type: String, default: "" },
    services: [
      {
        type: Schema.Types.ObjectId,
        ref: "Service", // references Service model
      },
    ],
    workingHours: { type: [workingHourSchema], default: [] },
  },
  { _id: true }
);

export const Employee = mongoose.model<EmployeeInfo>(
  "Employee",
  employeeSchema
);
