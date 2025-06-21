import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/mongoose";

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

dotenv.config();

const app = express();

// body parsing, before any routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://sweet-fascination-production.up.railway.app",
    ],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// --- Clinic-scoped sub-routes (mount before company routes) ---
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
// catch-all 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

connectDB().then(() => {
  const port = process.env.PORT ?? 3001;
  app.listen(port, () => console.log(`Server running on port ${port}`));
});
