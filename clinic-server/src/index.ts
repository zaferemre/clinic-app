// src/index.ts (or src/app.ts)

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./config/mongoose";
import { verifyFirebaseToken } from "./middlewares/verifyFirebaseToken";

// Import routers
import employeeRoutes from "./routes/employeeRoutes";
import companyRoutes from "./routes/companyRoutes";
import patientRoutes from "./routes/patientRoutes";
import appointmentRoutes from "./routes/appointmentRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import servicesRoutes from "./routes/servicesRoutes";
import messageRoutes from "./routes/messageRoutes";
import "./models/Service";
import "./models/Company";
import "./models/Patient";
import "./models/Appointment";
import "./models/Clinic";
import "./models/Message";
import "./models/Notification";
import "./models/Worker";
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
// 1) Mount /company/by-email (no JWT check)
//    This ensures that React’s fetch(`${API_BASE}/company/by-email`)
//    sees your getcompanyByEmail controller instead of being stopped by verifyFirebaseToken.
// ───────────────────────────────────────────────────────────────────────────
// 1) Mount companyRoutes (which includes /by-email, /new, /:companyId, /:companyId/join, and /:companyId/workers):
app.use("/company", companyRoutes);

// 2) Only after that, mount the global verifyFirebaseToken for any other /company sub‐routers:
//    (patients, appointments, notifications, etc.)
app.use("/company", verifyFirebaseToken);

// 3) Mount the rest of your protected /company sub‐routers:
app.use("/company", patientRoutes);
app.use("/company", appointmentRoutes);
app.use("/company", notificationRoutes);
app.use("/company", employeeRoutes);
app.use("/company", messageRoutes);
app.use("/company", servicesRoutes);
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
