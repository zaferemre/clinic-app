// src/index.ts (or main.ts if outside src)
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import clinicRoutes from "./routes/clinicRoutes";
import patientRoutes from "./routes/patientRoutes";
import appointmentRoutes from "./routes/appointmentRoutes";
import { verifyFirebaseToken } from "./middlewares/verifyFirebaseToken";
import { connectDB } from "./config/mongoose";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Protect all /clinic/* routes with token verification
app.use("/clinic", verifyFirebaseToken, clinicRoutes);
app.use("/clinic", verifyFirebaseToken, patientRoutes);
app.use("/clinic", verifyFirebaseToken, appointmentRoutes);

app.get("/", (_req, res) => {
  res.send("✅ Clinic API is running locally.");
});

if (process.env.NODE_ENV !== "production") {
  connectDB()
    .then(() => {
      app.listen(PORT, () =>
        console.log(`🚀 Local server running at http://localhost:${PORT}`)
      );
    })
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err);
      process.exit(1);
    });
}
