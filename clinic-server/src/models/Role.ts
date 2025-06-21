import { Schema, model, Document, Types } from "mongoose";

export interface RoleDocument extends Document {
  companyId: Types.ObjectId;
  clinicId: Types.ObjectId;
  name: string;
  createdBy?: Types.ObjectId;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<RoleDocument>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    clinicId: {
      type: Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
    },
    name: { type: String, required: true },
    // if you still want to track permissions you can keep this:
    createdBy: { type: Schema.Types.ObjectId, ref: "Employee" },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ensure a role name is unique per clinic
RoleSchema.index({ companyId: 1, clinicId: 1, name: 1 }, { unique: true });

export default model<RoleDocument>("Role", RoleSchema);
