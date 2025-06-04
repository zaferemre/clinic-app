import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import clinicRoutes from "./routes/clinicRoutes";
import patientRoutes from "./routes/patientRoutes";
import appointmentRoutes from "./routes/appointmentRoutes"; // <— new
import { verifyFirebaseToken } from "./middlewares/verifyFirebaseToken";
import { connectDB } from "./config/mongoose";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// All /clinic/* routes require Firebase token first
app.use("/clinic", verifyFirebaseToken, clinicRoutes);
app.use("/clinic", verifyFirebaseToken, patientRoutes);
app.use("/clinic", verifyFirebaseToken, appointmentRoutes); // <— new

app.get("/", (_req, res) => {
  res.send("Clinic API is running.");
});

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
