"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyFirebaseToken = void 0;
const firebase_1 = require("../config/firebase");
const verifyFirebaseToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ error: "No or invalid auth header" });
        return;
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = await firebase_1.admin.auth().verifyIdToken(token);
        req.user = {
            ...decoded,
            email: decoded.email ?? "",
        }; // ensure email is always a string
        next();
    }
    catch (err) {
        console.error("→ verifyFirebaseToken failed:", err);
        res.status(403).json({ error: "Token invalid or expired" });
    }
};
exports.verifyFirebaseToken = verifyFirebaseToken;
