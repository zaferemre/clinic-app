import mongoose from "mongoose";

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

export interface PatientDocument extends mongoose.Document {
  clinicId: mongoose.Types.ObjectId;
  name: string;
  gender: "Male" | "Female" | "Other";
  age?: number;
  phone?: string;
  credit: number;
  services: ServiceEntry[];
  paymentHistory: PaymentHistoryEntry[];
  note?: string;
}

const patientSchema = new mongoose.Schema<PatientDocument>(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Clinic",
    },
    name: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    age: { type: Number },
    phone: { type: String },

    credit: { type: Number, default: 0 },

    services: [
      {
        name: { type: String },
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
        },
        amount: { type: Number },
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
