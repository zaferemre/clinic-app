import mongoose, { Document, Schema } from "mongoose";

export interface NotificationDocument extends Document {
  companyId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  type: "call";
  status: "pending" | "done";
  workerEmail?: string;
  note?: string;
}

const notificationSchema = new Schema<NotificationDocument>(
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
    type: { type: String, enum: ["call"], required: true },
    status: {
      type: String,
      enum: ["pending", "done"],
      default: "pending",
    },
    workerEmail: { type: String },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

const Notification =
  mongoose.models.Notification ||
  mongoose.model<NotificationDocument>("Notification", notificationSchema);

export default Notification;
