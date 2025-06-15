import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/mongoose";

// routers
import companyRoutes from "./routes/companyRoutes";
import appointmentRoutes from "./routes/appointmentRoutes";
import employeeRoutes from "./routes/employeeRoutes";
import patientRoutes from "./routes/patientRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import serviceRoutes from "./routes/serviceRoutes";

dotenv.config();
const app = express();

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
app.use(express.json());

// mount routes under /company
app.use("/company", companyRoutes);
app.use("/company", appointmentRoutes);
app.use("/company", employeeRoutes);
app.use("/company", patientRoutes);
app.use("/company", notificationRoutes);
app.use("/company", serviceRoutes);

// 404 fallback
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// connect DB & start server
connectDB().then(() => {
  const port = process.env.PORT ?? 3001;
  app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
});
