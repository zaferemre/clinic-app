import express from "express";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";
import { authorizeClinicAccess } from "../middlewares/authorizeClinicAccess";
import {
  getClinicByEmail,
  createClinic,
  getClinicById,
  addWorker,
  removeWorker,
  updateWorker,
  joinClinic, // ← make sure this is imported
  getWorkersList,
} from "../controllers/clinicController";

const router = express.Router();

// 1) PUBLIC (but still require a valid Firebase ID token):
router.get("/by-email", verifyFirebaseToken, getClinicByEmail);
router.post("/new", verifyFirebaseToken, createClinic);
router.get("/:clinicId", verifyFirebaseToken, getClinicById);

// 2) JOIN → Any authenticated user can join by providing the joinCode
//    This MUST come *before* the “/workers” routes, because otherwise
//    Express will try to match "/:clinicId/workers" before it ever sees "/:clinicId/join".
router.post("/:clinicId/join", verifyFirebaseToken, joinClinic);

// 3) OWNER‐only routes for adding/removing/updating workers:
router.post("/:clinicId/workers", verifyFirebaseToken, addWorker);
router.delete(
  "/:clinicId/workers/:workerEmail",
  verifyFirebaseToken,
  removeWorker
);
router.patch(
  "/:clinicId/workers/:workerEmail",
  verifyFirebaseToken,
  updateWorker
);
// This returns just the array of workers[]
router.get(
  "/:clinicId/workers",
  verifyFirebaseToken,
  authorizeClinicAccess,
  getWorkersList
);

export default router;
