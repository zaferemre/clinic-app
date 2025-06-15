import express from "express";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";
import { authorizeCompanyAccess } from "../middlewares/authorizeCompanyAccess";
import {
  getServices,
  createService,
  updateService,
  deleteService,
} from "../controllers/serviceController";

const router = express.Router({ mergeParams: true });

// require token + access for any :companyId
router.use("/:companyId", verifyFirebaseToken, authorizeCompanyAccess);

router.get("/:companyId/services", getServices);
router.post("/:companyId/services", createService);
router.put("/:companyId/services/:serviceId", updateService);
router.delete("/:companyId/services/:serviceId", deleteService);

export default router;
