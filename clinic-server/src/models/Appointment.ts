// src/models/Appointment.ts
import { Schema, model, Document, Types } from "mongoose";

export interface AppointmentDocument extends Document {
  companyId: Types.ObjectId;
  clinicId: Types.ObjectId;
  patientId?: Types.ObjectId;
  groupId?: Types.ObjectId;
  employeeId: Types.ObjectId;
  serviceId?: Types.ObjectId;
  start: Date;
  end: Date;
  status: "scheduled" | "done" | "cancelled" | "no-show";
  appointmentType: "individual" | "group" | "custom";
  customDuration?: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<AppointmentDocument>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
    groupId: { type: Schema.Types.ObjectId, ref: "Group" },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service" },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    status: {
      type: String,
      enum: ["scheduled", "done", "cancelled", "no-show"],
      default: "scheduled",
    },
    appointmentType: {
      type: String,
      enum: ["individual", "group", "custom"],
      required: true,
    },
    customDuration: { type: Number }, // Yalnızca custom randevu için
    createdBy: { type: String, required: true },
  },
  { timestamps: true }
);

AppointmentSchema.index({
  companyId: 1,
  clinicId: 1,
  employeeId: 1,
  start: 1,
  end: 1,
});

export default model<AppointmentDocument>("Appointment", AppointmentSchema);
