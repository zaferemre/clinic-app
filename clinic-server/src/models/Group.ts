import { Schema, model, Document, Types } from "mongoose";

export interface GroupDocument extends Document {
  companyId: Types.ObjectId;
  clinicId: Types.ObjectId;
  name: string;
  patients: Types.ObjectId[];
  employees: Types.ObjectId[];
  maxSize: number;
  note?: string;
  credit: number;
  status: "active" | "inactive" | "archived";
  groupType?: string;
  appointments: Types.ObjectId[];
  createdBy: string; // Firebase UID
  customFields?: any;
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema = new Schema<GroupDocument>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: true },
    name: { type: String, required: true },
    patients: [{ type: Schema.Types.ObjectId, ref: "Patient" }],
    employees: [{ type: Schema.Types.ObjectId, ref: "Employee" }],
    maxSize: { type: Number, required: true },
    note: { type: String },
    credit: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "inactive", "archived"],
      default: "active",
    },
    groupType: { type: String },
    appointments: [{ type: Schema.Types.ObjectId, ref: "Appointment" }],
    customFields: { type: Schema.Types.Mixed },
    createdBy: { type: String, required: true }, // Firebase UID
  },
  { timestamps: true }
);

export default model<GroupDocument>("Group", GroupSchema);
