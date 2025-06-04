import express from "express";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";

// Extend Express Request interface to include 'user'
declare module "express-serve-static-core" {
  interface Request {
    user?: {
      uid: string;
      email: string;
      [key: string]: any;
    };
    clinic?: any;
  }
}

const router = express.Router();

router.get("/patients", verifyFirebaseToken, (req, res) => {
  res.json({ message: `Hello ${req.user?.email}, here are your patients.` });
});

export default router;
