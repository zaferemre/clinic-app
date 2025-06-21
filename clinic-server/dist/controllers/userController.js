"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserAccount = void 0;
const Company_1 = __importDefault(require("../models/Company"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
// DELETE /company/user
const deleteUserAccount = async (req, res, next) => {
    try {
        const email = req.user.email;
        const uid = req.user.uid;
        // Remove from all companies
        await Company_1.default.updateMany({ employees: email }, { $pull: { employees: email } });
        // Delete from Firebase
        await firebase_admin_1.default.auth().deleteUser(uid);
        res.sendStatus(204);
    }
    catch (err) {
        next(err);
    }
};
exports.deleteUserAccount = deleteUserAccount;
