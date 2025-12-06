import app from "./app";
import pool from "./config/database";

const PORT = process.env.PORT || 5000;

// --- SQL DDL (Data Definition Language) to create tables ---
const createTablesSQL = `
    CREATE TABLE IF NOT EXISTS "Users" (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL CHECK (email = LOWER(email)),
        password VARCHAR(255) NOT NULL CHECK (LENGTH(password) >= 6),
        phone VARCHAR(20) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'customer')) DEFAULT 'customer'
    );
    CREATE TABLE IF NOT EXISTS "Vehicles" (
        id SERIAL PRIMARY KEY,
        vehicle_name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('car', 'bike', 'van', 'SUV')),
        registration_number VARCHAR(100) UNIQUE NOT NULL,
        daily_rent_price NUMERIC(10, 2) NOT NULL CHECK (daily_rent_price > 0),
        availability_status VARCHAR(50) NOT NULL CHECK (availability_status IN ('available', 'booked')) DEFAULT 'available'
    );
    CREATE TABLE IF NOT EXISTS "Bookings" (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER NOT NULL REFERENCES "Users"(id) ON DELETE RESTRICT,
        vehicle_id INTEGER NOT NULL REFERENCES "Vehicles"(id) ON DELETE RESTRICT,
        rent_start_date DATE NOT NULL,
        rent_end_date DATE NOT NULL,
        total_price NUMERIC(10, 2) NOT NULL CHECK (total_price > 0),
        status VARCHAR(50) NOT NULL CHECK (status IN ('active', 'cancelled', 'returned')) DEFAULT 'active',
        CONSTRAINT check_end_after_start CHECK (rent_end_date > rent_start_date)
    );
    CREATE INDEX IF NOT EXISTS idx_vehicle_reg ON "Vehicles" (registration_number);
`;

// --- Database Initialization Function using async/await ---
async function initializeDatabase() {
  console.log("Attempting to initialize database tables...");
  try {
    await pool.query(createTablesSQL);
    console.log("✅ Database tables created successfully or already exist.");
  } catch (error) {
    console.error("❌ FATAL ERROR: Database initialization failed.", error);
    // Do not proceed if tables cannot be created
    process.exit(1);
  }
}

// --- Server Bootstrap ---
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
});
