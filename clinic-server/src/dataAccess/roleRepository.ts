import Company from "../models/Company";

type Employee = {
  role: string;
  [key: string]: any;
};

type CompanyType = {
  roles: string[];
  employees: Employee[];
  save: () => Promise<CompanyType>;
};

export function listRoles(companyId: string) {
  return Company.findById(companyId).then(
    (c: CompanyType | null) => c?.roles ?? []
  );
}

export function addRole(companyId: string, role: string) {
  return Company.findById(companyId).then((c: CompanyType | null) => {
    if (!c)
      throw new Error(
        JSON.stringify({ status: 404, message: "Company not found" })
      );
    if (c.roles.includes(role))
      throw new Error(JSON.stringify({ status: 409, message: "Role exists" }));
    c.roles.push(role);
    // No need to update employee roles here, as oldRole/newRole are not defined in this context
    return c.save().then(() => c.roles);
  });
}

export function updateRole(
  companyId: string,
  oldRole: string,
  newRole: string
) {
  return Company.findById(companyId).then((c: CompanyType | null) => {
    if (!c)
      throw new Error(
        JSON.stringify({ status: 404, message: "Company not found" })
      );
    const idx = c.roles.indexOf(oldRole);
    if (idx === -1)
      throw new Error(
        JSON.stringify({ status: 404, message: "Role not found" })
      );
    c.roles[idx] = newRole;
    c.employees.forEach((e: Employee) => {
      if (e.role === oldRole) e.role = newRole as any;
    });
    return c.save().then(() => c.roles);
  });
}

export function deleteRole(companyId: string, role: string) {
  return Company.findById(companyId).then((c: CompanyType | null) => {
    if (!c)
      throw new Error(
        JSON.stringify({ status: 404, message: "Company not found" })
      );
    if (!c.roles.includes(role))
      throw new Error(
        JSON.stringify({ status: 404, message: "Role not found" })
      );
    c.roles = c.roles.filter((r: string) => r !== role);
    c.employees.forEach((e: Employee) => {
      if (e.role === role) e.role = "staff";
    });
    return c.save().then(() => c.roles);
  });
}
