"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifyFirebaseToken_1 = require("../middlewares/verifyFirebaseToken");
const authorizeClinicAccess_1 = require("../middlewares/authorizeClinicAccess");
const clinicController_1 = require("../controllers/clinicController");
const router = express_1.default.Router();
// 1) PUBLIC (but still require a valid Firebase ID token):
router.get("/by-email", verifyFirebaseToken_1.verifyFirebaseToken, clinicController_1.getClinicByEmail);
router.post("/new", verifyFirebaseToken_1.verifyFirebaseToken, clinicController_1.createClinic);
router.get("/:clinicId", verifyFirebaseToken_1.verifyFirebaseToken, clinicController_1.getClinicById);
// 2) JOIN → Any authenticated user can join by providing the joinCode
//    This MUST come *before* the “/workers” routes, because otherwise
//    Express will try to match "/:clinicId/workers" before it ever sees "/:clinicId/join".
router.post("/:clinicId/join", verifyFirebaseToken_1.verifyFirebaseToken, clinicController_1.joinClinic);
// 3) OWNER‐only routes for adding/removing/updating workers:
router.post("/:clinicId/workers", verifyFirebaseToken_1.verifyFirebaseToken, clinicController_1.addWorker);
router.delete("/:clinicId/workers/:workerEmail", verifyFirebaseToken_1.verifyFirebaseToken, clinicController_1.removeWorker);
router.patch("/:clinicId/workers/:workerEmail", verifyFirebaseToken_1.verifyFirebaseToken, clinicController_1.updateWorker);
// This returns just the array of workers[]
router.get("/:clinicId/workers", verifyFirebaseToken_1.verifyFirebaseToken, authorizeClinicAccess_1.authorizeClinicAccess, clinicController_1.getWorkersList);
exports.default = router;
