import { Router } from "express";
import { createBooking } from "../controllers/booking.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = Router();

// Only authenticated customers can create bookings
router.post(
  "/",
  authenticate,
  authorizeRoles("CUSTOMER"),
  createBooking
);

export default router;