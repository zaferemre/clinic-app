import mongoose from "mongoose";

export interface NotificationDocument extends mongoose.Document {
  clinicId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  type: "call"; // currently only “call”
  status: "pending" | "done";
  createdAt: Date;
  updatedAt: Date;
  workerEmail?: string; // optional who flagged it
}

const notificationSchema = new mongoose.Schema<NotificationDocument>(
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
    type: { type: String, enum: ["call"], required: true },
    status: { type: String, enum: ["pending", "done"], default: "pending" },
    workerEmail: { type: String },
  },
  { timestamps: true }
);

const Notification =
  mongoose.models.Notification ||
  mongoose.model<NotificationDocument>("Notification", notificationSchema);
export default Notification;
