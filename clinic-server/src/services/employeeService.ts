import Employee, { EmployeeDocument } from "../models/Employee";
import mongoose from "mongoose";

// Add or update an employee
export async function addEmployee(
  companyId: string,
  clinicId: string,
  data: Partial<EmployeeDocument>,
  userId: string
): Promise<EmployeeDocument> {
  let emp = await Employee.findOne({
    companyId: new mongoose.Types.ObjectId(companyId),
    email: data.email,
  });
  if (!emp) {
    emp = new Employee({
      companyId: new mongoose.Types.ObjectId(companyId),
      clinicId: new mongoose.Types.ObjectId(clinicId),
      userId,
      email: data.email,
      name: data.name,
      role: data.role || "other",
      pictureUrl: data.pictureUrl || "",
      services: [],
      workingHours: [],
      isActive: true,
    });
    await emp.save();
  } else {
    emp.clinicId = new mongoose.Types.ObjectId(clinicId) as any;
    if (data.name) emp.name = data.name;
    if (data.role) emp.role = data.role;
    if (data.pictureUrl) emp.pictureUrl = data.pictureUrl;
    await emp.save();
  }
  return emp;
}

export async function removeEmployeeByEmail(companyId: string, email: string) {
  await Employee.deleteOne({
    companyId: new mongoose.Types.ObjectId(companyId),
    email,
  });
}

export async function deleteEmployeeByEmail(email: string) {
  await Employee.deleteMany({ email });
}

export async function listEmployees(companyId: string, clinicId?: string) {
  const filter: Record<string, any> = {
    companyId: new mongoose.Types.ObjectId(companyId),
  };

  if (clinicId) {
    filter.clinicId = new mongoose.Types.ObjectId(clinicId);
  }

  return Employee.find(filter).exec();
}

export async function updateEmployee(
  employeeId: string,
  updates: Partial<EmployeeDocument>
) {
  return Employee.findByIdAndUpdate(employeeId, updates, { new: true }).exec();
}

export async function deleteEmployee(employeeId: string) {
  return Employee.findByIdAndDelete(employeeId).exec();
}
