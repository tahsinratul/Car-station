import { Response } from "express";
import * as userService from "./user.service";
import { CustomRequest } from "../../middleware/auth";

export const handleGetAllUsers = async (req: CustomRequest, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to retrieve users." });
  }
};

export const handleUpdateUser = async (req: CustomRequest, res: Response) => {
  const targetUserId = req.params.userId;
  if (!targetUserId) {
    return res.status(400).json({
      success: false,
      message: "User ID is required",
    });
  }

  const { role: newRole, ...updateData } = req.body;

  // Auth Check: Customer can only update self
  if (
    req.user!.role === "customer" &&
    parseInt(targetUserId) !== parseInt(req.user!.userId)
  ) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: You can only update your own profile.",
    });
  }

  // Auth Check: Customer cannot update role
  if (req.user!.role === "customer" && newRole) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Customers cannot change user roles.",
    });
  }

  // If admin is updating, include the role if provided
  if (req.user!.role === "admin" && newRole) {
    updateData.role = newRole;
  }

  try {
    const updatedUser = await userService.updateUser(targetUserId, updateData);
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

export const handleDeleteUser = async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }
    await userService.deleteUser(userId);
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};
