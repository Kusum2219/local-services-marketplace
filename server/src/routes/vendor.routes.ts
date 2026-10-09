import { Router } from "express";

import {
  createVendorProfile,
  getVendorDashboard,
  getVendorProfile,
  updateVendorProfile,
} from "../controllers/vendor.controller";

import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = Router();

router.post(
  "/profile",
  authenticate,
  authorizeRoles("VENDOR"),
  createVendorProfile
);

router.get(
  "/profile",
  authenticate,
  authorizeRoles("VENDOR"),
  getVendorProfile
);

router.patch(
  "/profile",
  authenticate,
  authorizeRoles("VENDOR"),
  updateVendorProfile
);

router.get(
  "/dashboard",
  authenticate,
  authorizeRoles("VENDOR"),
  getVendorDashboard
);

export default router;