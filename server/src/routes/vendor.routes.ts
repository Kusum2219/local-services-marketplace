import { Router } from "express";
import {
  createVendorProfile,
  getVendorDashboard,
} from "../controllers/vendor.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = Router();

// Only authenticated VENDORS can create a vendor profile
router.post(
  "/profile",
  authenticate,
  authorizeRoles("VENDOR"),
  createVendorProfile
);

router.get(
  "/dashboard",
  authenticate,
  authorizeRoles("VENDOR"),
  getVendorDashboard
);

export default router;