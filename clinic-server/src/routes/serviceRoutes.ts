import { Router } from "express";
import {
  listServices,
  createService,
  updateService,
  deleteService,
} from "../controllers/serviceController";
import { verifyFirebaseToken } from "../middlewares/verifyFirebaseToken";
import { authorizeCompanyAccess } from "../middlewares/authorizeCompanyAccess";

// Note: mergeParams:true is critical so we get companyId & clinicId from the parent
const router = Router({ mergeParams: true });

router.use(verifyFirebaseToken, authorizeCompanyAccess);

router.get("/", listServices);
router.post("/", createService);
router.patch("/:serviceId", updateService);
router.delete("/:serviceId", deleteService);

export default router;
