import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const createService = async (
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

    // 2. Get request data
    const { title, description, price, categoryId } = req.body;

    // 3. Basic validation
    if (
      typeof title !== "string" ||
      title.trim().length < 3
    ) {
      return res.status(400).json({
        success: false,
        message: "Service title must be at least 3 characters",
      });
    }

    if (
      typeof description !== "string" ||
      description.trim().length < 10
    ) {
      return res.status(400).json({
        success: false,
        message: "Description must be at least 10 characters",
      });
    }

    if (
      typeof price !== "number" ||
      !Number.isFinite(price) ||
      price <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Price must be a positive number",
      });
    }

    if (
      typeof categoryId !== "string" ||
      categoryId.trim().length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    // 4. Find vendor profile belonging to logged-in user
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

    // 5. Check category exists
    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // 6. Create service
    const service = await prisma.service.create({
      data: {
        vendorId: vendorProfile.id,
        categoryId,
        title: title.trim(),
        description: description.trim(),
        price,
      },
      include: {
        category: true,
        vendor: {
          select: {
            id: true,
            businessName: true,
            isVerified: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Service created successfully",
      service,
    });
  } catch (error) {
    console.error("Create service error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET ALL ACTIVE SERVICES
export const getServices = async (
  _req: Request,
  res: Response
) => {
  try {
    const services = await prisma.service.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true,
            location: true,
            isVerified: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      services,
    });
  } catch (error) {
    console.error("Get services error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET SINGLE SERVICE
export const getServiceById = async (
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
      include: {
        vendor: {
          select: {
            id: true,
            businessName: true,
            description: true,
            phone: true,
            location: true,
            isVerified: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    return res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    console.error("Get service by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};