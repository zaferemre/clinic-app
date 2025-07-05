import { Schema, model, Document, Types } from "mongoose";

// Extend this as needed for your app
export interface NotificationDocument extends Document {
  companyId: Types.ObjectId;
  clinicId: Types.ObjectId;
  patientId?: Types.ObjectId;
  groupId?: Types.ObjectId;
  type: "call" | "sms" | "email" | "whatsapp" | "system";
  status: "pending" | "sent" | "failed" | "done";
  message: string;
  title?: string;
  trigger: string;
  workerUid?: string;
  targetUserId?: string;
  note?: string;
  sentAt?: Date;
  read?: boolean;
  readAt?: Date;
  priority?: "low" | "normal" | "high";
  meta?: any;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<NotificationDocument>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
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
    title: { type: String },
    trigger: { type: String },
    workerUid: { type: String },
    targetUserId: { type: String },
    note: { type: String },
    sentAt: { type: Date },
    read: { type: Boolean, default: false },
    readAt: { type: Date },
    priority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal",
    },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// For fast list queries in dashboards
NotificationSchema.index({
  companyId: 1,
  clinicId: 1,
  status: 1,
  createdAt: -1,
});

// Virtual id field for frontend
NotificationSchema.virtual("id").get(function () {
  // @ts-ignore
  return this._id.toString();
});
NotificationSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    // If you want to remove _id from responses, uncomment:
    // delete ret._id;
  },
});

export default model<NotificationDocument>("Notification", NotificationSchema);
