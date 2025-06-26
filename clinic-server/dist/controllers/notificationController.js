"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.markNotificationDone = exports.listNotifications = exports.createNotification = void 0;
const notificationService = __importStar(require("../services/notificationService"));
// Create notification
const createNotification = async (req, res, next) => {
    try {
        const notif = await notificationService.createNotification(req.params.companyId, req.params.clinicId, req.body);
        res.status(201).json(notif);
    }
    catch (err) {
        next(err);
    }
};
exports.createNotification = createNotification;
// List notifications for a company & clinic
const listNotifications = async (req, res, next) => {
    try {
        const notifications = await notificationService.listNotifications(req.params.companyId, req.params.clinicId);
        res.json(notifications);
    }
    catch (err) {
        next(err);
    }
};
exports.listNotifications = listNotifications;
// Mark a notification as done
const markNotificationDone = async (req, res, next) => {
    try {
        const updated = await notificationService.markNotificationDone(req.params.companyId, req.params.clinicId, req.params.notificationId);
        res.json(updated);
    }
    catch (err) {
        next(err);
    }
};
exports.markNotificationDone = markNotificationDone;
