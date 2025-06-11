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
const employeeRoutes_1 = __importDefault(require("./routes/employeeRoutes"));
const companyRoutes_1 = __importDefault(require("./routes/companyRoutes"));
const patientRoutes_1 = __importDefault(require("./routes/patientRoutes"));
const appointmentRoutes_1 = __importDefault(require("./routes/appointmentRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const servicesRoutes_1 = __importDefault(require("./routes/servicesRoutes"));
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
require("./models/Service");
require("./models/Company");
require("./models/Patient");
require("./models/Appointment");
require("./models/Clinic");
require("./models/Message");
require("./models/Notification");
require("./models/Worker");
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
// 1) Mount /company/by-email (no JWT check)
//    This ensures that React’s fetch(`${API_BASE}/company/by-email`)
//    sees your getcompanyByEmail controller instead of being stopped by verifyFirebaseToken.
// ───────────────────────────────────────────────────────────────────────────
// 1) Mount companyRoutes (which includes /by-email, /new, /:companyId, /:companyId/join, and /:companyId/workers):
app.use("/company", companyRoutes_1.default);
// 2) Only after that, mount the global verifyFirebaseToken for any other /company sub‐routers:
//    (patients, appointments, notifications, etc.)
app.use("/company", verifyFirebaseToken_1.verifyFirebaseToken);
// 3) Mount the rest of your protected /company sub‐routers:
app.use("/company", patientRoutes_1.default);
app.use("/company", appointmentRoutes_1.default);
app.use("/company", notificationRoutes_1.default);
app.use("/company", employeeRoutes_1.default);
app.use("/company", messageRoutes_1.default);
app.use("/company", servicesRoutes_1.default);
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
