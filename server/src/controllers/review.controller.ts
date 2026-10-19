import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma";

export const createReview = async (
  req: Request & {
    user?: { userId: string; role: string };
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

    if (req.user.role !== "CUSTOMER") {
      return res.status(403).json({
        success: false,
        message: "Only customers can submit reviews",
      });
    }

    const { bookingId, rating, comment } = req.body;

    if (
      typeof bookingId !== "string" ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid bookingId and rating from 1 to 5 are required",
      });
    }

    if (
      comment !== undefined &&
      comment !== null &&
      (typeof comment !== "string" || comment.length > 1000)
    ) {
      return res.status(400).json({
        success: false,
        message: "Comment must be 1000 characters or fewer",
      });
    }

    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId: req.user.userId,
        status: "COMPLETED",
      },
      include: {
        slot: {
          select: {
            serviceId: true,
          },
        },
      },
    });

    if (!booking || !booking.slot) {
      return res.status(400).json({
        success: false,
        message: "Only your completed bookings can be reviewed",
      });
    }

    const review = await prisma.review.create({
      data: {
        userId: req.user.userId,
        serviceId: booking.slot.serviceId,
        bookingId: booking.id,
        rating,
        comment:
          typeof comment === "string"
            ? comment.trim() || null
            : null,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(409).json({
        success: false,
        message: "This booking has already been reviewed",
      });
    }

    console.error("Create review error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit review",
    });
  }
};

export const getServiceReviews = async (
  req: Request,
  res: Response
) => {
  try {
    const serviceId = String(req.params.serviceId);
    const reviews = await prisma.review.findMany({
      where: { serviceId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    const averageRating =
      reviews.length > 0
        ? Number(
            (
              reviews.reduce(
                (sum, review) => sum + review.rating,
                0
              ) / reviews.length
            ).toFixed(1)
          )
        : 0;

    return res.status(200).json({
      success: true,
      averageRating,
      totalReviews: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Get reviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load reviews",
    });
  }
};
