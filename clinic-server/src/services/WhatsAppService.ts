// src/services/WhatsAppService.ts
import Twilio from "twilio";
import Patient from "../models/Patient";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const client = Twilio(accountSid, authToken);

const TWILIO_WHATSAPP_NUMBER = "whatsapp:+12345551234"; // your Twilio WhatsApp sender

export async function sendWhatsApp(
  toPhone: string,
  message: string
): Promise<void> {
  try {
    await client.messages.create({
      body: message,
      from: TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${toPhone}`,
    });
  } catch (err) {
    console.error("WhatsApp send error:", err);
    throw err;
  }
}

// A helper that, given a Message doc, finds the patient’s phone and sends.
export async function processScheduledMessage(msgDoc: any) {
  if (msgDoc.sent) return; // skip already sent

  // If patientId is null, broadcast to all clinic’s patients
  if (!msgDoc.patientId) {
    const patients = await Patient.find({ clinicId: msgDoc.clinicId }).exec();
    await Promise.all(patients.map((p) => sendWhatsApp(p.phone!, msgDoc.text)));
  } else {
    const patient = await Patient.findById(msgDoc.patientId).exec();
    if (patient?.phone) {
      await sendWhatsApp(patient.phone, msgDoc.text);
    }
  }

  // Mark as sent
  msgDoc.sent = true;
  msgDoc.sentAt = new Date();
  await msgDoc.save();
}
