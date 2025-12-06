import express from "express";
import helmet from "helmet";
import cors from "cors";

// Import Routes
import authRoutes from "./modules/auth/auth.route";
import vehicleRoutes from "./modules/vehicles/vehicle.route";
import userRoutes from "./modules/users/user.route";
import bookingRoutes from "./modules/bookings/booking.route";

const app = express();

// Global Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Base Health Check Route
app.get("/", (req, res) => {
  res.send({ message: "Vehicle Rental API is running!" });
});

// --- Feature Routes ---
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/vehicles", vehicleRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/bookings", bookingRoutes);

export default app;
