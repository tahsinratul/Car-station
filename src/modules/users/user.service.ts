import pool from "../../config/database";

const hasActiveBookings = async (userId: string | number) => {
  const result = await pool.query(
    `SELECT id FROM "Bookings" WHERE customer_id = $1 AND status IN ('active', 'booked')`,
    [userId]
  );
  return result.rows.length > 0;
};

export const getAllUsers = async () => {
  const result = await pool.query(
    `SELECT id, name, email, phone, role FROM "Users"`
  );
  return result.rows;
};

export const updateUser = async (targetUserId: string, updateData: any) => {
  const { name, email, phone, role } = updateData;

  let queryParts: string[] = [];
  let queryValues: any[] = [];
  let paramCount = 1;

  if (name !== undefined) {
    queryParts.push(`name = $${paramCount++}`);
    queryValues.push(name);
  }
  if (email !== undefined) {
    queryParts.push(`email = $${paramCount++}`);
    queryValues.push(email.toLowerCase());
  }
  if (phone !== undefined) {
    queryParts.push(`phone = $${paramCount++}`);
    queryValues.push(phone);
  }
  if (role !== undefined) {
    queryParts.push(`role = $${paramCount++}`);
    queryValues.push(role);
  }

  if (queryParts.length === 0) {
    throw new Error("No fields provided for update.");
  }

  queryValues.push(targetUserId);

  const query = `UPDATE "Users" SET ${queryParts.join(
    ", "
  )} WHERE id = $${paramCount} RETURNING id, name, email, phone, role`;

  const result = await pool.query(query, queryValues);

  if (result.rowCount === 0) {
    throw new Error("User not found.");
  }
  return result.rows[0];
};

export const deleteUser = async (userId: string) => {
  if (await hasActiveBookings(userId)) {
    throw new Error("User has active bookings and cannot be deleted.");
  }

  const result = await pool.query(
    `DELETE FROM "Users" WHERE id = $1 RETURNING *`,
    [userId]
  );

  if (result.rowCount === 0) {
    throw new Error("User not found.");
  }
  return true;
};
