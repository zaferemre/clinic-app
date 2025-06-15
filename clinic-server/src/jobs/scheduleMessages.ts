import cron from "node-cron";
import * as appointmentService from "../services/notificationService";

// runs every minute
cron.schedule("* * * * *", async () => {
  try {
    await appointmentService.processPending();
  } catch (err) {
    console.error("Scheduled job error:", err);
  }
});
