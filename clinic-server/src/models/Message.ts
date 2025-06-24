import { Schema, model, Document, Types } from "mongoose";

export interface IMessage extends Document {
  companyId: Types.ObjectId;
  patientId?: Types.ObjectId;
  text: string;
  scheduledFor: Date;
  sent: boolean;
  sentAt?: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    companyId: { type: Schema.Types.ObjectId, required: true, ref: "Company" },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
    text: { type: String, required: true },
    scheduledFor: { type: Date, required: true },
    sent: { type: Boolean, default: false },
    sentAt: { type: Date },
  },
  { timestamps: true }
);

export default model<IMessage>("Message", MessageSchema);
