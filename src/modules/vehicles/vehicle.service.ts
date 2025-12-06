import pool from "../../config/database";

export const createVehicle = async (vehicleData: any) => {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = vehicleData;
  const status = availability_status || "available";

  const result = await pool.query(
    `INSERT INTO "Vehicles" (vehicle_name, type, registration_number, daily_rent_price, availability_status) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [vehicle_name, type, registration_number, daily_rent_price, status]
  );

  return result.rows[0];
};

export const getAllVehicles = async () => {
  const result = await pool.query(`SELECT * FROM "Vehicles" ORDER BY id ASC`);
  if (result.rows.length === 0) {
    throw new Error("No vehicles found");
  }
  return result.rows;
};

export const getVehicleById = async (vehicleId: string) => {
  const result = await pool.query(`SELECT * FROM "Vehicles" WHERE id = $1`, [
    vehicleId,
  ]);
  if (result.rowCount === 0) {
    throw new Error("Vehicle not found.");
  }
  return result.rows[0];
};

export const updateVehicle = async (vehicleId: string, updateData: any) => {
  const {
    vehicle_name,
    type,
    registration_number,
    daily_rent_price,
    availability_status,
  } = updateData;

  const queryParts: string[] = [];
  const queryValues: any[] = [];
  let paramCount = 1;

  if (vehicle_name !== undefined) {
    queryParts.push(`vehicle_name = $${paramCount++}`);
    queryValues.push(vehicle_name);
  }
  if (type !== undefined) {
    queryParts.push(`type = $${paramCount++}`);
    queryValues.push(type);
  }
  if (registration_number !== undefined) {
    queryParts.push(`registration_number = $${paramCount++}`);
    queryValues.push(registration_number);
  }
  if (daily_rent_price !== undefined) {
    queryParts.push(`daily_rent_price = $${paramCount++}`);
    queryValues.push(daily_rent_price);
  }
  if (availability_status !== undefined) {
    queryParts.push(`availability_status = $${paramCount++}`);
    queryValues.push(availability_status);
  }

  if (queryParts.length === 0) {
    throw new Error("No valid fields provided for update.");
  }

  queryValues.push(vehicleId);
  const query = `UPDATE "Vehicles" SET ${queryParts.join(
    ", "
  )} WHERE id = $${paramCount} RETURNING *`;

  const result = await pool.query(query, queryValues);

  if (result.rowCount === 0) {
    throw new Error("Vehicle not found.");
  }
  return result.rows[0];
};

export const deleteVehicle = async (vehicleId: string) => {
  // Check for Active Bookings
  const activeBookings = await pool.query(
    `SELECT id FROM "Bookings" WHERE vehicle_id = $1 AND status IN ('active', 'booked')`,
    [vehicleId]
  );

  if (activeBookings.rows.length > 0) {
    throw new Error("Vehicle has active bookings and cannot be deleted.");
  }

  const result = await pool.query(
    `DELETE FROM "Vehicles" WHERE id = $1 RETURNING *`,
    [vehicleId]
  );

  if (result.rowCount === 0) {
    throw new Error("Vehicle not found.");
  }
  return true;
};
