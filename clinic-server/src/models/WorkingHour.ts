import { Schema } from "mongoose";

export interface WorkingHour {
  day:
    | "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";
  open: string; // "HH:mm"
  close: string; // "HH:mm"
}

export const workingHourSchema = new Schema<WorkingHour>(
  {
    day: {
      type: String,
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      required: true,
    },
    open: { type: String, required: true },
    close: { type: String, required: true },
  },
  { _id: false }
);
