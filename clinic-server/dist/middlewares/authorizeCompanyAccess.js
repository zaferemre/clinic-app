"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeCompanyAccess = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Company_1 = __importDefault(require("../models/Company"));
const Employee_1 = __importDefault(require("../models/Employee"));
/**
 * Middleware to check if the authenticated user has access to the specified company.
 * Access is granted if:
 * - User is the owner (by email or userId)
 * - User is found as an employee (by email or userId)
 */
const authorizeCompanyAccess = async (req, res, next) => {
    const { companyId } = req.params;
    const user = req.user; // set by verifyFirebaseToken
    if (!user || !user.email) {
        res.status(401).json({ error: "User not authenticated" });
        return;
    }
    try {
        // Validate company existence
        const company = await Company_1.default.findById(companyId).exec();
        if (!company) {
            res.status(404).json({ error: "Company not found" });
            return;
        }
        // --- Owner access: check email and userId ---
        if (company.ownerEmail === user.email ||
            (company.ownerUserId && company.ownerUserId === user.uid)) {
            req.company = company;
            return next();
        }
        // --- Employee access: check by email or userId ---
        const employee = await Employee_1.default.findOne({
            companyId: new mongoose_1.default.Types.ObjectId(companyId),
            $or: [{ email: user.email }, { userId: user.uid }],
        }).exec();
        if (employee) {
            req.company = company;
            return next();
        }
        // --- Otherwise: forbidden ---
        res.status(403).json({ error: "Unauthorized access" });
    }
    catch (err) {
        console.error("Error in authorizeCompanyAccess:", err);
        res.status(500).json({ error: "Server error" });
    }
};
exports.authorizeCompanyAccess = authorizeCompanyAccess;
