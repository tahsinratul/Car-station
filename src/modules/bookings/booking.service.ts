import pool from "../../config/database";

const calculateRentalDays = (start: string, end: string): number => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const createBooking = async (
  customerId: string,
  vehicleId: string,
  startDate: string,
  endDate: string
) => {
  if (new Date(endDate) <= new Date(startDate)) {
    throw new Error("Rent end date must be after start date.");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Check Vehicle Availability and Price
    const vehicleResult = await client.query(
      `SELECT daily_rent_price, availability_status FROM "Vehicles" WHERE id = $1 FOR UPDATE`,
      [vehicleId]
    );
    const vehicle = vehicleResult.rows[0];

    if (!vehicle || vehicle.availability_status !== "available") {
      throw new Error(
        "Vehicle not found or is currently not available for booking."
      );
    }

    // 2. Calculate Price
    const rentalDays = calculateRentalDays(startDate, endDate);
    const dailyRate = parseFloat(vehicle.daily_rent_price);
    const totalPrice = dailyRate * rentalDays;

    // 3. Insert Booking
    const bookingResult = await client.query(
      `INSERT INTO "Bookings" (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status) 
             VALUES ($1, $2, $3, $4, $5, 'active') RETURNING *`,
      [customerId, vehicleId, startDate, endDate, totalPrice]
    );

    // 4. Update Vehicle Status
    await client.query(
      `UPDATE "Vehicles" SET availability_status = 'booked' WHERE id = $1`,
      [vehicleId]
    );

    await client.query("COMMIT");

    // Add vehicle details to the response data structure
    const bookingData = bookingResult.rows[0];
    bookingData.vehicle = {
      vehicle_name: vehicle.vehicle_name,
      daily_rent_price: dailyRate,
    };

    return bookingData;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const getBookings = async (
  userId: string | null,
  userRole: "admin" | "customer"
) => {
  if (userRole === "admin") {
    const result = await pool.query(
      `SELECT 
                b.*, 
                v.vehicle_name, v.registration_number, v.type,
                u.name AS customer_name, u.email AS customer_email 
             FROM "Bookings" b
             JOIN "Vehicles" v ON b.vehicle_id = v.id
             JOIN "Users" u ON b.customer_id = u.id
             ORDER BY b.rent_start_date DESC`
    );
    return result.rows.map((row) => ({
      ...row,
      customer: { name: row.customer_name, email: row.customer_email },
      vehicle: {
        vehicle_name: row.vehicle_name,
        registration_number: row.registration_number,
        type: row.type,
      },
    }));
  } else {
    const result = await pool.query(
      `SELECT 
                b.*, 
                v.vehicle_name, v.registration_number, v.type 
             FROM "Bookings" b
             JOIN "Vehicles" v ON b.vehicle_id = v.id
             WHERE b.customer_id = $1
             ORDER BY b.rent_start_date DESC`,
      [userId]
    );
    return result.rows.map((row) => ({
      ...row,
      vehicle: {
        vehicle_name: row.vehicle_name,
        registration_number: row.registration_number,
        type: row.type,
      },
    }));
  }
};

export const updateBookingStatus = async (
  bookingId: string,
  status: "cancelled" | "returned",
  currentUserId: string,
  currentUserRole: "admin" | "customer"
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Get current booking details for verification
    const bookingResult = await client.query(
      `SELECT * FROM "Bookings" WHERE id = $1 FOR UPDATE`,
      [bookingId]
    );
    const booking = bookingResult.rows[0];

    if (!booking) {
      throw new Error("Booking not found.");
    }
    if (booking.status !== "active") {
      throw new Error(`Booking status is already '${booking.status}'.`);
    }

    // Authorization and Business Logic Checks
    if (status === "cancelled") {
      if (
        currentUserRole !== "customer" ||
        parseInt(booking.customer_id) !== parseInt(currentUserId)
      ) {
        throw new Error(
          "Unauthorized action. Only the booking customer can cancel."
        );
      }
      if (new Date(booking.rent_start_date) <= new Date()) {
        throw new Error("Booking can only be cancelled before the start date.");
      }
    }

    if (status === "returned") {
      if (currentUserRole !== "admin") {
        throw new Error(
          "Unauthorized action. Only an Admin can mark a booking as returned."
        );
      }
    }

    // 2. Update Booking Status
    const updateBooking = await client.query(
      `UPDATE "Bookings" SET status = $1 WHERE id = $2 RETURNING *`,
      [status, bookingId]
    );

    // 3. Update Vehicle Status to 'available'
    await client.query(
      `UPDATE "Vehicles" SET availability_status = 'available' WHERE id = $1`,
      [booking.vehicle_id]
    );

    await client.query("COMMIT");

    const responseData = updateBooking.rows[0];
    responseData.vehicle = { availability_status: "available" };
    return responseData;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
