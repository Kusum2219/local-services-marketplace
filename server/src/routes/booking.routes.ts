import { Router } from "express";

import {
  createBooking,
  getMyBookings,
  cancelBooking,
  getVendorBookings,
  confirmBooking,
  completeBooking,
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

// Vendor confirms booking
router.patch(
  "/:bookingId/confirm",
  authenticate,
  authorizeRoles("VENDOR"),
  confirmBooking
);

// Vendor completes booking
router.patch(
  "/:bookingId/complete",
  authenticate,
  authorizeRoles("VENDOR"),
  completeBooking
);

// Cancel booking
router.patch(
  "/:bookingId/cancel",
  authenticate,
  authorizeRoles("CUSTOMER"),
  cancelBooking
);

export default router;