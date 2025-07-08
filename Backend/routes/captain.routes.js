import { Router } from "express";
import { registerCaptain } from "../controllers/captain.controller.js";
// import authCaptain from "../middlewares/auth.middleware.js";
const router = Router();
import { body } from "express-validator";

router.post(
  "/register",
  [
    body("fullName.firstName").notEmpty().withMessage("First name is required"),
    body("email").isEmail().withMessage("Invalid email address"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("vehicle.color").notEmpty().withMessage("Vehicle color is required"),
    body("vehicle.numberPlate")
      .notEmpty()
      .withMessage("Vehicle number plate is required"),
    body("vehicle.capacity")
      .isNumeric()
      .withMessage("Vehicle capacity must be a number"),
    body("vehicle.typeofVehicle").notEmpty().withMessage("Vehicle type is required"),
  ],
  registerCaptain
);

export default router;
