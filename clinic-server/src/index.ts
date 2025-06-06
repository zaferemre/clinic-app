// src/index.ts (or src/app.ts)

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./config/mongoose";
import { verifyFirebaseToken } from "./middlewares/verifyFirebaseToken";

// Import routers
import clinicRoutes from "./routes/clinicRoutes";
import patientRoutes from "./routes/patientRoutes";
import appointmentRoutes from "./routes/appointmentRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import workerRoutes from "./routes/workerRoutes";
import messageRoutes from "./routes/messageRoutes";

const app = express();

// CORS + JSON
app.use(
  cors({
    origin: [
      "https://sweet-fascination-production.up.railway.app",
      "http://localhost:5173",
    ],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// ───────────────────────────────────────────────────────────────────────────
// 1) Mount /clinic/by-email (no JWT check)
//    This ensures that React’s fetch(`${API_BASE}/clinic/by-email`)
//    sees your getClinicByEmail controller instead of being stopped by verifyFirebaseToken.
// ───────────────────────────────────────────────────────────────────────────
// 1) Mount clinicRoutes (which includes /by-email, /new, /:clinicId, /:clinicId/join, and /:clinicId/workers):
app.use("/clinic", clinicRoutes);

// 2) Only after that, mount the global verifyFirebaseToken for any other /clinic sub‐routers:
//    (patients, appointments, notifications, etc.)
app.use("/clinic", verifyFirebaseToken);

// 3) Mount the rest of your protected /clinic sub‐routers:
app.use("/clinic", patientRoutes);
app.use("/clinic", appointmentRoutes);
app.use("/clinic", notificationRoutes);
app.use("/clinic", workerRoutes);
app.use("/clinic", messageRoutes);
// ───────────────────────────────────────────────────────────────────────────
// 4) Fallback 404
// ───────────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ───────────────────────────────────────────────────────────────────────────
// 5) Connect to MongoDB and start listening
// ───────────────────────────────────────────────────────────────────────────
connectDB().then(() => {
  app.listen(process.env.PORT ?? 3001, () => {
    console.log(`🚀 Server running on port ${process.env.PORT ?? 3001}`);
  });
});
