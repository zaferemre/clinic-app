import * as empRepo from "../dataAccess/employeeRepository";
import Employee, { EmployeeDocument } from "../models/Employee";
import User from "../models/User";
import { Types } from "mongoose";
import { WorkingHour } from "../models/WorkingHour";

// Response tipi
export interface EnrichedEmployee {
  _id: string;
  userId: string;
  name: string;
  pictureUrl: string;
  roles: string[];
  services: any[];
  workingHours: WorkingHour[];
  companyId: string;
  clinicId: string;
}

// Çalışanı ekle/güncelle (upsert)
export async function upsertEmployee(
  companyId: string,
  clinicId: string,
  userUid: string,
  data: Partial<EmployeeDocument>
) {
  if (data.roles && !Array.isArray(data.roles)) data.roles = [data.roles];
  return empRepo.upsertEmployee(companyId, clinicId, userUid, data);
}

// Tüm çalışanları listeler (enriched, user datası ile)
export async function listEmployees(
  companyId: string,
  clinicId?: string
): Promise<EnrichedEmployee[]> {
  const employees = await empRepo.listEmployees(companyId, clinicId);
  if (!employees.length) return [];

  const userUids = [...new Set(employees.map((e) => e.userUid))];
  const users = await User.find({ uid: { $in: userUids } })
    .select({ uid: 1, name: 1, photoUrl: 1, memberships: 1 })
    .lean();

  const userMap: Record<string, any> = {};
  users.forEach((u) => (userMap[u.uid] = u));

  return employees.map((emp: any) => {
    const user = userMap[emp.userUid] ?? {};
    let roles = Array.isArray(emp.roles) ? emp.roles : [];
    if (
      (!roles || roles.length === 0) &&
      user.memberships &&
      Array.isArray(user.memberships)
    ) {
      const membership = user.memberships.find(
        (m: any) =>
          m.companyId?.toString() === emp.companyId.toString() &&
          (!emp.clinicId || m.clinicId?.toString() === emp.clinicId.toString())
      );
      if (membership?.roles?.length) roles = membership.roles;
    }
    return {
      _id: emp._id?.toString(),
      userId: emp.userUid,
      name: user.name ?? "—",
      pictureUrl: user.photoUrl ?? "",
      roles: roles ?? [],
      services: emp.services ?? [],
      workingHours: emp.workingHours ?? [],
      companyId: emp.companyId.toString(),
      clinicId: emp.clinicId?.toString() ?? "",
    };
  });
}

// Çalışanı sil (userUid ile)
export async function removeEmployee(
  companyId: string,
  clinicId: string,
  userUid: string
) {
  return empRepo.removeEmployee(companyId, clinicId, userUid);
}

// Yeni çalışan oluştur
export async function createEmployee(data: Partial<EmployeeDocument>) {
  if (data.roles && !Array.isArray(data.roles)) data.roles = [data.roles];
  return empRepo.createEmployee(data);
}

// Çalışan güncelle (employeeId ile)
// NOT: User.memberships'daki rol de güncellenir!
export async function updateEmployee(
  employeeId: string,
  data: Partial<EmployeeDocument>
) {
  if (data.roles && !Array.isArray(data.roles)) data.roles = [data.roles];
  const emp = await empRepo.updateEmployee(employeeId, data);

  // Sadece klinik membership'ını güncelle
  if (data.roles && emp && emp.clinicId) {
    const companyIdStr = emp.companyId.toString();
    const clinicIdStr = emp.clinicId.toString();

    // Sadece klinik membership'ı update et
    await User.updateOne(
      {
        uid: emp.userUid,
        memberships: {
          $elemMatch: {
            companyId: companyIdStr,
            clinicId: clinicIdStr,
          },
        },
      },
      { $set: { "memberships.$.roles": data.roles } }
    );
  }

  return emp;
}

// Çalışanı sil (employeeId ile)
export async function deleteEmployee(employeeId: string) {
  return empRepo.deleteEmployee(employeeId);
}
