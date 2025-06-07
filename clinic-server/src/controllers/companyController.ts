// src/controllers/companyController.ts

import Company, { ICompany } from "../models/Company";
import { Request, Response, NextFunction } from "express";
// Extend Express Request interface to include 'company' and 'user'
declare global {
  namespace Express {
    interface Request {
      company?: ICompany;
      user?: { email?: string }; // Add user property with email
    }
  }
}

// Middleware to ensure the company exists and attach it to req
export const ensureCompanyExists = async (
  req: any,
  res: any,
  next: any
): Promise<void> => {
  const ownerEmail = req.user?.email;
  if (!ownerEmail) return res.status(401).json({ error: "Unauthorized" });

  try {
    const company = await Company.findOne({ ownerEmail });
    if (!company) return res.status(404).json({ error: "Company not found" });

    req.company = company;
    next();
  } catch (err) {
    next(err);
  }
};

// POST /company → Create a new company
export const createCompany = async (
  req: any,
  res: any,
  next: any
): Promise<void> => {
  const ownerEmail = req.user?.email;
  if (!ownerEmail) return res.status(401).json({ error: "Unauthorized" });

  try {
    const exists = await Company.findOne({ ownerEmail });
    if (exists)
      return res.status(400).json({ error: "Company already exists" });

    const company = new Company({
      ownerEmail,
      name: req.body.name,
      companyType: req.body.companyType,
      address: req.body.address,
      phoneNumber: req.body.phoneNumber,
      googleUrl: req.body.googleUrl,
      websiteUrl: req.body.websiteUrl,
      location: req.body.location,
      workingHours: req.body.workingHours,
      services: req.body.services,
      employees: req.body.employees,
    });

    await company.save();
    res.status(201).json(company);
  } catch (err) {
    next(err);
  }
};

// GET /company → Fetch current user’s company
export const getCompany = async (
  req: any,
  res: any,
  next: any
): Promise<void> => {
  const ownerEmail = req.user?.email;
  if (!ownerEmail) return res.status(401).json({ error: "Unauthorized" });

  try {
    const company = await Company.findOne({ ownerEmail });
    if (!company) return res.status(404).json({ error: "Company not found" });

    res.json(company);
  } catch (err) {
    next(err);
  }
};

// PATCH /company → Update company fields
export const updateCompany = async (
  req: any,
  res: any,
  next: any
): Promise<void> => {
  const ownerEmail = req.user?.email;
  if (!ownerEmail) return res.status(401).json({ error: "Unauthorized" });

  try {
    const updated = await Company.findOneAndUpdate(
      { ownerEmail },
      { $set: req.body },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Company not found" });

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// POST /company/employees → Add new employee to company
export const addEmployee = async (
  req: any,
  res: any,
  next: any
): Promise<void> => {
  const ownerEmail = req.user?.email;
  if (!ownerEmail) return res.status(401).json({ error: "Unauthorized" });

  try {
    const company = await Company.findOne({ ownerEmail });
    if (!company) return res.status(404).json({ error: "Company not found" });

    const newEmployee = req.body;
    company.employees.push(newEmployee);
    await company.save();

    res.status(201).json(company.employees.at(-1)); // Return the newly added employee
  } catch (err) {
    next(err);
  }
};
export const getEmployees = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Assuming you get company by ownerEmail from req.user
    const ownerEmail = req.user?.email;
    if (!ownerEmail) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const company = await Company.findOne({ ownerEmail });
    if (!company) {
      res.status(404).json({ error: "Company not found" });
      return;
    }

    res.json(company.employees);
  } catch (err) {
    next(err);
  }
};

// GET /company/schedule/:employeeId → Get employee schedule
export const getEmployeeSchedule = async (
  req: any,
  res: any,
  next: any
): Promise<void> => {
  const ownerEmail = req.user?.email;
  const { employeeId } = req.params;
  if (!ownerEmail) return res.status(401).json({ error: "Unauthorized" });

  try {
    const company = await Company.findOne({ ownerEmail });
    if (!company) return res.status(404).json({ error: "Company not found" });

    const employee = company.employees.id(employeeId);
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    // Fetch real appointments from Appointment collection
    const appointments = await getAppointmentsForEmployee(
      company._id,
      employeeId
    );
    const workingHours = company.workingHours ?? [];

    const filtered = filterByWorkingHours(appointments, workingHours);
    res.json(filtered);
  } catch (err) {
    next(err);
  }
};

// Fetch appointments from DB for a specific employee
import Appointment from "../models/Appointment"; // Make sure this model exists

async function getAppointmentsForEmployee(companyId: any, employeeId: any) {
  // Replace 'companyId' and 'employeeId' with actual field names in your Appointment schema
  return Appointment.find({ companyId, employeeId });
}

// Placeholder: filter by working hours
function filterByWorkingHours(appointments: any[], workingHours: any[]) {
  return appointments; // add real filtering logic here
}
// PATCH /company/working-hours
export const updateWorkingHours = async (
  req: any,
  res: any,
  next: any
): Promise<void> => {
  const ownerEmail = req.user?.email;
  if (!ownerEmail) return res.status(401).json({ error: "Unauthorized" });
  try {
    const company = await Company.findOneAndUpdate(
      { ownerEmail },
      { $set: { workingHours: req.body.workingHours } },
      { new: true }
    );
    if (!company) return res.status(404).json({ error: "Company not found" });
    res.json(company.workingHours);
  } catch (err) {
    next(err);
  }
};

// PATCH /company/services
export const updateServices = async (
  req: any,
  res: any,
  next: any
): Promise<void> => {
  const ownerEmail = req.user?.email;
  if (!ownerEmail) return res.status(401).json({ error: "Unauthorized" });
  try {
    const company = await Company.findOneAndUpdate(
      { ownerEmail },
      { $set: { services: req.body.services } },
      { new: true }
    );
    if (!company) return res.status(404).json({ error: "Company not found" });
    res.json(company.services);
  } catch (err) {
    next(err);
  }
};
