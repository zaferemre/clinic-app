import { Schema, model, Document } from "mongoose";

export interface Membership {
  companyId: string; // Company._id as string
  companyName: string;
  clinicId?: string; // Clinic._id as string
  clinicName?: string; // Optional clinic name for convenience
  roles: string[]; // e.g. ['admin', 'staff']
}

export interface UserDocument extends Document {
  uid: string; // Firebase UID
  email?: string;
  phoneNumber?: string; // Optional phone number
  name?: string;
  photoUrl?: string;
  theme?: "light" | "dark" | "system";
  memberships: Membership[];
  notificationPrefs?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const MembershipSchema = new Schema<Membership>(
  {
    companyId: { type: String, required: true },
    companyName: { type: String, required: true },
    clinicId: { type: String, required: false },
    clinicName: { type: String, required: false }, // Optional clinic name for convenience
    roles: { type: [String], default: [] },
  },
  { _id: false }
);

const UserSchema = new Schema<UserDocument>(
  {
    uid: { type: String, required: true, unique: true },
    email: { type: String },
    name: { type: String },
    photoUrl: { type: String },
    phoneNumber: { type: String }, // Optional phone number
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "system",
    },
    memberships: { type: [MembershipSchema], default: [] },
    notificationPrefs: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export default model<UserDocument>("User", UserSchema);
