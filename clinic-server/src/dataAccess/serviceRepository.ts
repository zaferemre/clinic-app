import Company from "../models/Company";

export function findServices(companyId: string) {
  return Company.findById(companyId).then((c) => {
    if (!c) throw { status: 404, message: "Company not found" };
    return c.services;
  });
}

export function addService(companyId: string, dto: any) {
  return Company.findById(companyId).then((c) => {
    if (!c) throw { status: 404, message: "Company not found" };
    c.services.push(dto);
    return c.save().then(() => c.services.at(-1));
  });
}

export function updateService(
  companyId: string,
  serviceId: string,
  updates: any
) {
  return Company.findById(companyId).then((c) => {
    if (!c) throw { status: 404, message: "Company not found" };
    const svc = c.services.id(serviceId);
    if (!svc) throw { status: 404, message: "Service not found" };
    Object.assign(svc, updates);
    return c.save().then(() => svc);
  });
}

export function deleteService(companyId: string, serviceId: string) {
  return Company.findById(companyId).then((c) => {
    if (!c) throw { status: 404, message: "Company not found" };
    const svc = c.services.id(serviceId);
    if (!svc) throw { status: 404, message: "Service not found" };
    svc.remove();
    return c.save();
  });
}
