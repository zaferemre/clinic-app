import { Schema, model, Document, Types } from "mongoose";

export interface PatientDocument extends Document {
  companyId: Types.ObjectId;
  clinicId: Types.ObjectId;
  name: string;
  age?: number;
  phone?: string;
  email?: string;
  credit: number;
  services: {
    serviceId: Types.ObjectId;
    pointsLeft?: number;
    sessionsTaken?: number;
  }[];
  groups: Types.ObjectId[];
  paymentHistory: {
    date: Date;
    method: "Havale" | "Card" | "Cash" | "Unpaid";
    amount: number;
    note?: string;
  }[];
  status: "active" | "inactive" | "archived";
  lastAppointmentAt?: Date;
  note?: string;
  // --- KVKK onay bilgileri ---
  kvkkAccepted: boolean;
  kvkkAcceptedAt?: Date;
  clinicKvkkAccepted?: boolean;
  clinicKvkkAcceptedAt?: Date;
  clinicKvkkVersionAtAccept?: Date;
  // ---
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema = new Schema<PatientDocument>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: true },
    name: { type: String, required: true },
    age: { type: Number },
    phone: { type: String },
    email: { type: String },
    credit: { type: Number, default: 0 },
    services: [
      {
        serviceId: {
          type: Schema.Types.ObjectId,
          ref: "Service",
          required: true,
        },
        pointsLeft: { type: Number },
        sessionsTaken: { type: Number },
      },
    ],
    groups: [{ type: Schema.Types.ObjectId, ref: "Group" }],
    paymentHistory: [
      {
        date: { type: Date, default: Date.now },
        method: {
          type: String,
          enum: ["Havale", "Card", "Cash", "Unpaid"],
          required: true,
        },
        amount: { type: Number, required: true },
        note: { type: String },
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive", "archived"],
      default: "active",
    },
    lastAppointmentAt: { type: Date },
    note: { type: String },
    // --- KVKK onay alanları ---
    kvkkAccepted: { type: Boolean, default: true }, // Otomatik true!
    kvkkAcceptedAt: { type: Date },
    clinicKvkkAccepted: { type: Boolean },
    clinicKvkkAcceptedAt: { type: Date },
    clinicKvkkVersionAtAccept: { type: Date },
    // ---
  },
  { timestamps: true }
);

export default model<PatientDocument>("Patient", PatientSchema);
