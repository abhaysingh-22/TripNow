import Captain from "../models/captain.model.js";
import { createCaptain } from "../services/captain.service.js";
import { validationResult } from "express-validator";

const registerCaptain = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { fullName, email, password, vehicle } = req.body;

    const isCaptainExists = await Captain.findOne({ email });

    if (isCaptainExists) {
      return res.status(400).json({ message: "Captain already exists" });
    }

    // Hash the password before saving
    const hashedPassword = await Captain.hashPassword(password);

    const captain = await createCaptain({
      firstName: fullName.firstName,
      lastName: fullName.lastName,
      email,
      password: hashedPassword,
      color: vehicle.color,
      numberPlate: vehicle.numberPlate,
      capacity: vehicle.capacity,
      typeofVehicle: vehicle.typeofVehicle,
    });

    const token = captain.generateAuthToken();
    res.status(201).json({
      message: "Captain registered successfully",
      token,
    });
  } catch (error) {
    console.error("Error registering captain:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export {
  registerCaptain,
};
