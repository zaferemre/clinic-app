import { Schema, model, Document, Types } from "mongoose";

// Update the TS type to allow ObjectId OR string for createdBy
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
  appointmentType: "individual" | "group";
  createdBy: string; // <--- FIXED HERE
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<AppointmentDocument>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    clinicId: {
      type: Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: false,
    },
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: false,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: false,
    },
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "done", "cancelled", "no-show"],
      default: "scheduled",
    },
    appointmentType: {
      type: String,
      enum: ["individual", "group"],
      required: true,
    },
    // Allow string OR ObjectId for createdBy
    createdBy: {
      type: String, // <--- FIXED HERE
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast lookups (unchanged)
AppointmentSchema.index({
  companyId: 1,
  clinicId: 1,
  employeeId: 1,
  start: 1,
  end: 1,
});

export default model<AppointmentDocument>("Appointment", AppointmentSchema);
