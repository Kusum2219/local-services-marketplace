import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const createBooking = async (
  req: Request & {
    user?: {
      userId: string;
      role: string;
    };
  },
  res: Response
) => {
  try {
    // 1. Authentication check
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { slotId } = req.body;

    // 2. Validate slot ID
    if (
      typeof slotId !== "string" ||
      slotId.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Slot ID is required",
      });
    }

    // 3. Find the slot
    const slot = await prisma.availabilitySlot.findUnique({
      where: {
        id: slotId,
      },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            price: true,
            isActive: true,
            vendorId: true,
          },
        },
        booking: true,
      },
    });

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Availability slot not found",
      });
    }

    // 4. Make sure service is active
    if (!slot.service.isActive) {
      return res.status(400).json({
        success: false,
        message: "This service is no longer available",
      });
    }

    // 5. Prevent booking an already booked slot
    if (slot.booking) {
      return res.status(409).json({
        success: false,
        message: "This slot has already been booked",
      });
    }

    // 6. Prevent booking a past slot
    if (slot.startTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "This slot is no longer available",
      });
    }

    // 7. Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: req.user.userId,
        slotId: slot.id,
        status: "PENDING",
      },
      include: {
        slot: {
          include: {
            service: {
              select: {
                id: true,
                title: true,
                price: true,
              },
            },
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Create booking error:", error);

    // Database-level protection against double booking
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        success: false,
        message: "This slot has already been booked",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const getMyBookings = async (
  req: Request & {
    user?: {
      userId: string;
      role: string;
    };
  },
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        userId: req.user.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        slot: {
          include: {
            service: {
              select: {
                id: true,
                title: true,
                price: true,
                vendor: {
                  select: {
                    id: true,
                    businessName: true,
                    location: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("Get my bookings error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const cancelBooking = async (
  req: Request & {
    user?: {
      userId: string;
      role: string;
    };
  },
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { bookingId } = req.params;

    if (
      typeof bookingId !== "string" ||
      bookingId.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required",
      });
    }

    // Find booking belonging to logged-in customer
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId: req.user.userId,
      },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Prevent cancelling already completed/cancelled bookings
    if (booking.status === "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Completed bookings cannot be cancelled",
      });
    }

    if (booking.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      });
    }

    // Release the slot while preserving booking history
    const cancelledBooking = await prisma.booking.update({
      where: {
        id: booking.id,
      },
      data: {
        status: "CANCELLED",
        slotId: null,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking: cancelledBooking,
    });
  } catch (error) {
    console.error("Cancel booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getVendorBookings = async (
  req: Request & {
    user?: {
      userId: string;
      role: string;
    };
  },
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Find vendor profile of logged-in user
    const vendorProfile = await prisma.vendorProfile.findUnique({
      where: {
        userId: req.user.userId,
      },
    });

    if (!vendorProfile) {
      return res.status(404).json({
        success: false,
        message: "Vendor profile not found",
      });
    }

    // Get bookings for services owned by this vendor
    const bookings = await prisma.booking.findMany({
      where: {
        slot: {
          service: {
            vendorId: vendorProfile.id,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        slot: {
          include: {
            service: {
              select: {
                id: true,
                title: true,
                price: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error("Get vendor bookings error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};