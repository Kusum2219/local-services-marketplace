import { Request, Response } from "express";
import prisma from "../lib/prisma";

// CREATE AVAILABILITY SLOT
export const createSlot = async (
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

    const { serviceId, startTime, endTime } = req.body;

    if (
      typeof serviceId !== "string" ||
      serviceId.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Service ID is required",
      });
    }

    if (
      typeof startTime !== "string" ||
      typeof endTime !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Start time and end time are required",
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid date/time format",
      });
    }

    // Slot must be in the future
    if (start <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Slot must be scheduled for a future time",
      });
    }

    // End must be after start
    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

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

    // Make sure the service belongs to the logged-in vendor
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        vendorId: vendorProfile.id,
        isActive: true,
      },
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found or does not belong to you",
      });
    }

    // Prevent overlapping slots for the same service
    const overlappingSlot =
      await prisma.availabilitySlot.findFirst({
        where: {
          serviceId,
          startTime: {
            lt: end,
          },
          endTime: {
            gt: start,
          },
        },
      });

    if (overlappingSlot) {
      return res.status(409).json({
        success: false,
        message:
          "This time overlaps with an existing availability slot",
      });
    }

    const slot = await prisma.availabilitySlot.create({
      data: {
        serviceId,
        startTime: start,
        endTime: end,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Availability slot created successfully",
      slot,
    });
  } catch (error: any) {
    console.error("Create slot error:", error);

    // Prisma unique constraint
    if (error?.code === "P2002") {
      return res.status(409).json({
        success: false,
        message:
          "A slot already exists for this service at this start time",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET AVAILABLE SLOTS FOR A SERVICE
export const getServiceSlots = async (
  req: Request,
  res: Response
) => {
  try {
    const { serviceId } = req.params;

    if (
      typeof serviceId !== "string" ||
      serviceId.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Service ID is required",
      });
    }

    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        isActive: true,
      },
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    const slots = await prisma.availabilitySlot.findMany({
      where: {
        serviceId,
        startTime: {
          gte: new Date(),
        },
        booking: null,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return res.status(200).json({
      success: true,
      serviceId,
      slots,
    });
  } catch (error) {
    console.error("Get service slots error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET VENDOR'S SERVICES WITH AVAILABILITY SLOTS
export const getVendorSlots = async (
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

    const services = await prisma.service.findMany({
      where: {
        vendorId: vendorProfile.id,
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        slots: {
          where: {
            startTime: {
              gte: new Date(),
            },
          },
          orderBy: {
            startTime: "asc",
          },
          include: {
            booking: {
              select: {
                id: true,
                status: true,
                user: {
                  select: {
                    name: true,
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
      services,
    });
  } catch (error) {
    console.error("Get vendor slots error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};