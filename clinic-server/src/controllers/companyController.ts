// src/controllers/companyController.ts

import { RequestHandler } from "express";
import mongoose from "mongoose";
import Company, { CompanyDoc } from "../models/Company";
import Appointment from "../models/Appointment";
import Patient from "../models/Patient";
import Message from "../models/Message";
import Notification from "../models/Notification";
import Worker from "../models/Worker";
import Service from "../models/Service";
// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: { email?: string; name?: string; picture?: string };
      company?: CompanyDoc;
    }
  }
}

/**
 * Middleware: ensure the authenticated user (req.user.email)
 * is either the ownerEmail or one of the employees.email,
 * and attach the full Company doc to req.company.
 */
export const ensureCompanyAccess: RequestHandler = async (req, res, next) => {
  const userEmail = req.user?.email;
  if (!userEmail) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const company = await Company.findOne({
      $or: [{ ownerEmail: userEmail }, { "employees.email": userEmail }],
    }).exec();

    if (!company) {
      res.status(404).json({ error: "Company not found" });
      return;
    }

    req.company = company;
    next();
  } catch (err) {
    console.error("Error in ensureCompanyAccess:", err);
    next(err);
  }
};

/**
 * POST /company
 * Anyone authenticated can create—but only if they have no existing company.
 */

export const createCompany: RequestHandler = async (req, res, next) => {
  try {
    const ownerEmail = req.user?.email!;
    const ownerName = req.user?.name!;
    const ownerPic = req.user?.picture!;

    // Make sure they don't already have a company
    const exists = await Company.findOne({ ownerEmail }).exec();
    if (exists) {
      res.status(400).json({ error: "Company already exists" });
      return;
    }

    // Build the base payload
    const {
      name,
      companyType,
      address,
      phoneNumber,
      websiteUrl,
      googleUrl,
      location,
      workingHours,
      services,
    } = req.body;

    // Create company and seed employees with the owner
    const company = new Company({
      ownerEmail,
      ownerName,
      ownerImageUrl: ownerPic,
      name,
      companyType,
      address,
      phoneNumber,
      websiteUrl,
      googleUrl,
      location,
      workingHours,
      services,
      roles: ["owner", "admin", "manager", "staff"],
      employees: [
        {
          email: ownerEmail,
          name: ownerName,
          pictureUrl: ownerPic,
          role: "owner",
          // no services or workingHours initially
        },
      ],
    });

    await company.save();
    res.status(201).json(company);
  } catch (err) {
    next(err);
  }
};
/**
 * GET /company or /company/:companyId
 * Returns the company for owner or employee (attached by ensureCompanyAccess).
 */
// GET /company    or    GET /company/:companyId
export const getCompany: RequestHandler = async (req, res, next) => {
  try {
    // 1) If your ensureCompanyAccess middleware ran, it'll have put the doc on req.company
    if (req.company) {
      res.status(200).json(req.company);
      return; // <— just return void here
    }

    // 2) Otherwise, lookup by the logged-in user’s email
    const userEmail = req.user?.email;
    if (!userEmail) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const company = await Company.findOne({
      $or: [{ ownerEmail: userEmail }, { "employees.email": userEmail }],
    }).exec();

    if (!company) {
      res.status(404).json({ error: "Company not found" });
      return;
    }

    res.status(200).json(company);
    return;
  } catch (err) {
    console.error("Error in getCompany:", err);
    next(err); // forward to your error handler
  }
};
/**
 * PATCH /company
 * Only owner can update the top-level fields.
 */
export const updateCompany: RequestHandler = async (req, res, next) => {
  const ownerEmail = req.user?.email;
  if (ownerEmail !== req.company!.ownerEmail) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  try {
    const updated = await Company.findByIdAndUpdate(
      req.company!._id,
      { $set: req.body },
      { new: true }
    ).exec();

    res.json(updated);
    return;
  } catch (err) {
    console.error("Error in updateCompany:", err);
    next(err);
  }
};

/**
 * GET /company/employees
 * Any owner or employee can list all employees.
 */
export const getEmployees: RequestHandler = (req, res) => {
  res.json(req.company!.employees);
};

/**
 * POST /company/:companyId/employees
 * Only owner can add a new employee record (beyond the “join” flow).
 */
export const addEmployee: RequestHandler = async (req, res, next) => {
  const ownerEmail = req.user?.email;
  if (ownerEmail !== req.company!.ownerEmail) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  try {
    const newEmp = req.body; // { email, name?, pictureUrl?, role }
    req.company!.employees.push(newEmp);
    await req.company!.save();
    res.status(201).json(req.company!.employees.at(-1));
    return;
  } catch (err) {
    console.error("Error in addEmployee:", err);
    next(err);
  }
};

/**
 * POST /company/:companyId/join
 * Any authenticated user can “join” if they have a valid joinCode.
 */
export const joinCompany: RequestHandler = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const { joinCode } = req.body as { joinCode?: string };
    const userEmail = req.user?.email;
    const userName = req.user?.name;
    const userPic = req.user?.picture;

    if (!joinCode || joinCode !== companyId) {
      res.status(400).json({ error: "Invalid joinCode" });
      return;
    }
    if (!mongoose.isValidObjectId(companyId)) {
      res.status(400).json({ error: "Invalid company ID" });
      return;
    }

    const company = await Company.findById(companyId).exec();
    if (!company) {
      res.status(404).json({ error: "Company not found" });
      return;
    }

    if (company.ownerEmail === userEmail) {
      res.status(409).json({ error: "Owner cannot join as employee" });
      return;
    }

    if (
      company.employees.some(
        (e: (typeof company.employees)[number]) => e.email === userEmail
      )
    ) {
      res.status(409).json({ error: "Already an employee" });
      return;
    }

    company.employees.push({
      email: userEmail,
      name: userName,
      pictureUrl: userPic,
      role: "staff",
    });
    await company.save();

    res
      .status(200)
      .json({ message: "Joined company", employees: company.employees });
    return;
  } catch (err: any) {
    console.error("Error in joinCompany:", err);
    res.status(500).json({ error: "Server error", details: err.message });
    return;
  }
};

/**
 * GET /company/:companyId/schedule/:employeeId
 * Any owner or employee may view schedules—but non-owners can only fetch their own.
 */
export const getEmployeeSchedule: RequestHandler = async (req, res, next) => {
  try {
    const userEmail = req.user?.email;
    const company = req.company!;
    const { employeeId } = req.params;

    // If not owner, ensure employeeId matches logged-in user (use email as identifier)
    const employee = company.employees.find(
      (e: (typeof company.employees)[number]) => e.email === employeeId
    );
    if (userEmail !== company.ownerEmail && employee?.email !== userEmail) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const appts = await Appointment.find({
      companyId: company._id,
      employeeId,
    }).exec();

    res.json(appts);
    return;
  } catch (err) {
    console.error("Error in getEmployeeSchedule:", err);
    next(err);
  }
};

/**
 * PATCH /company/:companyId/working-hours
 * Only owner updates working hours.
 */
export const updateWorkingHours: RequestHandler = async (req, res, next) => {
  const ownerEmail = req.user?.email;
  if (ownerEmail !== req.company!.ownerEmail) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  try {
    req.company!.workingHours = req.body.workingHours;
    await req.company!.save();
    res.json(req.company!.workingHours);
    return;
  } catch (err) {
    console.error("Error in updateWorkingHours:", err);
    next(err);
  }
};

/**
 * PATCH /company/:companyId/services
 * Only owner updates service offerings.
 */
export const updateServices: RequestHandler = async (req, res, next) => {
  const ownerEmail = req.user?.email;
  if (ownerEmail !== req.company!.ownerEmail) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  try {
    req.company!.services = req.body.services;
    await req.company!.save();
    res.json(req.company!.services);
    return;
  } catch (err) {
    console.error("Error in updateServices:", err);
    next(err);
  }
};

/**
 * GET /company/:companyId/appointments
 * Any owner or employee can view all appointments.
 */
export const getAppointments: RequestHandler = async (req, res, next) => {
  try {
    const companyId = req.company!._id;
    const appointments = await Appointment.find({ companyId })
      .populate("patientId", "name")
      .exec();

    const events = appointments.map((appt) => ({
      title: appt.patientId?.name,
      start: appt.start,
      end: appt.end,
      extendedProps: { employeeEmail: appt.employeeEmail },
      color: (() => {
        if (appt.status === "done") return "#6b7280";
        if (appt.status === "cancelled") return "#ef4444";
        return "#3b82f6";
      })(),
    }));

    res.status(200).json(events);
  } catch (err) {
    console.error("Error in getAppointments:", err);
    next(err);
  }
};
/**   get services
 * GET /company/:companyId/services
 * Any owner or employee can view service offerings.
 *
 *
 */
export const getServices: RequestHandler = (req, res) => {
  res.json(req.company!.services);
};

// POST /company/:companyId/employees
export const addOrUpdateEmployee: RequestHandler = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const { email, name, role, pictureUrl } = req.body;

    if (!mongoose.isValidObjectId(companyId)) {
      res.status(400).json({ error: "Invalid company ID" });
      return;
    }

    if (!email) {
      res.status(400).json({ error: "Missing employee email" });
      return;
    }

    const company = await Company.findById(companyId).exec();
    if (!company) {
      res.status(404).json({ error: "Company not found" });
      return;
    }

    // Check if employee exists
    const existingEmployeeIndex = company.employees.findIndex(
      (e: { email: string }) => e.email === email
    );
    if (existingEmployeeIndex >= 0) {
      // Update employee info
      company.employees[existingEmployeeIndex] = {
        ...company.employees[existingEmployeeIndex].toObject(),
        name,
        role,
        pictureUrl,
      };
    } else {
      // Add new employee
      company.employees.push({ email, name, role, pictureUrl });
    }

    await company.save();

    res
      .status(200)
      .json({ message: "Employee updated", employees: company.employees });
    return;
  } catch (error: any) {
    console.error("Error in addOrUpdateEmployee:", error);
    res.status(500).json({ error: "Server error", details: error.message });
    return;
  }
};

export const deleteCompany: RequestHandler = async (req, res, next) => {
  try {
    const company = req.company!; // set by ensureCompanyAccess
    if (req.user!.email !== company.ownerEmail) {
      res.status(403).json({ error: "Only owner can delete company" });
      return;
    }
    const cid = company._id;

    // Cascade delete all data for this company
    await Promise.all([
      Appointment.deleteMany({ companyId: cid }),
      Patient.deleteMany({ companyId: cid }),
      Message.deleteMany({ companyId: cid }),
      Notification.deleteMany({ companyId: cid }),
      Worker.deleteMany({ companyId: cid }),
      Service.deleteMany({ companyId: cid }),
    ]);

    // Finally remove the company itself
    await Company.findByIdAndDelete(company._id);
    res.json({ success: true });
    return;
  } catch (err) {
    next(err);
  }
};
// POST /company/:companyId/leave
export const leaveCompany: RequestHandler = async (req, res, next) => {
  try {
    const userEmail = req.user?.email;
    const { companyId } = req.params;

    const company = await Company.findById(companyId);
    if (!company) {
      res.status(404).json({ error: "Company not found" });
      return;
    }

    if (company.ownerEmail === userEmail) {
      res.status(400).json({ error: "Owner cannot leave their own company" });
      return;
    }

    company.employees = company.employees.filter(
      (e: (typeof company.employees)[number]) => e.email !== userEmail
    );
    await company.save();

    res.json({ success: true });
    return;
  } catch (err) {
    next(err);
    return;
  }
};
