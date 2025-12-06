import { Router } from "express";
import * as vehicleController from "./vehicle.controller";
import { authenticate } from "../../middleware/auth";
import { isAdmin } from "../../middleware/role";

const router = Router();

router.post("/", authenticate, isAdmin, vehicleController.handleAddVehicle);
router.get("/", vehicleController.handleGetAllVehicles);
router.get("/:vehicleId", vehicleController.handleGetVehicleById);
router.put(
  "/:vehicleId",
  authenticate,
  isAdmin,
  vehicleController.handleUpdateVehicle
);
router.delete(
  "/:vehicleId",
  authenticate,
  isAdmin,
  vehicleController.handleDeleteVehicle
);

export default router;
