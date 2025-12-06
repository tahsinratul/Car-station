import { Router } from "express";
import {
  handleGetAllUsers,
  handleUpdateUser,
  handleDeleteUser,
} from "./user.controller";
import { authenticate } from "../../middleware/auth";
import { isAdmin } from "../../middleware/role";

const router = Router();

router.get("/", authenticate, isAdmin, handleGetAllUsers);
router.put("/:userId", authenticate, handleUpdateUser);
router.delete("/:userId", authenticate, isAdmin, handleDeleteUser);

export default router;
