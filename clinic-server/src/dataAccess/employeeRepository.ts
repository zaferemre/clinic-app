import Company from "../models/Company";

export function findByCompany(companyId: string) {
  return Company.findById(companyId).then((c) => {
    if (!c) {
      const error = new Error("Company not found");
      (error as any).status = 404;
      throw error;
    }
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
    if (!c) {
      const error = new Error("Company not found");
      (error as any).status = 404;
      throw error;
    }
    c.employees.push(dto);
    return c.save().then(() => c.employees.at(-1));
  });
}

export function updateEmployee(
  companyId: string,
  employeeId: string,
  updates: any
) {
  return Company.findById(companyId).then((c) => {
    if (!c) {
      const error = new Error("Company not found");
      (error as any).status = 404;
      throw error;
    }
    const emp = c.employees.id(employeeId);
    if (!emp) {
      const error = new Error("Employee not found");
      (error as any).status = 404;
      throw error;
    }
    Object.assign(emp, updates);
    return c.save().then(() => emp);
  });
}

export function deleteEmployee(companyId: string, employeeId: string) {
  return Company.findById(companyId).then((c) => {
    if (!c) {
      const error = new Error("Company not found");
      (error as any).status = 404;
      throw error;
    }
    c.employees = c.employees.filter(
      (emp: any) => emp._id!.toString() !== employeeId
    );
    return c.save();
  });
}
