import { Schema } from "mongoose";

export interface WorkingHour {
  day:
    | "Pazartesi"
    | "Salı"
    | "Çarşamba"
    | "Perşembe"
    | "Cuma"
    | "Cumartesi"
    | "Pazar";
  open: string; // "HH:mm"
  close: string; // "HH:mm"
}

export const workingHourSchema = new Schema<WorkingHour>(
  {
    day: {
      type: String,
      enum: [
        "Pazartesi",
        "Salı",
        "Çarşamba",
        "Perşembe",
        "Cuma",
        "Cumartesi",
        "Pazar",
      ],
      required: true,
    },
    open: { type: String, required: true },
    close: { type: String, required: true },
  },
  { _id: false }
);
