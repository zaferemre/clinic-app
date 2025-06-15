import Company from "../models/Company";
import Appointment from "../models/Appointment";
import Patient from "../models/Patient";
import Message from "../models/Message";
import Notification from "../models/Notification";
import Worker from "../models/Worker";
import Service from "../models/Service";
import { auth } from "../thirdParty/firebaseAdminService";

export function create(data: any) {
  return new Company(data).save();
}

export function findByIdWithAccessCheck(companyId: string, email: string) {
  return Company.findOne({
    _id: companyId,
    $or: [{ ownerEmail: email }, { "employees.email": email }],
  }).exec();
}

export function updateByIdWithOwnerCheck(
  companyId: string,
  email: string,
  updates: any
) {
  return Company.findOneAndUpdate(
    { _id: companyId, ownerEmail: email },
    updates,
    { new: true }
  ).exec();
}

export async function deleteByIdWithCascade(companyId: string, email: string) {
  const c = await Company.findOne({ _id: companyId, ownerEmail: email }).exec();
  if (!c)
    throw new Error(JSON.stringify({ status: 403, message: "Forbidden" }));
  await Promise.all([
    Appointment.deleteMany({ companyId }),
    Patient.deleteMany({ companyId }),
    Message.deleteMany({ companyId }),
    Notification.deleteMany({ companyId }),
    Worker.deleteMany({ companyId }),
    Service.deleteMany({ companyId }),
  ]);
  return Company.deleteOne({ _id: companyId }).exec();
}

export function listEmployees(companyId: string) {
  return Company.findById(companyId).then((c) => {
    if (!c)
      throw new Error(
        JSON.stringify({ status: 404, message: "Company not found" })
      );
    const owner = {
      _id: "owner",
      email: c.ownerEmail,
      name: c.ownerName,
      role: "owner" as const,
      pictureUrl: c.ownerImageUrl,
    };
    return [owner, ...c.employees];
  });
}

export function addEmployee(companyId: string, dto: any) {
  return Company.findById(companyId).then((c) => {
    if (!c)
      throw new Error(
        JSON.stringify({ status: 404, message: "Company not found" })
      );
    c.employees.push(dto);
    return c.save().then(() => c.employees.slice(-1)[0]);
  });
}

export function updateEmployee(
  companyId: string,
  employeeId: string,
  updates: any
) {
  return Company.findById(companyId).then((c) => {
    if (!c)
      throw new Error(
        JSON.stringify({ status: 404, message: "Company not found" })
      );
    const emp = c.employees.id(employeeId);
    if (!emp)
      throw new Error(
        JSON.stringify({ status: 404, message: "Employee not found" })
      );
    Object.assign(emp, updates);
    return c.save().then(() => emp);
  });
}

export function deleteEmployee(companyId: string, employeeId: string) {
  return Company.findById(companyId).then((c) => {
    if (!c)
      throw new Error(
        JSON.stringify({ status: 404, message: "Company not found" })
      );
    c.employees = c.employees.filter(
      (e: any) => e._id!.toString() !== employeeId
    );
    return c.save();
  });
}

export function joinCompany(companyId: string, joinCode: string, user: any) {
  return Company.findById(companyId).then((c) => {
    if (!c)
      throw new Error(
        JSON.stringify({ status: 404, message: "Company not found" })
      );
    if (joinCode !== companyId)
      throw new Error(
        JSON.stringify({ status: 400, message: "Invalid joinCode" })
      );
    if (c.ownerEmail === user.email)
      throw new Error(
        JSON.stringify({ status: 409, message: "Owner cannot join" })
      );
    if (c.employees.some((e: any) => e.email === user.email)) {
      throw new Error(
        JSON.stringify({ status: 409, message: "Already an employee" })
      );
    }
    c.employees.push({
      email: user.email,
      name: user.name,
      pictureUrl: user.picture,
      role: "staff",
    });
    return c.save().then(() => ({ message: "Joined", employees: c.employees }));
  });
}

export function getEmployeeSchedule(
  companyId: string,
  employeeId: string,
  requesterEmail: string
) {
  return Company.findById(companyId).then(async (c) => {
    if (!c)
      throw new Error(
        JSON.stringify({ status: 404, message: "Company not found" })
      );
    const isOwner = c.ownerEmail === requesterEmail;
    const isSelf = c.employees.some(
      (e: any) => e.email === requesterEmail && e.email === employeeId
    );
    if (!isOwner && !isSelf)
      throw new Error(JSON.stringify({ status: 403, message: "Forbidden" }));
    return Appointment.find({ companyId, employeeEmail: employeeId }).exec();
  });
}

export function getServices(companyId: string) {
  return Company.findById(companyId).then((c) => {
    if (!c)
      throw new Error(
        JSON.stringify({ status: 404, message: "Company not found" })
      );
    return c.services;
  });
}

export function deleteUserAccount(email: string, uid?: string) {
  return Company.updateMany({}, { $pull: { employees: { email } } }).then(
    async () => {
      if (uid) {
        await auth.deleteUser(uid);
      }
    }
  );
}

export async function leaveCompany(companyId: string, userEmail: string) {
  const c = await Company.findById(companyId).exec();
  if (!c)
    throw new Error(
      JSON.stringify({ status: 404, message: "Company not found" })
    );
  if (c.ownerEmail === userEmail)
    throw new Error(
      JSON.stringify({ status: 400, message: "Owner cannot leave" })
    );
  c.employees = c.employees.filter((e: any) => e.email !== userEmail);
  await c.save();
}

/**
 * Find the company where the given email is either owner or employee.
 */
export function findByEmail(email: string) {
  return Company.findOne({
    $or: [{ ownerEmail: email }, { "employees.email": email }],
  }).exec();
}
