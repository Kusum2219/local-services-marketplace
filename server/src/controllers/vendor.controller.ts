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
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { businessName, description, phone, location } = req.body;

    if (
      typeof businessName !== "string" ||
      businessName.trim().length < 2
    ) {
      return res.status(400).json({
        success: false,
        message: "Business name must be at least 2 characters",
      });
    }

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

// GET VENDOR DASHBOARD
export const getVendorDashboard = async (
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

    const [
      totalServices,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      recentBookings,
    ] = await Promise.all([
      prisma.service.count({
        where: {
          vendorId: vendorProfile.id,
        },
      }),

      prisma.booking.count({
        where: {
          slot: {
            service: {
              vendorId: vendorProfile.id,
            },
          },
        },
      }),

      prisma.booking.count({
        where: {
          status: "PENDING",
          slot: {
            service: {
              vendorId: vendorProfile.id,
            },
          },
        },
      }),

      prisma.booking.count({
        where: {
          status: "CONFIRMED",
          slot: {
            service: {
              vendorId: vendorProfile.id,
            },
          },
        },
      }),

      prisma.booking.count({
        where: {
          status: "COMPLETED",
          slot: {
            service: {
              vendorId: vendorProfile.id,
            },
          },
        },
      }),

      prisma.booking.findMany({
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
        take: 5,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          slot: {
            include: {
              service: {
                select: {
                  title: true,
                  price: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      dashboard: {
        vendor: {
          id: vendorProfile.id,
          businessName: vendorProfile.businessName,
          location: vendorProfile.location,
          isVerified: vendorProfile.isVerified,
        },

        stats: {
          totalServices,
          totalBookings,
          pendingBookings,
          confirmedBookings,
          completedBookings,
        },

        recentBookings,
      },
    });
  } catch (error) {
    console.error("Get vendor dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET CURRENT VENDOR PROFILE
export const getVendorProfile = async (
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
      select: {
        id: true,
        businessName: true,
        description: true,
        phone: true,
        location: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!vendorProfile) {
      return res.status(404).json({
        success: false,
        message: "Vendor profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      vendorProfile,
    });
  } catch (error) {
    console.error("Get vendor profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// UPDATE CURRENT VENDOR PROFILE
export const updateVendorProfile = async (
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

    const { businessName, description, phone, location } = req.body;

    if (
      typeof businessName !== "string" ||
      businessName.trim().length < 2
    ) {
      return res.status(400).json({
        success: false,
        message: "Business name must be at least 2 characters",
      });
    }

    if (
      description !== undefined &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid description",
      });
    }

    if (
      phone !== undefined &&
      typeof phone !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    if (
      location !== undefined &&
      typeof location !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid location",
      });
    }

    const existingProfile = await prisma.vendorProfile.findUnique({
      where: {
        userId: req.user.userId,
      },
    });

    if (!existingProfile) {
      return res.status(404).json({
        success: false,
        message: "Vendor profile not found",
      });
    }

    const updatedProfile = await prisma.vendorProfile.update({
      where: {
        userId: req.user.userId,
      },
      data: {
        businessName: businessName.trim(),
        description:
          typeof description === "string"
            ? description.trim()
            : null,
        phone:
          typeof phone === "string"
            ? phone.trim()
            : null,
        location:
          typeof location === "string"
            ? location.trim()
            : null,
      },
      select: {
        id: true,
        businessName: true,
        description: true,
        phone: true,
        location: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Vendor profile updated successfully",
      vendorProfile: updatedProfile,
    });
  } catch (error) {
    console.error("Update vendor profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};