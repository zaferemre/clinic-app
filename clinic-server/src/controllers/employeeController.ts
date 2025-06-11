// src/controllers/employeeController.ts
import { Request, Response, NextFunction } from "express";
import Company from "../models/Company";

async function listEmployees(req: Request, res: Response, next: NextFunction) {
  const { companyId } = req.params;
  const company = await Company.findById(companyId).exec();
  if (!company) return res.status(404).json({ error: "Company not found" });

  // include owner as first “employee”
  const owner = {
    _id: "owner",
    email: company.ownerEmail,
    name: company.ownerName,
    role: "owner" as const,
    pictureUrl: company.ownerImageUrl,
  };
  res.json([owner, ...company.employees]);
}

async function addEmployee(req: Request, res: Response, next: NextFunction) {
  const { companyId } = req.params;
  const company = await Company.findById(companyId).exec();
  if (!company) return res.status(404).json({ error: "Company not found" });

  const { name, email, role, pictureUrl, workingHours, services } = req.body;
  const newEmp = { name, email, role, pictureUrl, workingHours, services };
  company.employees.push(newEmp);
  await company.save();
  // return the pushed subdoc
  res.status(201).json(company.employees.at(-1));
}

async function updateEmployee(req: Request, res: Response, next: NextFunction) {
  const { companyId, employeeId } = req.params;
  const company = await Company.findById(companyId).exec();
  if (!company) return res.status(404).json({ error: "Company not found" });

  const employee = company.employees.id(employeeId);
  if (!employee) return res.status(404).json({ error: "Employee not found" });

  Object.assign(employee, req.body);
  await company.save();
  res.json(employee);
}

async function deleteEmployee(req: Request, res: Response, next: NextFunction) {
  const { companyId, employeeId } = req.params;
  const company = await Company.findById(companyId).exec();
  if (!company) return res.status(404).json({ error: "Company not found" });

  company.employees = company.employees.filter(
    (emp: { _id: string }) => emp._id.toString() !== employeeId
  );
  await company.save();
  res.json({ success: true });
}

export { listEmployees, addEmployee, updateEmployee, deleteEmployee };
