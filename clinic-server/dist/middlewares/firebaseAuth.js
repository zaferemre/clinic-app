"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyFirebaseToken = void 0;
const auth_1 = require("firebase-admin/auth");
const verifyFirebaseToken = async (req, res, next) => {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split(" ")[1];
    if (!token)
        return res.status(401).json({ error: "No token provided" });
    try {
        const decodedToken = await (0, auth_1.getAuth)().verifyIdToken(token);
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email ?? "",
        };
        next();
    }
    catch (err) {
        return res.status(403).json({ error: "Invalid Firebase token" });
    }
};
exports.verifyFirebaseToken = verifyFirebaseToken;
