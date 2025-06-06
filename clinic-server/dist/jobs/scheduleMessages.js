"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const Message_1 = __importDefault(require("../models/Message"));
const WhatsAppService_1 = require("../services/WhatsAppService");
// Every minute, check for messages whose scheduledFor <= now and sent = false
node_cron_1.default.schedule("* * * * *", async () => {
    try {
        const now = new Date();
        const pending = await Message_1.default.find({
            scheduledFor: { $lte: now },
            sent: false,
        }).exec();
        for (const msg of pending) {
            await (0, WhatsAppService_1.processScheduledMessage)(msg);
        }
    }
    catch (err) {
        console.error("Error in scheduled message job:", err);
    }
});
