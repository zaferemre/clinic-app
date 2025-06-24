// src/dataAccess/employeeRepository.ts
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

export async function upsertEmployee(
  companyId: string,
  clinicId: string,
  userUid: string,
  data: Partial<EmployeeDocument>
) {
  return Employee.findOneAndUpdate(
    {
      companyId: new Types.ObjectId(companyId),
      clinicId: new Types.ObjectId(clinicId),
      userUid,
    },
    { $set: data },
    { new: true, upsert: true }
  );
}

/**
 * List employees in a clinic/company, enriched with minimal user data.
 * Only returns: userId, name, pictureUrl, role, services, workingHours, companyId, clinicId.
 */
export async function listEmployees(
  companyId: string,
  clinicId?: string
): Promise<EnrichedEmployee[]> {
  const filter: any = { companyId: new Types.ObjectId(companyId) };
  if (clinicId) filter.clinicId = new Types.ObjectId(clinicId);

  // Fetch employees
  const employees = await Employee.find(filter).lean();

  if (!employees.length) return [];

  // Gather all user UIDs (avoid duplicates)
  const userUids = [...new Set(employees.map((e) => e.userUid))];

  // Fetch user info in one query
  const users = await User.find({ uid: { $in: userUids } })
    .select({ uid: 1, name: 1, photoUrl: 1, memberships: 1 })
    .lean();

  // Map UID -> user object
  const userMap: Record<string, any> = {};
  for (const u of users) userMap[u.uid] = u;

  // Map each employee to EnrichedEmployee
  const result: EnrichedEmployee[] = employees.map((emp) => {
    const user = userMap[emp.userUid] ?? {};
    // Role from employee first, fallback to user's membership if available
    let role = emp.roles?.[0];
    if (!role && user.memberships && Array.isArray(user.memberships)) {
      // Try to match on companyId/clinicId for most accurate role
      const membership = user.memberships.find(
        (m: any) =>
          m.companyId === emp.companyId.toString() &&
          (!emp.clinicId || m.clinicId === emp.clinicId.toString())
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

export async function removeEmployee(
  companyId: string,
  clinicId: string,
  userUid: string
) {
  return Employee.deleteOne({
    companyId: new Types.ObjectId(companyId),
    clinicId: new Types.ObjectId(clinicId),
    userUid,
  }).exec();
}

export async function addEmployee(
  companyId: string,
  data: Partial<EmployeeDocument>
) {
  return Employee.create({ ...data, companyId: new Types.ObjectId(companyId) });
}

export async function updateEmployee(
  employeeId: string,
  updates: Partial<EmployeeDocument>
) {
  return Employee.findByIdAndUpdate(new Types.ObjectId(employeeId), updates, {
    new: true,
  }).exec();
}

export async function deleteEmployee(employeeId: string) {
  return Employee.findByIdAndDelete(new Types.ObjectId(employeeId)).exec();
}

export async function createEmployee(data: Partial<EmployeeDocument>) {
  return Employee.create(data);
}
