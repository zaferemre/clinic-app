// models/Clinic.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IClinic extends Document {
  name: string;
  ownerEmail: string;
  workers: string[];
}

const clinicSchema = new Schema<IClinic>({
  name: { type: String, required: true },
  ownerEmail: { type: String, required: true },
  workers: { type: [String], default: [] },
});

export default mongoose.models.Clinic ||
  mongoose.model<IClinic>("Clinic", clinicSchema);
