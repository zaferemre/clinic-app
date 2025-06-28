import { Types } from "mongoose";
import Appointment from "../models/Appointment";
import Employee from "../models/Employee";
import User, { UserDocument } from "../models/User";

export async function findByUid(uid: string): Promise<UserDocument | null> {
  return User.findOne({ uid });
}

export async function upsertUser(user: {
  uid: string;
  email?: string;
  name: string;
  photoUrl?: string;
}): Promise<UserDocument> {
  // create if missing, otherwise update name/email/photo
  return User.findOneAndUpdate(
    { uid: user.uid },
    {
      $setOnInsert: { createdAt: new Date() },
      $set: {
        email: user.email,
        name: user.name,
        photoUrl: user.photoUrl,
        updatedAt: new Date(),
      },
    },
    { new: true, upsert: true }
  ).exec();
}

export async function updateSettings(uid: string, settings: any) {
  return User.findOneAndUpdate(
    { uid },
    { $set: settings, updatedAt: new Date() },
    { new: true }
  ).exec();
}

/**
 * Remove a membership from a user and delete their corresponding employee record.
 * @param uid - The user UID
 * @param companyId - The company ID
 * @param clinicId - The clinic ID (optional)
 */
export async function removeMembershipAndEmployee(
  uid: string,
  companyId: string,
  clinicId?: string
) {
  // Remove the membership from the user document
  const pull: any = { companyId: companyId.toString() };
  if (clinicId && clinicId.length > 0) pull.clinicId = clinicId;
  const user = await User.findOneAndUpdate(
    { uid },
    { $pull: { memberships: pull }, $set: { updatedAt: new Date() } },
    { new: true }
  ).exec();

  // Remove the corresponding Employee record
  const employeeFilter: any = {
    companyId: new Types.ObjectId(companyId),
    userUid: uid,
  };
  if (clinicId && clinicId.length > 0) {
    employeeFilter.clinicId = new Types.ObjectId(clinicId);
  }

  await Employee.deleteMany(employeeFilter);

  return user;
}
export async function getUserMemberships(uid: string) {
  const user = await User.findOne({ uid });
  return user?.memberships || [];
}

export async function getUserClinics(uid: string) {
  const user = await User.findOne({ uid });
  // flatten memberships with clinicId present:
  return user?.memberships.filter((m) => m.clinicId) || [];
}

export async function deleteUser(uid: string) {
  // 1. Find user (get _id and other info)
  const user = await User.findOne({ uid });
  if (!user) return null;

  // 2. Delete user document
  await User.deleteOne({ uid });

  // 3. Delete all employee records for user
  await Employee.deleteMany({ userUid: uid });

  // 4. Delete all appointments where user is patient or assigned employee
  await Appointment.deleteMany({
    $or: [
      { patientId: uid },
      { employeeId: uid }, // or whatever your field is
    ],
  });

  return true;
}
export async function addMembership(
  uid: string,
  membership: {
    companyId: string;
    companyName: string;
    clinicId?: string;
    clinicName?: string;
    roles?: string[];
  }
) {
  // Only add if that exact companyId + clinicId is not present
  const query: any = { uid };
  if (membership.clinicId) {
    query["memberships"] = {
      $not: {
        $elemMatch: {
          companyId: membership.companyId,
          clinicId: membership.clinicId,
        },
      },
    };
  } else {
    query["memberships"] = {
      $not: {
        $elemMatch: {
          companyId: membership.companyId,
          clinicId: { $exists: false },
        },
      },
    };
  }

  return User.findOneAndUpdate(
    query,
    { $push: { memberships: membership }, $set: { updatedAt: new Date() } },
    { new: true }
  ).exec();
}
