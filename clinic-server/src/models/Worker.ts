import mongoose, { Document, Schema } from "mongoose";

export interface IWorker extends Document {
  name: string;
  email: string;
  role: "Receptionist" | "Physiotherapist" | "Manager" | "Admin";
  pictureUrl?: string;
  availability: {
    day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
    start: string; // "HH:mm"
    end: string; // "HH:mm"
  }[];
  companyId: mongoose.Types.ObjectId;
}

const workerSchema = new Schema<IWorker>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: {
      type: String,
      enum: ["Receptionist", "Physiotherapist", "Manager", "Admin"],
      default: "Receptionist",
    },
    pictureUrl: { type: String, default: "" },
    availability: [
      {
        day: {
          type: String,
          enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          required: true,
        },
        start: { type: String, required: true },
        end: { type: String, required: true },
      },
    ],
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
  },
  { timestamps: true }
);

const Worker =
  mongoose.models.Worker || mongoose.model<IWorker>("Worker", workerSchema);

export default Worker;
