import mongoose, { Document, Schema } from "mongoose";

export interface WorkerInfo {
  email: string;
  name?: string;
  role?: string;
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

const ClinicSchema = new mongoose.Schema({
  name: String,
  ownerEmail: String,
  workers: [
    {
      email: { type: String, required: true },
      name: String,
      role: String,
      pictureUrl: { type: String, default: "" },
    },
  ],
});

export default mongoose.models.Clinic ||
  mongoose.model<IClinic>("Clinic", ClinicSchema);
