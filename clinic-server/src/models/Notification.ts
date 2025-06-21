import { Schema, model, Document, Types } from "mongoose";

export interface NotificationDocument extends Document {
  companyId: Types.ObjectId;
  clinicId: Types.ObjectId;
  patientId?: Types.ObjectId;
  groupId?: Types.ObjectId;
  type: "call" | "sms" | "email" | "whatsapp" | "system";
  status: "pending" | "sent" | "failed" | "done";
  message: string;
  trigger: string;
  workerId?: Types.ObjectId;
  note?: string;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<NotificationDocument>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "company",
      required: true,
    },
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
    groupId: { type: Schema.Types.ObjectId, ref: "Group" },
    type: {
      type: String,
      enum: ["call", "sms", "email", "whatsapp", "system"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "sent", "failed", "done"],
      default: "pending",
    },
    message: { type: String, required: true },
    trigger: { type: String },
    workerId: { type: Schema.Types.ObjectId, ref: "Employee" },
    note: { type: String },
    sentAt: { type: Date },
  },
  { timestamps: true }
);

export default model<NotificationDocument>("Notification", NotificationSchema);
