// src/models/Worker.ts
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

const workerSchema = new Schema<IWorker>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
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
      start: { type: String, required: true }, // Format "HH:mm"
      end: { type: String, required: true }, // Format "HH:mm"
    },
  ],

  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
});

// If you want a compound index to ensure no two workers with the same email exist in the same clinic:
// workerSchema.index({ email: 1, companyId: 1 }, { unique: true });

export default mongoose.model<IWorker>("Worker", workerSchema);
