// src/routes/EmployeeRoutes.ts
import express, { Request, Response } from "express";
import Company from "../models/Company";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";
import { authorizeCompanyAccess } from "../middlewares/authorizeCompanyAccess";

const router = express.Router();

// Helper to wrap async route handlers and pass errors to next()
function asyncHandler(
  fn: (req: Request, res: Response, next: express.NextFunction) => Promise<any>
) {
  return function (req: Request, res: Response, next: express.NextFunction) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

router.get(
  "/:companyId/employees",
  verifyFirebaseToken,
  authorizeCompanyAccess,
  asyncHandler(async (req: Request, res: Response) => {
    const { companyId } = req.params;
    const company = await Company.findById(companyId).exec();
    if (!company) return res.status(404).json({ error: "Company not found" });
    // Include owner as employee with role 'owner'
    const ownerAsEmployee = {
      _id: "owner",
      email: company.ownerEmail,
      name: company.ownerEmail,
      role: "owner",
      pictureUrl: "", // Optionally add image
    };
    // Send owner as first element + all other employees
    const employees = [ownerAsEmployee, ...(company.employees ?? [])];
    res.json(employees);
  })
);

router.post(
  "/:companyId/employees",
  verifyFirebaseToken,
  authorizeCompanyAccess,
  asyncHandler(async (req: Request, res: Response) => {
    const { companyId } = req.params;
    const { name, email, role, pictureUrl, workingHours, services } = req.body;
    const company = await Company.findById(companyId).exec();
    if (!company) return res.status(404).json({ error: "Company not found" });

    const newEmployee = {
      name,
      email,
      role,
      pictureUrl,
      workingHours,
      services,
    };
    company.employees.push(newEmployee);
    await company.save();
    res.status(201).json(company.employees.at(-1));
  })
);

router.patch(
  "/:companyId/employees/:employeeId",
  verifyFirebaseToken,
  authorizeCompanyAccess,
  asyncHandler(async (req: Request, res: Response) => {
    const { companyId, employeeId } = req.params;
    const company = await Company.findById(companyId).exec();
    if (!company) return res.status(404).json({ error: "Company not found" });

    // Find the employee subdoc by _id (as string)
    const employee = company.employees.id(employeeId);
    if (!employee) return res.status(404).json({ error: "Employee not found" });

    // Apply updates (shallow)
    Object.assign(employee, req.body);

    await company.save();
    res.json(employee);
  })
);

router.delete(
  "/:companyId/employees/:employeeId",
  verifyFirebaseToken,
  authorizeCompanyAccess,
  asyncHandler(async (req: Request, res: Response) => {
    const { companyId, employeeId } = req.params;
    const company = await Company.findById(companyId).exec();
    if (!company) return res.status(404).json({ error: "Company not found" });

    // Remove employee by _id
    company.employees = company.employees.filter(
      (emp: any) => emp._id.toString() !== employeeId
    );
    await company.save();
    res.json({ success: true });
  })
);

export default router;
