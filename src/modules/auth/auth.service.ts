import pool from "../../config/database";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

export const signUp = async (
  name: string,
  email: string,
  password: string,
  phone: string
) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const role = "customer";

  const result = await pool.query(
    `INSERT INTO "Users" (name, email, password, phone, role) 
         VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, role`,
    [name, email.toLowerCase(), hashedPassword, phone, role]
  );

  return result.rows[0];
};

export const signIn = async (email: string, password: string) => {
  const userResult = await pool.query(
    `SELECT * FROM "Users" WHERE email = $1`,
    [email.toLowerCase()]
  );
  const user = userResult.rows[0];

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new Error("Invalid credentials");
  }

  const payload = { userId: user.id, email: user.email, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "1d",
  });

  // Exclude password and return user details for the response
  const { password: _, ...userData } = user;

  return { token, user: userData };
};
