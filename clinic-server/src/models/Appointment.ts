import mongoose from "mongoose";

export interface AppointmentDocument extends mongoose.Document {
  clinicId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  workerEmail: string;
  start: Date;
  end: Date;
  status: "scheduled" | "done" | "cancelled";
}

const appointmentSchema = new mongoose.Schema<AppointmentDocument>(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Clinic",
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Patient",
    },
    workerEmail: {
      type: String,
      required: true,
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
