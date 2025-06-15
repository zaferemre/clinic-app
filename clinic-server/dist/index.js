"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = require("./config/mongoose");
// routers
const companyRoutes_1 = __importDefault(require("./routes/companyRoutes"));
const appointmentRoutes_1 = __importDefault(require("./routes/appointmentRoutes"));
const employeeRoutes_1 = __importDefault(require("./routes/employeeRoutes"));
const patientRoutes_1 = __importDefault(require("./routes/patientRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const serviceRoutes_1 = __importDefault(require("./routes/serviceRoutes"));
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
// mount routes under /company
app.use("/company", companyRoutes_1.default);
app.use("/company", appointmentRoutes_1.default);
app.use("/company", employeeRoutes_1.default);
app.use("/company", patientRoutes_1.default);
app.use("/company", notificationRoutes_1.default);
app.use("/company", serviceRoutes_1.default);
// 404 fallback
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});
// connect DB & start server
(0, mongoose_1.connectDB)().then(() => {
    const port = process.env.PORT ?? 3001;
    app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
});
