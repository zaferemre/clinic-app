import Employee, { EmployeeDocument } from "../models/Employee";
import { Types } from "mongoose";

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
    { companyId: cId, clinicId: clId, userUid },
    { $set: { ...data, companyId: cId, clinicId: clId, userUid } },
    { new: true, upsert: true }
  ).exec();
}

export async function listEmployees(
  companyId: string | Types.ObjectId,
  clinicId?: string | Types.ObjectId
) {
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
  return Employee.find(filter).lean();
}

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

  return Employee.deleteOne({ companyId: cId, clinicId: clId, userUid }).exec();
}

export async function createEmployee(data: Partial<EmployeeDocument>) {
  return Employee.create(data);
}

export async function updateEmployee(
  employeeId: string | Types.ObjectId,
  data: Partial<EmployeeDocument>
) {
  const eId =
    employeeId instanceof Types.ObjectId
      ? employeeId
      : new Types.ObjectId(employeeId);
  return Employee.findByIdAndUpdate(eId, data, { new: true }).exec();
}

export async function deleteEmployee(employeeId: string | Types.ObjectId) {
  const eId =
    employeeId instanceof Types.ObjectId
      ? employeeId
      : new Types.ObjectId(employeeId);
  return Employee.findByIdAndDelete(eId).exec();
}
