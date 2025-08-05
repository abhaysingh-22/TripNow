import rideService from "../services/ride.service.js";
import { validationResult } from "express-validator";

const createRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { userId, pickup, dropoff, vehicleType } = req.body;

  try {
    const fare = await rideService.getFare(pickup, dropoff, vehicleType);
    const rideData = {
      userId: req.user._id,
      pickupLocation: pickup,
      dropoffLocation: dropoff,
      vehicleType,
      fare,
    };
    const newRide = await rideService.createRide(rideData);
    return res.status(201).json(newRide);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export default {
  createRide,
};
