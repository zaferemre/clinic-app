import Employee, { EmployeeDocument } from "../models/Employee";
import User from "../models/User";
import { Types } from "mongoose";

interface EnrichedEmployee {
  userId: string;
  name: string;
  pictureUrl: string;
  role: string;
  services: any[];
  workingHours: any[];
  companyId: string;
  clinicId: string;
}

// Upsert (create if not exists, update otherwise)
export async function upsertEmployee(
  companyId: string | Types.ObjectId,
  clinicId: string | Types.ObjectId,
  userUid: string,
  data: Partial<EmployeeDocument>
) {
  const cId =
    companyId instanceof Types.ObjectId
      ? companyId
      : new Types.ObjectId(companyId);
  const clId =
    clinicId instanceof Types.ObjectId
      ? clinicId
      : new Types.ObjectId(clinicId);

  return Employee.findOneAndUpdate(
    {
      companyId: cId,
      clinicId: clId,
      userUid,
    },
    { $set: { ...data, companyId: cId, clinicId: clId, userUid } },
    { new: true, upsert: true }
  ).exec();
}

// List employees, with enrichment
export async function listEmployees(
  companyId: string | Types.ObjectId,
  clinicId?: string | Types.ObjectId
): Promise<EnrichedEmployee[]> {
  const cId =
    companyId instanceof Types.ObjectId
      ? companyId
      : new Types.ObjectId(companyId);
  const filter: any = { companyId: cId };
  if (clinicId)
    filter.clinicId =
      clinicId instanceof Types.ObjectId
        ? clinicId
        : new Types.ObjectId(clinicId);

  const employees = await Employee.find(filter).lean();
  if (!employees.length) return [];

  const userUids = [...new Set(employees.map((e) => e.userUid))];
  const users = await User.find({ uid: { $in: userUids } })
    .select({ uid: 1, name: 1, photoUrl: 1, memberships: 1 })
    .lean();

  // Map UID -> user
  const userMap: Record<string, any> = {};
  users.forEach((u) => (userMap[u.uid] = u));

  const result: EnrichedEmployee[] = employees.map((emp) => {
    const user = userMap[emp.userUid] ?? {};
    // Best role match logic
    let role = emp.roles?.[0];
    if (!role && user.memberships && Array.isArray(user.memberships)) {
      const membership = user.memberships.find(
        (m: any) =>
          m.companyId?.toString() === emp.companyId.toString() &&
          (!emp.clinicId || m.clinicId?.toString() === emp.clinicId.toString())
      );
      role = membership?.roles?.[0] ?? "employee";
    }
    return {
      userId: emp.userUid,
      name: user.name ?? "—",
      pictureUrl: user.photoUrl ?? "",
      role: role ?? "employee",
      services: emp.services ?? [],
      workingHours: emp.workingHours ?? [],
      companyId: emp.companyId.toString(),
      clinicId: emp.clinicId?.toString() ?? "",
    };
  });

  return result;
}

// Remove one employee by company, clinic, user
export async function removeEmployee(
  companyId: string | Types.ObjectId,
  clinicId: string | Types.ObjectId,
  userUid: string
) {
  const cId =
    companyId instanceof Types.ObjectId
      ? companyId
      : new Types.ObjectId(companyId);
  const clId =
    clinicId instanceof Types.ObjectId
      ? clinicId
      : new Types.ObjectId(clinicId);

  return Employee.deleteOne({
    companyId: cId,
    clinicId: clId,
    userUid,
  }).exec();
}

// Update by employeeId
export async function updateEmployee(
  employeeId: string | Types.ObjectId,
  updates: Partial<EmployeeDocument>
) {
  const eId =
    employeeId instanceof Types.ObjectId
      ? employeeId
      : new Types.ObjectId(employeeId);
  return Employee.findByIdAndUpdate(eId, updates, { new: true }).exec();
}

// Delete by employeeId
export async function deleteEmployee(employeeId: string | Types.ObjectId) {
  const eId =
    employeeId instanceof Types.ObjectId
      ? employeeId
      : new Types.ObjectId(employeeId);
  return Employee.findByIdAndDelete(eId).exec();
}

// Only use this for "raw" creates (not for upsert logic)
export async function createEmployee(data: Partial<EmployeeDocument>) {
  return Employee.create(data);
}
