import { Response } from "express";
import * as bookingService from "./booking.service";
import { CustomRequest } from "../../middleware/auth";

export const handleCreateBooking = async (
  req: CustomRequest,
  res: Response
) => {
  const customerId = req.user!.userId;
  const { vehicle_id, rent_start_date, rent_end_date } = req.body;

  try {
    const newBooking = await bookingService.createBooking(
      customerId,
      vehicle_id,
      rent_start_date,
      rent_end_date
    );
    res
      .status(201)
      .json({
        success: true,
        message: "Booking created successfully",
        data: newBooking,
      });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

export const handleGetBookings = async (req: CustomRequest, res: Response) => {
  const userId = req.user!.userId;
  const userRole = req.user!.role;

  try {
    const bookings = await bookingService.getBookings(userId, userRole);
    res
      .status(200)
      .json({
        success: true,
        message: "Bookings retrieved successfully",
        data: bookings,
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to retrieve bookings." });
  }
};

export const handleUpdateBookingStatus = async (
  req: CustomRequest,
  res: Response
) => {
  const bookingId = req.params.bookingId;
  const { status } = req.body;
  const currentUserId = req.user!.userId;
  const currentUserRole = req.user!.role;

  if (!bookingId) {
    return res.status(400).json({
      success: false,
      message: "Booking ID is required",
    });
  }

  if (status !== "cancelled" && status !== "returned") {
    return res
      .status(400)
      .json({
        success: false,
        message:
          'Invalid status update. Status must be "cancelled" or "returned".',
      });
  }

  try {
    const updatedBooking = await bookingService.updateBookingStatus(
      bookingId,
      status,
      currentUserId,
      currentUserRole
    );

    let message = `Booking marked as ${status}`;
    if (status === "returned") message += ". Vehicle is now available";

    res
      .status(200)
      .json({ success: true, message: message, data: updatedBooking });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};
