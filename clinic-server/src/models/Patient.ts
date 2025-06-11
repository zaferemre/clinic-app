import mongoose, { Document, Schema } from "mongoose";

export interface ServiceEntry {
  name: string;
  pointsLeft?: number;
  sessionsTaken?: number;
}

export interface PaymentHistoryEntry {
  date: Date;
  method: "Havale" | "Card" | "Cash" | "Unpaid";
  amount: number;
  note?: string;
}

export interface PatientDocument extends Document {
  companyId: mongoose.Types.ObjectId;
  name: string;
  gender: "Male" | "Female" | "Other";
  age?: number;
  phone?: string;
  credit: number;
  services: ServiceEntry[];
  paymentHistory: PaymentHistoryEntry[];
  note?: string;
}

const patientSchema = new Schema<PatientDocument>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Company",
    },
    name: { type: String, required: true },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    age: { type: Number },
    phone: { type: String },
    credit: { type: Number, default: 0 },
    services: [
      {
        name: { type: String, required: true },
        pointsLeft: { type: Number },
        sessionsTaken: { type: Number },
      },
    ],
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
    note: { type: String },
  },
  { timestamps: true }
);

const Patient =
  mongoose.models.Patient ||
  mongoose.model<PatientDocument>("Patient", patientSchema);

export default Patient;
