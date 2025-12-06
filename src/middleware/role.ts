import { Response, NextFunction } from "express";
import { CustomRequest } from "./auth";

export const authorize = (allowedRoles: ("admin" | "customer")[]) => {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required." });
    }

    if (allowedRoles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: "Forbidden. Insufficient permissions.",
        errors: `Access denied. Requires one of the following roles: ${allowedRoles.join(
          ", "
        )}`,
      });
    }
  };
};

export const isAdmin = authorize(["admin"]);
