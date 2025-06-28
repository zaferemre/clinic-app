"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Appointment_1 = __importDefault(require("../models/Appointment")); // Adjust path if needed
const node_cron_1 = __importDefault(require("node-cron"));
const MONGO_URI = process.env.MONGO_URI ?? "mongodb://localhost:27017/clinic";
// Only connect/disconnect ONCE for the process
async function connectToDb() {
    if (mongoose_1.default.connection.readyState === 0) {
        await mongoose_1.default.connect(MONGO_URI);
        console.log("[Cron] Connected to MongoDB.");
    }
}
async function markPastAppointmentsDone() {
    const now = new Date();
    const result = await Appointment_1.default.updateMany({
        status: "upcoming",
        end: { $lt: now },
    }, { $set: { status: "done" } });
}
// Main function to setup cron job
async function main() {
    await connectToDb();
    // Schedule: Every 5 minutes
    node_cron_1.default.schedule("*/5 * * * *", async () => {
        try {
            await markPastAppointmentsDone();
        }
        catch (err) {
            console.error("[Cron] Error marking appointments as done:", err);
        }
    });
    console.log("[Cron] Scheduler started. Will mark past appointments every 5 minutes.");
}
main().catch((err) => {
    console.error("[Cron] Fatal error:", err);
    process.exit(1);
});
