// src/models/Service.ts

import mongoose, { Document, Schema } from "mongoose";

export interface IService extends Document {
  serviceName: string;
  servicePrice: number;
  serviceKapora: number;
  serviceDuration: number;
  companyId: mongoose.Types.ObjectId;
}

// Export the schema so it can be embedded if needed
export const ServiceSchema = new Schema<IService>({
  companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true },
  serviceName: { type: String, required: true },
  servicePrice: { type: Number, required: true, min: 0 },
  serviceKapora: { type: Number, default: 0, min: 0 },
  serviceDuration: { type: Number, required: true, min: 1 },
});

// Default-export the Mongoose model
export default mongoose.models.Service ||
  mongoose.model<IService>("Service", ServiceSchema);
