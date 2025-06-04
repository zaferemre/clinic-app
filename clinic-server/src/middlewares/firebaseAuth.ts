import { getAuth } from "firebase-admin/auth";
import { Request, Response, NextFunction } from "express";

export const verifyFirebaseToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email ?? "",
    };
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid Firebase token" });
  }
};
