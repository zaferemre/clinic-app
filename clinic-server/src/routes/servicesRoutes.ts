// src/routes/serviceRoutes.ts
import express from "express";
import {
  getServices,
  createService,
  updateService,
  deleteService,
} from "../controllers/serviceController";

const router = express.Router({ mergeParams: true });

router.get("/:companyId/services", getServices);
router.post("/:companyId/services", createService);
router.put("/:companyId/services/:serviceId", updateService);
router.delete("/:companyId/services/:serviceId", deleteService);

export default router;
