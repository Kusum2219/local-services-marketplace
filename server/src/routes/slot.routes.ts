import { Router } from "express";
import {
  createSlot,
  getServiceSlots,
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
  "/service/:serviceId",
  getServiceSlots
);

export default router;