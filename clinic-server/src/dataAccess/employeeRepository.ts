// dataAccess/employeeRepository.ts
import Employee, { EmployeeDocument } from "../models/Employee";
import { Types } from "mongoose";

// ——— Define a true “create” DTO rather than Partial<EmployeeDocument>
export interface CreateEmployeeInput {
  companyId: Types.ObjectId;
  clinicId: Types.ObjectId;
  userId: string;
  email: string;
  name?: string;
  role: EmployeeDocument["role"];
  pictureUrl?: string;
}

export async function listEmployees(
  companyId: string,
  clinicId?: string
): Promise<EmployeeDocument[]> {
  const filter: any = { companyId: new Types.ObjectId(companyId) };
  if (clinicId) filter.clinicId = new Types.ObjectId(clinicId);
  return Employee.find(filter).populate(["role", "services"]);
}

export async function createEmployee(
  doc: CreateEmployeeInput
): Promise<EmployeeDocument> {
  return Employee.create(doc);
}

export async function findEmployeeById(
  companyId: string,
  clinicId: string,
  employeeId: string
): Promise<EmployeeDocument | null> {
  return Employee.findOne({
    _id: employeeId,
    companyId: new Types.ObjectId(companyId),
    clinicId: new Types.ObjectId(clinicId),
  });
}

export function updateEmployeeById(
  employeeId: string,
  updates: Partial<Pick<EmployeeDocument, "name" | "role" | "pictureUrl">>
) {
  return Employee.findByIdAndUpdate(employeeId, updates, { new: true }).exec();
}

export function deleteEmployeeById(employeeId: string) {
  return Employee.findByIdAndDelete(employeeId).exec();
}

/**
 * Remove _all_ employee docs for this email in this company
 */
export function deleteEmployeesByEmail(companyId: string, email: string) {
  return Employee.deleteMany({
    companyId: new Types.ObjectId(companyId),
    email,
  }).exec();
}
