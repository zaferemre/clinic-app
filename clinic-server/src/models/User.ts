import { Schema, model, Document, Types } from "mongoose";

export interface Membership {
  companyId: Types.ObjectId;
  companyName: string;
  clinicId?: Types.ObjectId;
  clinicName?: string;
  roles: string[];
}

export interface UserDocument extends Document {
  uid: string;
  email?: string;
  phoneNumber?: string;
  name?: string;
  photoUrl?: string;
  theme?: "light" | "dark" | "system";
  memberships: Membership[];
  notificationPrefs?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  pushTokens?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const MembershipSchema = new Schema<Membership>(
  {
    companyId: { type: Schema.Types.ObjectId, required: true },
    companyName: { type: String, required: true },
    clinicId: { type: Schema.Types.ObjectId, required: false },
    clinicName: { type: String, required: false },
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
    phoneNumber: { type: String },
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
    pushTokens: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default model<UserDocument>("User", UserSchema);
