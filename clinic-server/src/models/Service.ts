import { Schema, model, Document } from "mongoose";

export interface ServiceDocument extends Document {
  companyId: Schema.Types.ObjectId;
  clinicId: Schema.Types.ObjectId;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  category?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<ServiceDocument>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: true },
    serviceName: { type: String, required: true },
    servicePrice: { type: Number, required: true, min: 0 },
    serviceDuration: { type: Number, required: true, min: 1 },
    category: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default model<ServiceDocument>("Service", ServiceSchema);
