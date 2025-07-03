import { Schema, model, Document, Types } from "mongoose";

export interface CompanyDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  ownerUid: string;
  subscription: {
    plan: "free" | "basic" | "pro" | "enterprise";
    status: "active" | "trialing" | "canceled";
    provider: "iyzico" | "manual" | "other";
    maxClinics: number;
    nextBillingDate?: Date;
    allowedFeatures: string[];
  };
  joinCode: string;
  clinics: Types.ObjectId[];
  settings: {
    allowPublicBooking: boolean;
    inactivityThresholdDays: number;
    [key: string]: any;
  };
  websiteUrl?: string;
  socialLinks?: Record<string, string>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<CompanyDocument>(
  {
    name: { type: String, required: true },
    ownerUid: { type: String, required: true, index: true },
    subscription: {
      plan: {
        type: String,
        enum: ["free", "basic", "pro", "enterprise"],
        default: "free",
      },
      status: {
        type: String,
        enum: ["active", "trialing", "canceled"],
        default: "trialing",
      },
      provider: {
        type: String,
        enum: ["iyzico", "manual", "other"],
        default: "manual",
      },
      maxClinics: { type: Number, default: 1 },
      nextBillingDate: { type: Date },
      allowedFeatures: [{ type: String }],
    },
    joinCode: { type: String, required: true, unique: true },
    clinics: [{ type: Schema.Types.ObjectId, ref: "Clinic" }],
    settings: {
      allowPublicBooking: { type: Boolean, default: false },
      inactivityThresholdDays: { type: Number, default: 90 },
    },
    websiteUrl: { type: String },
    socialLinks: { type: Map, of: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default model<CompanyDocument>("Company", CompanySchema);
