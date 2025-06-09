"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeCompanyAccess = void 0;
const Company_1 = __importDefault(require("../models/Company"));
const authorizeCompanyAccess = async (req, res, next) => {
    const { companyId } = req.params;
    const userEmail = req.user?.email;
    if (!userEmail) {
        res.status(401).json({ error: "User not authenticated" });
        return;
    }
    try {
        const company = await Company_1.default.findById(companyId).exec();
        if (!company) {
            res.status(404).json({ error: "Company not found" });
            return;
        }
        // Owner or employee can access
        if (company.ownerEmail === userEmail ||
            (company.employees ?? []).some((e) => e.email === userEmail)) {
            req.company = company;
            next();
        }
        else {
            res.status(403).json({ error: "Unauthorized access" });
        }
    }
    catch (err) {
        console.error("Error in authorizeCompanyAccess:", err);
        res.status(500).json({ error: "Server error" });
    }
};
exports.authorizeCompanyAccess = authorizeCompanyAccess;
