import express from "express";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";

const router = express.Router();

router.get("/patients", verifyFirebaseToken, (req, res) => {
  res.json({ message: `Hello ${req.user?.email}, here are your patients.` });
});

export default router;
