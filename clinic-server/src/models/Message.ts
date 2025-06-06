// src/models/Message.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IMessage extends Document {
  clinicId: mongoose.Types.ObjectId;
  patientId?: mongoose.Types.ObjectId; // optional — if null, it’s a bulk message
  text: string;
  scheduledFor: Date;
  sent: boolean;
  sentAt?: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: false },
    text: { type: String, required: true },
    scheduledFor: { type: Date, required: true },
    sent: { type: Boolean, default: false },
    sentAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IMessage>("Message", messageSchema);
