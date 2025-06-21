"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = require("./config/mongoose");
// Routers
const companyRoutes_1 = __importDefault(require("./routes/companyRoutes"));
const clinicRoutes_1 = __importDefault(require("./routes/clinicRoutes"));
const appointmentRoutes_1 = __importDefault(require("./routes/appointmentRoutes"));
const employeeRoutes_1 = __importDefault(require("./routes/employeeRoutes"));
const patientRoutes_1 = __importDefault(require("./routes/patientRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const serviceRoutes_1 = __importDefault(require("./routes/serviceRoutes"));
const groupRoutes_1 = __importDefault(require("./routes/groupRoutes"));
const roleRoutes_1 = __importDefault(require("./routes/roleRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:5173",
        "https://sweet-fascination-production.up.railway.app",
    ],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express_1.default.json());
// All /company endpoints (handles join, joinClinic, CRUD, etc.)
// The router applies authentication and authorization as appropriate
app.use("/company", companyRoutes_1.default);
// Mount all routers that require a valid user & company access
app.use("/company/:companyId/clinics", clinicRoutes_1.default);
app.use("/company/:companyId/clinics/:clinicId/appointments", appointmentRoutes_1.default);
app.use("/company/:companyId/clinics/:clinicId/employees", employeeRoutes_1.default);
app.use("/company/:companyId/clinics/:clinicId/patients", patientRoutes_1.default);
app.use("/company/:companyId/clinics/:clinicId/notifications", notificationRoutes_1.default);
app.use("/company/:companyId/clinics/:clinicId/services", serviceRoutes_1.default);
app.use("/company/:companyId/clinics/:clinicId/groups", groupRoutes_1.default);
app.use("/company/:companyId/roles", roleRoutes_1.default);
// 404 fallback
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});
(0, mongoose_1.connectDB)().then(() => {
    const port = process.env.PORT ?? 3001;
    app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
});
