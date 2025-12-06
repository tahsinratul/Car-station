import { Request, Response } from "express";
import * as authService from "./auth.service";

export const handleSignUp = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role } = req.body;
    // Basic validation for required fields
    if (!name || !email || !password || !phone) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }
    // Ensure user cannot set role to admin via signup
    if (role && role.toLowerCase() === "admin") {
      return res.status(400).json({
        success: false,
        message: "Cannot set role to 'admin' during signup.",
      });
    }

    const newUser = await authService.signUp(name, email, password, phone);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: newUser,
    });
  } catch (error) {
    if ((error as any).code === "23505") {
      return res
        .status(409)
        .json({ success: false, message: "Email already in use." });
    }
    res
      .status(500)
      .json({ success: false, message: "Failed to register user." });
  }
};

export const handleSignIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await authService.signIn(email, password);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
    });
  } catch (error) {
    res.status(401).json({ success: false, message: (error as Error).message });
  }
};
