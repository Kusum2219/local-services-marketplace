import { Router } from "express";

import {
  createBooking,
  getMyBookings,
  cancelBooking,
   getVendorBookings,
} from "../controllers/booking.controller";

import { authenticate } from "../middleware/auth.middleware";

import { authorizeRoles } from "../middleware/role.middleware";

const router = Router();

// Create booking
router.post(
  "/",
  authenticate,
  authorizeRoles("CUSTOMER"),
  createBooking
);

// Get logged-in customer's bookings
router.get(
  "/my",
  authenticate,
  authorizeRoles("CUSTOMER"),
  getMyBookings
);

router.get(
  "/vendor",
  authenticate,
  authorizeRoles("VENDOR"),
  getVendorBookings
);

// Cancel booking
router.patch(
  "/:bookingId/cancel",
  authenticate,
  authorizeRoles("CUSTOMER"),
  cancelBooking
);

export default router;