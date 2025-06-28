"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyFirebaseToken = void 0;
// src/middlewares/verifyFirebaseToken.ts
const firebase_1 = require("../config/firebase"); // <-- your initialized admin
const verifyFirebaseToken = async (req, res, next) => {
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
        const decodedToken = await firebase_1.admin.auth().verifyIdToken(token);
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
        console.error("→ verifyFirebaseToken failed:", err);
        res.status(403).json({ error: "Token invalid or expired" });
    }
};
exports.verifyFirebaseToken = verifyFirebaseToken;
