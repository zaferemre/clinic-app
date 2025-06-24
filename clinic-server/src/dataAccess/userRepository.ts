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

export async function removeMembership(
  uid: string,
  companyId: string,
  clinicId: string
) {
  return User.findOneAndUpdate(
    { uid },
    { $pull: { memberships: { companyId, clinicId } } },
    { new: true }
  ).exec();
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
  return User.findOneAndDelete({ uid }).exec();
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
