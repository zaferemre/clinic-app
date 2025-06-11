"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserAccount = void 0;
const Company_1 = __importDefault(require("../models/Company"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const deleteUserAccount = async (req, res, next) => {
    try {
        const email = req.user.email;
        // Remove them from every company’s employee list
        await Company_1.default.updateMany({}, { $pull: { employees: { email } } });
        // If you’re using Firebase Auth, also delete the user record:
        if (req.user.uid) {
            await firebase_admin_1.default.auth().deleteUser(req.user.uid);
        }
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteUserAccount = deleteUserAccount;
