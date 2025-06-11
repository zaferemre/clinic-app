import mongoose, { Document, Schema } from "mongoose";

export interface WorkerInfo {
  email: string;
  name?: string;
  role?: "staff" | "manager" | "admin";
  pictureUrl?: string;
}

export interface IClinic extends Document {
  name: string;
  ownerEmail: string;
  workers: WorkerInfo[];
}

const workerSchema = new Schema<WorkerInfo>(
  {
    email: { type: String, required: true },
    name: { type: String },
    role: {
      type: String,
      enum: ["staff", "manager", "admin"],
      default: "staff",
    },
    pictureUrl: { type: String, default: "" },
  },
  { _id: false }
);

const ClinicSchema = new Schema<IClinic>(
  {
    name: { type: String, required: true },
    ownerEmail: { type: String, required: true, index: true },
    workers: { type: [workerSchema], default: [] },
  },
  { timestamps: true }
);

const Clinic =
  mongoose.models.Clinic || mongoose.model<IClinic>("Clinic", ClinicSchema);

export default Clinic;
