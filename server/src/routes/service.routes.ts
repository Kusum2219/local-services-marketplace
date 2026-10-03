import { Router } from "express";
import {
  createService,
  getServices,
} from "../controllers/service.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = Router();

router.get("/", getServices);

router.post(
  "/",
  authenticate,
  authorizeRoles("VENDOR"),
  createService
);

export default router;