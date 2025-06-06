"use strict";
// src/index.ts (or src/app.ts)
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = require("./config/mongoose");
const verifyFirebaseToken_1 = require("./middlewares/verifyFirebaseToken");
// Import routers
const clinicRoutes_1 = __importDefault(require("./routes/clinicRoutes"));
const patientRoutes_1 = __importDefault(require("./routes/patientRoutes"));
const appointmentRoutes_1 = __importDefault(require("./routes/appointmentRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const workerRoutes_1 = __importDefault(require("./routes/workerRoutes"));
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
const app = (0, express_1.default)();
// CORS + JSON
app.use((0, cors_1.default)({
    origin: [
        "https://sweet-fascination-production.up.railway.app",
        "http://localhost:5173",
    ],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express_1.default.json());
// ───────────────────────────────────────────────────────────────────────────
// 1) Mount /clinic/by-email (no JWT check)
//    This ensures that React’s fetch(`${API_BASE}/clinic/by-email`)
//    sees your getClinicByEmail controller instead of being stopped by verifyFirebaseToken.
// ───────────────────────────────────────────────────────────────────────────
// 1) Mount clinicRoutes (which includes /by-email, /new, /:clinicId, /:clinicId/join, and /:clinicId/workers):
app.use("/clinic", clinicRoutes_1.default);
// 2) Only after that, mount the global verifyFirebaseToken for any other /clinic sub‐routers:
//    (patients, appointments, notifications, etc.)
app.use("/clinic", verifyFirebaseToken_1.verifyFirebaseToken);
// 3) Mount the rest of your protected /clinic sub‐routers:
app.use("/clinic", patientRoutes_1.default);
app.use("/clinic", appointmentRoutes_1.default);
app.use("/clinic", notificationRoutes_1.default);
app.use("/clinic", workerRoutes_1.default);
app.use("/clinic", messageRoutes_1.default);
// ───────────────────────────────────────────────────────────────────────────
// 4) Fallback 404
// ───────────────────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});
// ───────────────────────────────────────────────────────────────────────────
// 5) Connect to MongoDB and start listening
// ───────────────────────────────────────────────────────────────────────────
(0, mongoose_1.connectDB)().then(() => {
    app.listen(process.env.PORT ?? 3001, () => {
        console.log(`🚀 Server running on port ${process.env.PORT ?? 3001}`);
    });
});
