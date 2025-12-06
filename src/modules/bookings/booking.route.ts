import { Router } from "express";
import {
  handleCreateBooking,
  handleGetBookings,
  handleUpdateBookingStatus,
} from "./booking.controller";
import { authenticate } from "../../middleware/auth";
import { authorize } from "../../middleware/role";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize(["admin", "customer"]),
  handleCreateBooking
);
router.get(
  "/",
  authenticate,
  authorize(["admin", "customer"]),
  handleGetBookings
);
router.put(
  "/:bookingId",
  authenticate,
  authorize(["admin", "customer"]),
  handleUpdateBookingStatus
);

export default router;
