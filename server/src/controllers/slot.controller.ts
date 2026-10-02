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
  } catch (error) {
    console.error("Create slot error:", error);

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

    // Express can type params as string | string[],
    // so explicitly validate it.
    if (typeof serviceId !== "string" || serviceId.trim().length === 0) {
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
        serviceId: serviceId,
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