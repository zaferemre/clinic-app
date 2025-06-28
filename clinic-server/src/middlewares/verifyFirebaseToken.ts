// src/middlewares/verifyFirebaseToken.ts
import { admin } from "../config/firebase"; // <-- your initialized admin
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
  if (!token) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = {
      ...decodedToken,
      uid: decodedToken.uid,
      email: decodedToken.email ?? "",
      name: decodedToken.name ?? decodedToken.displayName ?? "",
      photoURL: decodedToken.picture ?? decodedToken.photoURL ?? "",
    };
    next();
  } catch (err) {
    console.error("→ verifyFirebaseToken failed:", err);
    res.status(403).json({ error: "Token invalid or expired" });
  }
};
