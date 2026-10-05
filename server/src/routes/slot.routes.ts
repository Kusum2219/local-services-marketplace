import { Router } from "express";
import {
  createSlot,
  getServiceSlots,
  getVendorSlots,
} from "../controllers/slot.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  authorizeRoles("VENDOR"),
  createSlot
);

router.get(
  "/vendor",
  authenticate,
  authorizeRoles("VENDOR"),
  getVendorSlots
);

router.get(
  "/service/:serviceId",
  getServiceSlots
);

export default router;