import { admin } from "../config/firebase";

import { Request, Response, NextFunction } from "express";

export const verifyFirebaseToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "No or invalid auth header" });
    return;
  }
  const token = authHeader.split(" ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = {
      ...decoded,
      email: decoded.email ?? "",
    }; // ensure email is always a string
    next();
  } catch (err) {
    console.error("→ verifyFirebaseToken failed:", err);
    res.status(403).json({ error: "Token invalid or expired" });
  }
};
