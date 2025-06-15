"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.findPendingByCompany = findPendingByCompany;
exports.create = create;
exports.markDone = markDone;
exports.processAllPending = processAllPending;
const Notification_1 = __importDefault(require("../models/Notification"));
function findPendingByCompany(companyId) {
    return Notification_1.default.find({ companyId, type: "call", status: "pending" })
        .populate("patientId", "name")
        .exec()
        .then((list) => list.map((n) => ({
        id: n._id.toString(),
        patientId: n.patientId._id.toString(),
        patientName: n.patientId.name,
        createdAt: n.createdAt.toISOString(),
        isCalled: n.status === "done",
        note: n.note ?? "",
    })));
}
function create(data) {
    // create a new notification
    return new Notification_1.default(data).save();
}
function markDone(companyId, notificationId) {
    return Notification_1.default.findOneAndUpdate({ _id: notificationId, companyId }, { status: "done" }).exec();
}
async function processAllPending() {
    const now = new Date();
    const pending = await Notification_1.default.find({
        scheduledFor: { $lte: now },
        sent: false,
    }).exec();
    for (const msg of pending) {
        // you might delegate to a service here
        msg.status = "done";
        msg.sent = true;
        msg.sentAt = new Date();
        await msg.save();
    }
}
