import { Router } from "express";
import { createVendorProfile } from "../controllers/vendor.controller";
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

export default router;