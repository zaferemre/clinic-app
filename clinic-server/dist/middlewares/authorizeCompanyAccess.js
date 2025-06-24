"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeCompanyAccess = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Company_1 = __importDefault(require("../models/Company"));
const Employee_1 = __importDefault(require("../models/Employee"));
const authorizeCompanyAccess = async (req, res, next) => {
    const { companyId } = req.params;
    const user = req.user;
    if (!user?.uid) {
        res.status(401).json({ error: "User not authenticated" });
        return;
    }
    try {
        const company = await Company_1.default.findById(companyId).exec();
        if (!company) {
            res.status(404).json({ error: "Company not found" });
            return;
        }
        // Owner access by userId
        if (company.ownerUid && company.ownerUid.toString() === user.uid) {
            req.company = company;
            return next();
        }
        // Employee access by userId
        const emp = await Employee_1.default.findOne({
            companyId: new mongoose_1.default.Types.ObjectId(companyId),
            userUid: user.uid,
        }).exec();
        if (emp) {
            req.company = company;
            return next();
        }
        res.status(403).json({ error: "Unauthorized access" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};
exports.authorizeCompanyAccess = authorizeCompanyAccess;
