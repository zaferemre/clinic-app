// src/index.ts
import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./config/mongoose";
import { verifyFirebaseToken } from "./middlewares/verifyFirebaseToken";
import clinicRoutes from "./routes/clinicRoutes";
import patientRoutes from "./routes/patientRoutes";
import appointmentRoutes from "./routes/appointmentRoutes";

const app = express();
app.use(
  cors({
    origin: "https://sweet-fascination-production.up.railway.app",
    credentials: true,
  })
);
app.use(express.json());

app.use("/clinic", verifyFirebaseToken, clinicRoutes);
app.use("/clinic", verifyFirebaseToken, patientRoutes);
app.use("/clinic", verifyFirebaseToken, appointmentRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Clinic API Running");
});
connectDB().then(() => {
  app.listen(process.env.PORT ?? 3001, () => {
    console.log(`🚀 Server running on port ${process.env.PORT ?? 3001}`);
  });
});
