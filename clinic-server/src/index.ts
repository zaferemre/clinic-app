import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/mongoose";
import { verifyFirebaseToken } from "./middlewares/verifyFirebaseToken";

// Routers
import companyRoutes from "./routes/companyRoutes";
import clinicRoutes from "./routes/clinicRoutes";
import appointmentRoutes from "./routes/appointmentRoutes";
import employeeRoutes from "./routes/employeeRoutes";
import patientRoutes from "./routes/patientRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import serviceRoutes from "./routes/serviceRoutes";
import groupRoutes from "./routes/groupRoutes";
import roleRoutes from "./routes/roleRoutes";
import userRoutes from "./routes/userRoutes";

dotenv.config();

const app = express();

// Body parsing, before any routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://sweet-fascination-production.up.railway.app",
      "https://www.randevi.app",
      "https://randevi.app",
      "https://api.randevi.app",
    ],
    credentials: true,
    allowedHeaders: ["authorization", "content-type"],
  })
);

// --- Public/user-level routes (no auth required) ---
app.use("/user", userRoutes);

// --- All other routes require authentication ---
app.use(verifyFirebaseToken);

// --- Clinic-scoped sub-routes ---
app.use(
  "/company/:companyId/clinics/:clinicId/appointments",
  appointmentRoutes
);
app.use("/company/:companyId/clinics/:clinicId/employees", employeeRoutes);
app.use("/company/:companyId/clinics/:clinicId/patients", patientRoutes);
app.use(
  "/company/:companyId/clinics/:clinicId/notifications",
  notificationRoutes
);
app.use("/company/:companyId/clinics/:clinicId/services", serviceRoutes);
app.use("/company/:companyId/clinics/:clinicId/groups", groupRoutes);

// Roles (company-level but before companyRoutes)
app.use("/company/:companyId/clinics/:clinicId/roles", roleRoutes);

// --- Clinic routes ---
app.use("/company/:companyId/clinics", clinicRoutes);

// --- Company-level routes ---
app.use("/company", companyRoutes);

// --- Catch-all 404 handler ---
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

connectDB().then(() => {
  const port = process.env.PORT ?? 3001;
  app.listen(port, () => console.log(`Server running on port ${port}`));
});
