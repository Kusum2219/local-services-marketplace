import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import {
  loginSchema,
  registerSchema,
} from "../validators/auth.validator";

// ==============================
// REGISTER
// ==============================

export const register = async (req: Request, res: Response) => {
  try {
    // 1. Validate incoming data
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration data",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const { name, email, password } = result.data;

    // 2. Check whether email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // 3. Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // 4. Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user,
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ==============================
// LOGIN
// ==============================

export const login = async (req: Request, res: Response) => {
  try {
    // 1. Validate incoming data
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid login data",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const { email, password } = result.data;

    // 2. Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Do not reveal whether the email exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 3. Compare password with stored hash
    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 4. Get JWT secret
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not configured");
    }

    // 5. Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      jwtSecret,
      {
        expiresIn: "1d",
      }
    );

    // 6. Store JWT inside HTTP-only cookie
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // 7. Never expose passwordHash or JWT
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMe = async ( req: Request & { user?: { userId: string; role: string; }; }, res: Response ) => { try { if (!req.user) { return res.status(401).json({ success: false, message: "Authentication required", }); } const user = await prisma.user.findUnique({ where: { id: req.user.userId, }, select: { id: true, name: true, email: true, role: true, createdAt: true, }, }); if (!user) { return res.status(401).json({ success: false, message: "User account no longer exists", }); } return res.status(200).json({ success: true, user, }); } catch (error) { console.error("Get current user error:", error); return res.status(500).json({ success: false, message: "Internal server error", }); } };

// ==============================
// LOGOUT
// ==============================

export const logout = async (_req: Request, res: Response) => {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};