import { Pool } from "pg";
import * as dotenv from "dotenv";
dotenv.config();

// Use the connection string from the .env file
const pool = new Pool({
  connectionString: process.env.DB_CONNECTION_STRING,
  // Add SSL configuration for remote databases like Neon
  ssl: {
    rejectUnauthorized: false,
  },
});

export default pool;
