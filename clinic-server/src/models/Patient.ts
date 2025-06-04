import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    clinicId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Clinic",
    },
    name: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    age: { type: Number },
    phone: { type: String },

    // NEW: credit left (number of appointments they can schedule)
    credit: { type: Number, default: 0 },

    // NEW: how much they still owe (in whatever currency units you use)
    balanceDue: { type: Number, default: 0 },

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

const Patient = mongoose.model("Patient", patientSchema);
export default Patient;
