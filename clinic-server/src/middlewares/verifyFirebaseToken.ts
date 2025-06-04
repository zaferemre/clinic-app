import { Request, Response, NextFunction } from "express";
import { admin } from "../config/firebase";

export const verifyFirebaseToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    res.status(401).json({ error: "No or invalid auth header" });
    return;
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    // req.user altına kullanıcının e-posta ve UID’sini ekliyoruz
    (req as any).user = {
      uid: decodedToken.uid,
      email: decodedToken.email ?? "",
    };
    next();
  } catch (err) {
    console.error("Firebase token verification failed:", err);
    res.status(403).json({ error: "Invalid Firebase token" });
  }
};
