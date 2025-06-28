"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyFirebaseToken = void 0;
// src/middlewares/verifyFirebaseToken.ts
const firebase_1 = require("../config/firebase"); // <-- your initialized admin
const verifyFirebaseToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log("[AUTH] Authorization header:", authHeader);
    if (!authHeader?.startsWith("Bearer ")) {
        console.log("[AUTH] No or invalid auth header:", authHeader);
        res.status(401).json({ error: "No or invalid auth header" });
        return;
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        console.log("[AUTH] No token provided after Bearer:", authHeader);
        res.status(401).json({ error: "No token provided" });
        return;
    }
    try {
        const decodedToken = await firebase_1.admin.auth().verifyIdToken(token);
        console.log("[AUTH] Token verified for UID:", decodedToken.uid);
        req.user = {
            ...decodedToken,
            uid: decodedToken.uid,
            email: decodedToken.email ?? "",
            name: decodedToken.name ?? decodedToken.displayName ?? "",
            photoURL: decodedToken.picture ?? decodedToken.photoURL ?? "",
        };
        next();
    }
    catch (err) {
        console.error("→ verifyFirebaseToken failed:", err.code, err.message);
        res.status(403).json({
            error: "Token invalid or expired",
            message: err.message ?? "Unknown error",
            code: err.code ?? null,
        });
    }
};
exports.verifyFirebaseToken = verifyFirebaseToken;
