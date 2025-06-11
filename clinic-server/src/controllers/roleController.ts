// --- src/controllers/roleController.ts ---
import { RequestHandler } from "express";
export const listRoles: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    const company = req.company!;
    res.json(company.roles);
    return;
  } catch (err) {
    next(err);
  }
};

export const addRole: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    const company = req.company!;
    const { role } = req.body as { role: string };
    if (company.roles.includes(role)) {
      res.status(409).json({ error: "Role already exists" });
      return;
    }
    company.roles.push(role);
    await company.save();
    res.status(201).json(company.roles);
    return;
  } catch (err) {
    next(err);
  }
};

export const updateRole: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    const company = req.company!;
    const { oldRole, newRole } = req.body as {
      oldRole: string;
      newRole: string;
    };
    const idx = company.roles.indexOf(oldRole);
    if (idx === -1) {
      res.status(404).json({ error: "Role not found" });
      return;
    }
    company.roles[idx] = newRole;
    company.employees.forEach((emp) => {
      if (
        emp.role === oldRole &&
        ["staff", "manager", "admin", "owner"].includes(newRole)
      ) {
        emp.role = newRole as "staff" | "manager" | "admin" | "owner";
      }
    });
    await company.save();
    res.json(company.roles);
    return;
  } catch (err) {
    next(err);
  }
};

export const deleteRole: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  try {
    const company = req.company!;
    const { role } = req.params;
    if (!company.roles.includes(role)) {
      res.status(404).json({ error: "Role not found" });
      return;
    }
    company.roles = company.roles.filter((r: string) => r !== role);
    company.employees.forEach((emp) => {
      if (emp.role === role) emp.role = "staff";
    });
    await company.save();
    res.json(company.roles);
    return;
  } catch (err) {
    next(err);
  }
};
