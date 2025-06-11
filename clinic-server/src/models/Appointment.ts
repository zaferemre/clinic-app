import mongoose, { Document, Schema } from "mongoose";

export interface AppointmentDocument extends Document {
  companyId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  employeeEmail: string;
  serviceId: mongoose.Types.ObjectId;
  start: Date;
  end: Date;
  status: "scheduled" | "done" | "cancelled";
}

const appointmentSchema = new Schema<AppointmentDocument>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Company",
    },
    patientId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Patient",
    },
    employeeEmail: {
      type: String,
      required: true,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Service",
    },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    status: {
      type: String,
      enum: ["scheduled", "done", "cancelled"],
      default: "scheduled",
    },
  },
  { timestamps: true }
);

const Appointment =
  mongoose.models.Appointment ||
  mongoose.model<AppointmentDocument>("Appointment", appointmentSchema);

export default Appointment;
