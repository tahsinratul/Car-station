import { Request, Response } from "express";
import * as vehicleService from "./vehicle.service";
import { CustomRequest } from "../../middleware/auth";

export const handleAddVehicle = async (req: Request, res: Response) => {
  try {
    const newVehicle = await vehicleService.createVehicle(req.body);
    res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: newVehicle,
    });
  } catch (error) {
    if ((error as any).code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Registration number already exists.",
      });
    }
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

export const handleGetAllVehicles = async (req: Request, res: Response) => {
  try {
    const vehicles = await vehicleService.getAllVehicles();
    res.status(200).json({
      success: true,
      message: "Vehicles retrieved successfully",
      data: vehicles,
    });
  } catch (error) {
    res
      .status(200)
      .json({ success: true, message: "No vehicles found", data: [] });
  }
};

export const handleGetVehicleById = async (req: Request, res: Response) => {
  try {
    const vehicleId = req.params.vehicleId;
    if (!vehicleId) {
      return res.status(400).json({
        success: false,
        message: "Vehicle ID is required",
      });
    }
    const vehicle = await vehicleService.getVehicleById(vehicleId);
    res.status(200).json({
      success: true,
      message: "Vehicle retrieved successfully",
      data: vehicle,
    });
  } catch (error) {
    res.status(404).json({ success: false, message: (error as Error).message });
  }
};

export const handleUpdateVehicle = async (req: Request, res: Response) => {
  try {
    const vehicleId = req.params.vehicleId;
    if (!vehicleId) {
      return res.status(400).json({
        success: false,
        message: "Vehicle ID is required",
      });
    }
    const updatedVehicle = await vehicleService.updateVehicle(
      vehicleId,
      req.body
    );
    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: updatedVehicle,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

export const handleDeleteVehicle = async (req: Request, res: Response) => {
  try {
    const vehicleId = req.params.vehicleId;
    if (!vehicleId) {
      return res.status(400).json({
        success: false,
        message: "Vehicle ID is required",
      });
    }
    await vehicleService.deleteVehicle(vehicleId);
    res
      .status(200)
      .json({ success: true, message: "Vehicle deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};
