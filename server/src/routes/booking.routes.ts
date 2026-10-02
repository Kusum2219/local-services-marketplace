import { Router } from "express";
import { createBooking, getMyBookings } from "../controllers/booking.controller";
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

router.get(
  "/my",
  authenticate,
  authorizeRoles("CUSTOMER"),
  getMyBookings
);
export default router;