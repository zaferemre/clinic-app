import mongoose from "mongoose";
import Appointment from "../models/Appointment"; // Adjust path if needed
import cron from "node-cron";

const MONGO_URI = process.env.MONGO_URI ?? "mongodb://localhost:27017/clinic";

// Only connect/disconnect ONCE for the process
async function connectToDb() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
    console.log("[Cron] Connected to MongoDB.");
  }
}

async function markPastAppointmentsDone() {
  const now = new Date();
  const result = await Appointment.updateMany(
    {
      status: "upcoming",
      end: { $lt: now },
    },
    { $set: { status: "done" } }
  );
}

// Main function to setup cron job
async function main() {
  await connectToDb();

  // Schedule: Every 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    try {
      await markPastAppointmentsDone();
    } catch (err) {
      console.error("[Cron] Error marking appointments as done:", err);
    }
  });

  console.log(
    "[Cron] Scheduler started. Will mark past appointments every 5 minutes."
  );
}

main().catch((err) => {
  console.error("[Cron] Fatal error:", err);
  process.exit(1);
});
