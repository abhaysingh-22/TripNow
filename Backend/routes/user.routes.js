import express from "express";
import { Router } from "express";
import { body } from "express-validator"; // Importing express-validator for request validation it helps in validating the request body for user registration and login
import userController from "../controllers/user.controller"; 

const router = Router();

router.post(
  "/register",
  [
    body("fullName.firstName").notEmpty().withMessage("First name is required"),
    body("fullName.lastName").notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  userController.registerUser
);

export default router;
