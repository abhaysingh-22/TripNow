import express from "express";
import { Router } from "express";
import { body } from "express-validator";
import rideController from "../controllers/ride.controller.js";
import { authUser } from "../middlewares/auth.middleware.js";

const router = Router();

router.post(
  "/create",
  [
    body("pickup")
      .isString()
      .notEmpty()
      .withMessage("Pickup location is required"),
    body("dropoff")
      .isString()
      .notEmpty()
      .withMessage("Dropoff location is required"),
    body("vehicleType")
      .isString()
      .notEmpty()
      .withMessage("Vehicle type is required"),
  ],
  authUser,
  rideController.createRide
);

export default router;
