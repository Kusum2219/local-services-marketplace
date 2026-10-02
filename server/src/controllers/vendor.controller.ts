import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const createVendorProfile = async (
  req: Request & {
    user?: {
      userId: string;
      role: string;
    };
  },
  res: Response
) => {
  try {
    // 1. Make sure user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // 2. Get profile data
    const { businessName, description, phone, location } = req.body;

    // 3. Basic validation
    if (
      typeof businessName !== "string" ||
      businessName.trim().length < 2
    ) {
      return res.status(400).json({
        success: false,
        message: "Business name must be at least 2 characters",
      });
    }

    // 4. Check whether profile already exists
    const existingProfile = await prisma.vendorProfile.findUnique({
      where: {
        userId: req.user.userId,
      },
    });

    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: "Vendor profile already exists",
      });
    }

    // 5. Create vendor profile
    const vendorProfile = await prisma.vendorProfile.create({
      data: {
        userId: req.user.userId,
        businessName: businessName.trim(),
        description:
          typeof description === "string"
            ? description.trim()
            : undefined,
        phone:
          typeof phone === "string"
            ? phone.trim()
            : undefined,
        location:
          typeof location === "string"
            ? location.trim()
            : undefined,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Vendor profile created successfully",
      vendorProfile,
    });
  } catch (error) {
    console.error("Create vendor profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

