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

const getFare = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { pickup, dropoff, vehicleType } = req.query;
  console.log('getFare called with:', { pickup, dropoff, vehicleType });

  try {
    console.log('Calling Google Maps API to calculate fare...');
    const fare = await rideService.getFare(pickup, dropoff, vehicleType);
    console.log('Google Maps API success! Calculated fare:', fare);
    return res.status(200).json({ 
      pickup, 
      dropoff, 
      vehicleType: vehicleType || 'car',
      fare 
    });
  } catch (error) {
    console.error('Error in getFare:', error.message);
    return res.status(500).json({ error: error.message });
  }
};

export default {
  createRide,
  getFare,
};
