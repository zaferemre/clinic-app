import cron from "node-cron";
import Message from "../models/Message";
import { processScheduledMessage } from "../services/WhatsAppService";

// Every minute, check for messages whose scheduledFor <= now and sent = false
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    const pending = await Message.find({
      scheduledFor: { $lte: now },
      sent: false,
    }).exec();
    for (const msg of pending) {
      await processScheduledMessage(msg);
    }
  } catch (err) {
    console.error("Error in scheduled message job:", err);
  }
});
