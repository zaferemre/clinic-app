import mongoose, { Document, Schema } from "mongoose";

export interface IMessage extends Document {
  companyId: mongoose.Types.ObjectId;
  patientId?: mongoose.Types.ObjectId;
  text: string;
  scheduledFor: Date;
  sent: boolean;
  sentAt?: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Company",
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
    },
    text: { type: String, required: true },
    scheduledFor: { type: Date, required: true },
    sent: { type: Boolean, default: false },
    sentAt: { type: Date },
  },
  { timestamps: true }
);

const Message =
  mongoose.models.Message || mongoose.model<IMessage>("Message", messageSchema);

export default Message;
