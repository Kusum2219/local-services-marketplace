import { Router } from "express";

import {
  createService,
  getServices,
  getServiceById,
  updateService,
  toggleServiceStatus,
  getVendorServices,
} from "../controllers/service.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = Router();

router.get("/", getServices);

router.get("/:serviceId", getServiceById);

router.get(
  "/vendor/mine",
  authenticate,
  authorizeRoles("VENDOR"),
  getVendorServices
);

router.post(
  "/",
  authenticate,
  authorizeRoles("VENDOR"),
  createService
);

router.patch(
  "/:serviceId",
  authenticate,
  authorizeRoles("VENDOR"),
  updateService
);

router.patch(
  "/:serviceId/status",
  authenticate,
  authorizeRoles("VENDOR"),
  toggleServiceStatus
);

export default router;