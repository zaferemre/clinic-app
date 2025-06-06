"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifyFirebaseToken_1 = require("../middlewares/verifyFirebaseToken");
const router = express_1.default.Router();
router.get("/patients", verifyFirebaseToken_1.verifyFirebaseToken, (req, res) => {
    res.json({ message: `Hello ${req.user?.email}, here are your patients.` });
});
exports.default = router;
