import rideService from "../services/ride.service.js";
import { validationResult } from "express-validator";
import mapsService from "../services/maps.service.js";
import { sendMessageToSocketId } from "../socket.js";
import Captain from "../models/captain.model.js";
import Ride from "../models/ride.model.js";

const createRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { userId, pickup, dropoff, vehicleType } = req.body;

  try {
    const fare = await rideService.getFare(pickup, dropoff, vehicleType);
    const validFare = typeof fare === "number" && !isNaN(fare) ? fare : 0;

    const rideData = {
      userId: req.user._id,
      pickupLocation: pickup,
      dropoffLocation: dropoff,
      vehicleType,
      fare,
      otp: "",
    };
    const newRide = await rideService.createRide(rideData);

    // ✅ Populate the ride with user data
    const populatedRide = await Ride.findById(newRide._id).populate("userId");

    // Send response first
    res.status(201).json(newRide);

    // Background processing
    setImmediate(async () => {
      try {
        const { getCaptainsInRadius, getCoordinates } = mapsService;
        const pickupCoordinates = await getCoordinates(pickup);
        console.log("Pickup coordinates:", pickupCoordinates);

        const captainInRadius = await getCaptainsInRadius(
          pickupCoordinates.latitude,
          pickupCoordinates.longitude,
          5
        );

        captainInRadius.forEach((captain) => {
          if (captain.socketId) {
            console.log(`Sending ride request to captain: ${captain._id}`);
            sendMessageToSocketId(captain.socketId, "ride-request", {
              type: "newRide",
              ride: {
                _id: newRide._id,
                pickupLocation: pickup,
                dropoffLocation: dropoff,
                fare: fare,
                pickup: {
                  address: pickup,
                  time: "2 min away",
                },
                destination: {
                  address: dropoff,
                  time: "15 min",
                },
                distance: 5.2,
                duration: 15,
                amount: fare,
                pickupCoordinates,
                captainId: captain._id,
              },
              user: {
                _id: populatedRide.userId._id,
                name:
                  populatedRide.userId.fullName?.firstName +
                  " " +
                  (populatedRide.userId.fullName?.lastName || ""),
                rating: populatedRide.userId.rating || 4.5,
                photo:
                  populatedRide.userId.photo ||
                  "https://randomuser.me/api/portraits/lego/1.jpg",
              },
            });
          }
        });

        console.log("Total captains found:", captainInRadius?.length || 0);
        console.log(
          "Captain details:",
          JSON.stringify(captainInRadius, null, 2)
        );
      } catch (error) {
        console.error("Background processing error:", error);
      }
    });
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
  console.log("getFare called with:", { pickup, dropoff, vehicleType });

  try {
    console.log("Calling Google Maps API to calculate fare...");
    const fare = await rideService.getFare(pickup, dropoff, vehicleType);
    console.log("Google Maps API success! Calculated fare:", fare);
    return res.status(200).json({
      pickup,
      dropoff,
      vehicleType: vehicleType || "car",
      fare,
    });
  } catch (error) {
    console.error("Error in getFare:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

export default {
  createRide,
  getFare,
};
