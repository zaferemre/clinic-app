import { Schema, model, Document, Types } from "mongoose";

export interface RoleDocument extends Document {
  companyId: Types.ObjectId;
  clinicId: Types.ObjectId;
  name: string;
  createdBy?: string; // Firebase UID
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<RoleDocument>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: true },
    name: { type: String, required: true },
    createdBy: { type: String }, // Firebase UID
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

RoleSchema.index({ companyId: 1, clinicId: 1, name: 1 }, { unique: true });

export default model<RoleDocument>("Role", RoleSchema);
