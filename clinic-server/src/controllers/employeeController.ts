// src/controllers/employeeController.ts

import { RequestHandler } from "express";
import Company from "../models/Company";

/**
 * List all employees (includes owner as first entry)
 */
export const listEmployees: RequestHandler = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const company = await Company.findById(companyId).exec();
    if (!company) {
      res.status(404).json({ error: "Company not found" });
      return;
    }

    const owner = {
      _id: "owner",
      email: company.ownerEmail,
      name: company.ownerName,
      role: "owner" as const,
      pictureUrl: company.ownerImageUrl,
    };
    res.json([owner, ...company.employees]);
  } catch (err) {
    next(err);
  }
};

/**
 * Add a new employee to a company
 */
export const addEmployee: RequestHandler = async (req, res, next) => {
  try {
    const { companyId } = req.params;
    const company = await Company.findById(companyId).exec();
    if (!company) {
      res.status(404).json({ error: "Company not found" });
      return;
    }

    const { name, email, role, pictureUrl, workingHours, services } = req.body;
    company.employees.push({
      name,
      email,
      role,
      pictureUrl,
      workingHours,
      services,
    });
    await company.save();
    const newEmp = company.employees[company.employees.length - 1];
    res.status(201).json(newEmp);
  } catch (err) {
    next(err);
  }
};

/**
 * Update an existing employee by subdocument _id
 */
export const updateEmployee: RequestHandler = async (req, res, next) => {
  try {
    const { companyId, employeeId } = req.params;
    const company = await Company.findById(companyId).exec();
    if (!company) {
      res.status(404).json({ error: "Company not found" });
      return;
    }

    const employee = company.employees.id(employeeId);
    if (!employee) {
      res.status(404).json({ error: "Employee not found" });
      return;
    }

    Object.assign(employee, req.body);
    await company.save();
    res.json(employee);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete an employee by subdocument _id
 */
export const deleteEmployee: RequestHandler = async (req, res, next) => {
  try {
    const { companyId, employeeId } = req.params;
    const company = await Company.findById(companyId).exec();
    if (!company) {
      res.status(404).json({ error: "Company not found" });
      return;
    }

    company.employees = company.employees.filter(
      (emp: (typeof company.employees)[0]) => emp._id!.toString() !== employeeId
    );
    await company.save();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
