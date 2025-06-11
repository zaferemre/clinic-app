"use strict";
// src/controllers/companyController.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addOrUpdateEmployee = exports.getServices = exports.getAppointments = exports.updateServices = exports.updateWorkingHours = exports.getEmployeeSchedule = exports.joinCompany = exports.addEmployee = exports.getEmployees = exports.updateCompany = exports.getCompany = exports.createCompany = exports.ensureCompanyAccess = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Company_1 = __importDefault(require("../models/Company"));
const Appointment_1 = __importDefault(require("../models/Appointment"));
/**
 * Middleware: ensure the authenticated user (req.user.email)
 * is either the ownerEmail or one of the employees.email,
 * and attach the full Company doc to req.company.
 */
const ensureCompanyAccess = async (req, res, next) => {
    const userEmail = req.user?.email;
    if (!userEmail) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    try {
        const company = await Company_1.default.findOne({
            $or: [{ ownerEmail: userEmail }, { "employees.email": userEmail }],
        }).exec();
        if (!company) {
            res.status(404).json({ error: "Company not found" });
            return;
        }
        req.company = company;
        next();
    }
    catch (err) {
        console.error("Error in ensureCompanyAccess:", err);
        next(err);
    }
};
exports.ensureCompanyAccess = ensureCompanyAccess;
/**
 * POST /company
 * Anyone authenticated can create—but only if they have no existing company.
 */
const createCompany = async (req, res, next) => {
    const ownerEmail = req.user?.email;
    if (!ownerEmail) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    try {
        const exists = await Company_1.default.findOne({ ownerEmail }).exec();
        if (exists) {
            res.status(400).json({ error: "Company already exists" });
            return;
        }
        const company = new Company_1.default({
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
            employees: [],
        });
        await company.save();
        res.status(201).json(company);
        return;
    }
    catch (err) {
        console.error("Error in createCompany:", err);
        next(err);
    }
};
exports.createCompany = createCompany;
/**
 * GET /company or /company/:companyId
 * Returns the company for owner or employee (attached by ensureCompanyAccess).
 */
// GET /company    or    GET /company/:companyId
const getCompany = async (req, res, next) => {
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
        const company = await Company_1.default.findOne({
            $or: [{ ownerEmail: userEmail }, { "employees.email": userEmail }],
        }).exec();
        if (!company) {
            res.status(404).json({ error: "Company not found" });
            return;
        }
        res.status(200).json(company);
        return;
    }
    catch (err) {
        console.error("Error in getCompany:", err);
        next(err); // forward to your error handler
    }
};
exports.getCompany = getCompany;
/**
 * PATCH /company
 * Only owner can update the top-level fields.
 */
const updateCompany = async (req, res, next) => {
    const ownerEmail = req.user?.email;
    if (ownerEmail !== req.company.ownerEmail) {
        res.status(403).json({ error: "Forbidden" });
        return;
    }
    try {
        const updated = await Company_1.default.findByIdAndUpdate(req.company._id, { $set: req.body }, { new: true }).exec();
        res.json(updated);
        return;
    }
    catch (err) {
        console.error("Error in updateCompany:", err);
        next(err);
    }
};
exports.updateCompany = updateCompany;
/**
 * GET /company/employees
 * Any owner or employee can list all employees.
 */
const getEmployees = (req, res) => {
    res.json(req.company.employees);
};
exports.getEmployees = getEmployees;
/**
 * POST /company/:companyId/employees
 * Only owner can add a new employee record (beyond the “join” flow).
 */
const addEmployee = async (req, res, next) => {
    const ownerEmail = req.user?.email;
    if (ownerEmail !== req.company.ownerEmail) {
        res.status(403).json({ error: "Forbidden" });
        return;
    }
    try {
        const newEmp = req.body; // { email, name?, pictureUrl?, role }
        req.company.employees.push(newEmp);
        await req.company.save();
        res.status(201).json(req.company.employees.at(-1));
        return;
    }
    catch (err) {
        console.error("Error in addEmployee:", err);
        next(err);
    }
};
exports.addEmployee = addEmployee;
/**
 * POST /company/:companyId/join
 * Any authenticated user can “join” if they have a valid joinCode.
 */
const joinCompany = async (req, res, next) => {
    try {
        const { companyId } = req.params;
        const { joinCode } = req.body;
        const userEmail = req.user?.email;
        const userName = req.user?.name;
        const userPic = req.user?.picture;
        if (!joinCode || joinCode !== companyId) {
            res.status(400).json({ error: "Invalid joinCode" });
            return;
        }
        if (!mongoose_1.default.isValidObjectId(companyId)) {
            res.status(400).json({ error: "Invalid company ID" });
            return;
        }
        const company = await Company_1.default.findById(companyId).exec();
        if (!company) {
            res.status(404).json({ error: "Company not found" });
            return;
        }
        if (company.ownerEmail === userEmail) {
            res.status(409).json({ error: "Owner cannot join as employee" });
            return;
        }
        if (company.employees.some((e) => e.email === userEmail)) {
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
    }
    catch (err) {
        console.error("Error in joinCompany:", err);
        res.status(500).json({ error: "Server error", details: err.message });
        return;
    }
};
exports.joinCompany = joinCompany;
/**
 * GET /company/:companyId/schedule/:employeeId
 * Any owner or employee may view schedules—but non-owners can only fetch their own.
 */
const getEmployeeSchedule = async (req, res, next) => {
    try {
        const userEmail = req.user?.email;
        const company = req.company;
        const { employeeId } = req.params;
        // If not owner, ensure employeeId matches logged-in user (use email as identifier)
        const employee = company.employees.find((e) => e.email === employeeId);
        if (userEmail !== company.ownerEmail && employee?.email !== userEmail) {
            res.status(403).json({ error: "Forbidden" });
            return;
        }
        const appts = await Appointment_1.default.find({
            companyId: company._id,
            employeeId,
        }).exec();
        res.json(appts);
        return;
    }
    catch (err) {
        console.error("Error in getEmployeeSchedule:", err);
        next(err);
    }
};
exports.getEmployeeSchedule = getEmployeeSchedule;
/**
 * PATCH /company/:companyId/working-hours
 * Only owner updates working hours.
 */
const updateWorkingHours = async (req, res, next) => {
    const ownerEmail = req.user?.email;
    if (ownerEmail !== req.company.ownerEmail) {
        res.status(403).json({ error: "Forbidden" });
        return;
    }
    try {
        req.company.workingHours = req.body.workingHours;
        await req.company.save();
        res.json(req.company.workingHours);
        return;
    }
    catch (err) {
        console.error("Error in updateWorkingHours:", err);
        next(err);
    }
};
exports.updateWorkingHours = updateWorkingHours;
/**
 * PATCH /company/:companyId/services
 * Only owner updates service offerings.
 */
const updateServices = async (req, res, next) => {
    const ownerEmail = req.user?.email;
    if (ownerEmail !== req.company.ownerEmail) {
        res.status(403).json({ error: "Forbidden" });
        return;
    }
    try {
        req.company.services = req.body.services;
        await req.company.save();
        res.json(req.company.services);
        return;
    }
    catch (err) {
        console.error("Error in updateServices:", err);
        next(err);
    }
};
exports.updateServices = updateServices;
/**
 * GET /company/:companyId/appointments
 * Any owner or employee can view all appointments.
 */
const getAppointments = async (req, res, next) => {
    try {
        const companyId = req.company._id;
        const appointments = await Appointment_1.default.find({ companyId })
            .populate("patientId", "name")
            .exec();
        const events = appointments.map((appt) => ({
            title: appt.patientId?.name,
            start: appt.start,
            end: appt.end,
            extendedProps: { employeeEmail: appt.employeeEmail },
            color: (() => {
                if (appt.status === "done")
                    return "#6b7280";
                if (appt.status === "cancelled")
                    return "#ef4444";
                return "#3b82f6";
            })(),
        }));
        res.status(200).json(events);
    }
    catch (err) {
        console.error("Error in getAppointments:", err);
        next(err);
    }
};
exports.getAppointments = getAppointments;
/**   get services
 * GET /company/:companyId/services
 * Any owner or employee can view service offerings.
 *
 *
 */
const getServices = (req, res) => {
    res.json(req.company.services);
};
exports.getServices = getServices;
// POST /company/:companyId/employees
const addOrUpdateEmployee = async (req, res, next) => {
    try {
        const { companyId } = req.params;
        const { email, name, role, pictureUrl } = req.body;
        if (!mongoose_1.default.isValidObjectId(companyId)) {
            res.status(400).json({ error: "Invalid company ID" });
            return;
        }
        if (!email) {
            res.status(400).json({ error: "Missing employee email" });
            return;
        }
        const company = await Company_1.default.findById(companyId).exec();
        if (!company) {
            res.status(404).json({ error: "Company not found" });
            return;
        }
        // Check if employee exists
        const existingEmployeeIndex = company.employees.findIndex((e) => e.email === email);
        if (existingEmployeeIndex >= 0) {
            // Update employee info
            company.employees[existingEmployeeIndex] = {
                ...company.employees[existingEmployeeIndex].toObject(),
                name,
                role,
                pictureUrl,
            };
        }
        else {
            // Add new employee
            company.employees.push({ email, name, role, pictureUrl });
        }
        await company.save();
        res
            .status(200)
            .json({ message: "Employee updated", employees: company.employees });
        return;
    }
    catch (error) {
        console.error("Error in addOrUpdateEmployee:", error);
        res.status(500).json({ error: "Server error", details: error.message });
        return;
    }
};
exports.addOrUpdateEmployee = addOrUpdateEmployee;
