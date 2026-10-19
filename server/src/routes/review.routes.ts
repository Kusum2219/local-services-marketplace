import { Router } from "express";
import {
  createReview,
  getServiceReviews,
} from "../controllers/review.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, createReview);
router.get("/service/:serviceId", getServiceReviews);

export default router;
