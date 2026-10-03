import { Router } from "express";
import {
  createService,
  getServices,
  getServiceById,
} from "../controllers/service.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = Router();

router.get("/", getServices);
router.get("/:serviceId", getServiceById);

router.post(
  "/",
  authenticate,
  authorizeRoles("VENDOR"),
  createService
);

export default router;