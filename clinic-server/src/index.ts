import express, { Request, Response, NextFunction } from "express";
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

// ----- CORS Debug Logger -----
const allowedOrigins = [
  "http://localhost:5173",
  "https://sweet-fascination-production.up.railway.app",
  "https://www.randevi.app",
  "https://randevi.app",
  "https://api.randevi.app",
];

// Log all incoming requests with their Origin header
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[CORS DEBUG] Incoming request: ${req.method} ${req.url}`);
  console.log(`[CORS DEBUG] Origin: ${req.headers.origin}`);
  next();
});

// CORS middleware with logging of matched origin
app.use(
  cors({
    origin: function (origin, callback) {
      console.log(`[CORS DEBUG] Evaluating Origin:`, origin);
      if (!origin) {
        // No origin (like curl or server-to-server requests)
        console.log("[CORS DEBUG] No Origin header, allow by default.");
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        console.log(`[CORS DEBUG] Origin allowed: ${origin}`);
        return callback(null, true);
      } else {
        console.log(`[CORS DEBUG] Origin NOT allowed: ${origin}`);
        return callback(
          new Error(`Origin not allowed by CORS: ${origin}`),
          false
        );
      }
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
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
  console.log(`[SERVER] Allowed CORS origins:`);
  allowedOrigins.forEach((o) => console.log(`- ${o}`));
  app.listen(port, () =>
    console.log(`[SERVER] Server running on port ${port}`)
  );
});
