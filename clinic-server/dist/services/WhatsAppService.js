"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWhatsApp = sendWhatsApp;
exports.processScheduledMessage = processScheduledMessage;
// src/services/WhatsAppService.ts
const twilio_1 = __importDefault(require("twilio"));
const Patient_1 = __importDefault(require("../models/Patient"));
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = (0, twilio_1.default)(accountSid, authToken);
const TWILIO_WHATSAPP_NUMBER = "whatsapp:+12345551234"; // your Twilio WhatsApp sender
async function sendWhatsApp(toPhone, message) {
    try {
        await client.messages.create({
            body: message,
            from: TWILIO_WHATSAPP_NUMBER,
            to: `whatsapp:${toPhone}`,
        });
    }
    catch (err) {
        console.error("WhatsApp send error:", err);
        throw err;
    }
}
// A helper that, given a Message doc, finds the patient’s phone and sends.
async function processScheduledMessage(msgDoc) {
    if (msgDoc.sent)
        return; // skip already sent
    // If patientId is null, broadcast to all clinic’s patients
    if (!msgDoc.patientId) {
        const patients = await Patient_1.default.find({ clinicId: msgDoc.clinicId }).exec();
        await Promise.all(patients.map((p) => sendWhatsApp(p.phone, msgDoc.text)));
    }
    else {
        const patient = await Patient_1.default.findById(msgDoc.patientId).exec();
        if (patient?.phone) {
            await sendWhatsApp(patient.phone, msgDoc.text);
        }
    }
    // Mark as sent
    msgDoc.sent = true;
    msgDoc.sentAt = new Date();
    await msgDoc.save();
}
