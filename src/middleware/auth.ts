import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

export interface CustomRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: "admin" | "customer";
  };
}

export const authenticate = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
      errors: "Authentication token is missing.",
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
      errors: "Authentication token is missing.",
    });
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return res.status(500).json({
      success: false,
      message: "Server configuration error.",
      errors: "JWT secret is not configured.",
    });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as CustomRequest["user"];
    if (decoded) {
      req.user = decoded;
      next();
    } else {
      res.status(401).json({
        success: false,
        message: "Invalid token.",
        errors: "Token is expired or invalid.",
      });
    }
  } catch (ex) {
    res.status(401).json({
      success: false,
      message: "Invalid token.",
      errors: "Token is expired or invalid.",
    });
  }
};
