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
    // After line 30 (after populating ride):
    const populatedRide = await Ride.findById(newRide._id).populate({
      path: "userId",
      select: "fullName name email photo rating",
    });

    // ✅ Add this debug logging:
    console.log("🔍 POPULATED RIDE DEBUG:");
    console.log("populatedRide.userId:", populatedRide.userId);
    console.log("fullName:", populatedRide.userId?.fullName);
    console.log("email:", populatedRide.userId?.email);
    console.log("========================");
    // Send response first
    res.status(201).json(newRide);

    // Background processing
    setImmediate(async () => {
      try {
        const { getCaptainsInRadius, getCoordinates } = mapsService;

        // Get trip details first
        const trip = await rideService.getFareWithDetails(
          pickup,
          dropoff,
          vehicleType
        );

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
                fare: Number(fare) || 0,
                pickup: {
                  address: pickup,
                  time: "2 min away",
                },
                destination: {
                  address: dropoff,
                  time: `${Math.round(Number(trip.duration)) || 15} min`, // Use trip.duration
                },
                distance: Number(trip.distance) || 5.2, // Use trip.distance
                duration: Number(trip.duration) || 15,
                amount: Number(fare) || 0,
                pickupCoordinates,
                captainId: captain._id,
              },
              user: {
                _id: populatedRide.userId._id,
                name: populatedRide.userId.fullName?.firstName
                  ? `${populatedRide.userId.fullName.firstName} ${
                      populatedRide.userId.fullName.lastName || ""
                    }`.trim()
                  : populatedRide.userId.email || "Unknown User", // Use email as fallback since your User model has email
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

// In the getFare function:
const getFare = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { pickup, dropoff, vehicleType } = req.query;
  console.log("getFare called with:", { pickup, dropoff, vehicleType });

  try {
    console.log("Calling Google Maps API to calculate fare...");
    const trip = await rideService.getFareWithDetails(
      pickup,
      dropoff,
      vehicleType
    );
    console.log("✅ Trip calculation result:", trip);

    return res.status(200).json({
      pickup,
      dropoff,
      vehicleType: vehicleType || "car",
      fare: trip.fare,
      distance: trip.distance, // ✅ Numeric value
      duration: trip.duration, // ✅ Numeric value
      distanceText: trip.distanceText, // ✅ For display
      durationText: trip.durationText, // ✅ For display
    });
  } catch (error) {
    console.error("❌ Error calculating fare:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

const confirmRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { pickup, dropoff, vehicleType, paymentMethod } = req.body;

  try {
    const fare = await rideService.getFare(pickup, dropoff, vehicleType);

    const rideData = {
      userId: req.user._id,
      pickupLocation: pickup,
      dropoffLocation: dropoff,
      vehicleType,
      paymentMethod,
      fare,
    };

    const newRide = await rideService.createRide(rideData);

    const populatedRide = await Ride.findById(newRide._id).populate({
      path: "userId",
      select: "fullName name email photo rating",
    });

    // console.log("Ride created and populated:", {
    //   rideId: newRide._id,
    //   userId: populatedRide.userId._id,
    //   otp: newRide.otp,
    // });

    res.status(201).json({
      success: true,
      messgae: "Ride request sent to nearby drivers",
      ride: {
        _id: newRide._id,
        pickupLocation: pickup,
        dropoffLocation: dropoff,
        fare: fare,
        otp: newRide.otp,
        status: newRide.status,
        paymentMethod: paymentMethod,
      },
    });

    setImmediate(async () => {
      try {
        const { getCaptainsInRadius, getCoordinates } = mapsService;

        const trip = await rideService.getFareWithDetails(
          pickup,
          dropoff,
          vehicleType
        );

        const pickupCoordinates = await getCoordinates(pickup);
        console.log("Pickup coordinates:", pickupCoordinates);

        const captainInRadius = await getCaptainsInRadius(
          pickupCoordinates.latitude,
          pickupCoordinates.longitude,
          5
        );

        let userName = "Unknown User";
        if (populatedRide.userId) {
          if (populatedRide.userId.fullName) {
            userName = `${populatedRide.userId.fullName.firstName} ${
              populatedRide.userId.fullName.lastName || ""
            }`.trim();
          } else if (populatedRide.userId.name) {
            userName = populatedRide.userId.name;
          } else if (populatedRide.userId.email) {
            userName = populatedRide.userId.email;
          }
        }

        captainInRadius.forEach((captain) => {
          if (captain.socketId) {
            console.log(`Sending ride request to captain: ${captain._id}`);

            const rideRequestData = {
              type: "newRide",
              ride: {
                _id: newRide._id,
                pickupLocation: pickup,
                dropoffLocation: dropoff,
                fare: Number(fare) || 0,
                pickup: {
                  address: pickup,
                  time: trip.pickupTime,
                },
                destination: {
                  address: dropoff,
                  time: `${Math.round(Number(trip.duration)) || 15} min`,
                },
                distance: Number(trip.distance) || 5.2,
                duration: Math.round(Number(trip.duration)) || 15,
                amount: Number(fare) || 0,
                paymentMethod: paymentMethod,
                pickupCoordinates: pickupCoordinates,
                captainId: captain._id,
              },
              user: {
                _id: populatedRide.userId._id,
                name: userName,
                rating: populatedRide.userId.rating || 4.5,
                photo:
                  populatedRide.userId.photo ||
                  "https://randomuser.me/api/portraits/lego/1.jpg",
              },
            };

            sendMessageToSocketId(
              captain.socketId,
              "ride-request",
              rideRequestData
            );
          }
        });

        console.log("ride request sent to all captains");
      } catch (error) {
        console.error("Background processing error:", error);
      }
    });

    return res
      .status(201)
      .json({ message: "Ride confirmed", ride: populatedRide });
  } catch (error) {
    console.error("❌ Error confirming ride:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

const acceptRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId } = req.body;
  const captainId = req.captain._id;

  try {
    const ride = await Ride.findByIdAndUpdate(
      rideId,
      { captainId: captainId, status: "accepted" },
      { new: true }
    ).populate("userId");

    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }

    if (ride.userId.socketId) {
      console.log(`📤 Sending OTP to user: ${ride.userId._id}`);
      sendMessageToSocketId(ride.userId.socketId, "ride-accepted", {
        rideId: ride._id,
        otp: ride.otp, // ✅ Send OTP to user when captain accepts
        captain: {
          _id: captainId,
          name: req.captain.fullName?.firstName || "Driver",
          photo:
            req.captain.photo ||
            "https://randomuser.me/api/portraits/lego/1.jpg",
          vehicle: req.captain.vehicle,
        },
        message: "Driver found! Your ride has been accepted.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Ride accepted successfully",
      ride: {
        _id: ride._id,
        pickupLocation: ride.pickupLocation,
        dropoffLocation: ride.dropoffLocation,
        fare: ride.fare,
        status: ride.status,
        otp: ride.otp, // ✅ Send OTP back to captain for verification
      },
    });
  } catch (error) {
    console.error("Accept ride error:", error);
    return res.status(500).json({ error: error.message });
  }
};

const startRide = async (req, res) => {
  console.log("🔍 START RIDE DEBUG:");
  console.log("Request body:", req.body);
  console.log("Captain ID:", req.captain?._id);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("❌ Validation errors:", errors.array());
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array(),
    });
  }

  const { rideId, otp } = req.body;
  const captainId = req.captain._id;

  try {
    console.log(`🎯 Processing ride start: ${rideId} with OTP: ${otp}`);

    // Find ride with OTP
    const ride = await Ride.findById(rideId).select("+otp");

    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }

    console.log("✅ Ride found:", {
      rideId: ride._id,
      status: ride.status,
      captainId: ride.captainId,
      storedOtp: ride.otp, // ✅ Log stored OTP
      providedOtp: otp, // ✅ Log provided OTP
      otpMatch: ride.otp === otp, // ✅ Log if they match
    });

    if (ride.captainId.toString() !== captainId.toString()) {
      return res
        .status(403)
        .json({ error: "You are not assigned to this ride" });
    }

    if (ride.status !== "accepted") {
      return res.status(400).json({
        error: `Ride is not in accepted status. Current status: ${ride.status}`,
      });
    }

    // ✅ More detailed OTP verification
    console.log("🔑 OTP Verification:");
    console.log("Provided OTP:", otp, typeof otp);
    console.log("Stored OTP:", ride.otp, typeof ride.otp);
    console.log("OTP Match:", ride.otp === otp);

    // Verify OTP
    if (ride.otp !== otp) {
      return res
        .status(400)
        .json({ error: "Invalid OTP. Please check with passenger." });
    }

    // Update ride status
    const updatedRide = await Ride.findByIdAndUpdate(
      rideId,
      { status: "in-progress" },
      { new: true }
    );

    console.log(`✅ Ride ${rideId} started successfully`);

    res.status(200).json({
      success: true,
      message: "Ride started successfully",
      ride: updatedRide,
    });
  } catch (error) {
    console.error("❌ Start ride error:", error);
    return res.status(500).json({ error: error.message });
  }
};

const completeRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId, fare, distance, duration } = req.body;
  const captainId = req.captain._id;

  try {
    console.log(`🏁 Completing ride: ${rideId} by captain: ${captainId}`);

    // Find and update the ride
    const ride = await Ride.findOneAndUpdate(
      {
        _id: rideId,
        captainId: captainId,
        status: { $in: ["accepted", "in-progress"] },
      },
      {
        status: "completed",
        completedAt: new Date(),
        fare: fare,
        distance: distance,
        duration: duration,
      },
      { new: true }
    );

    if (!ride) {
      return res.status(404).json({
        error: "Ride not found or you're not authorized to complete it",
      });
    }

    // ✅ Update captain's statistics
    const updatedCaptain = await Captain.findByIdAndUpdate(captainId, {
      $inc: {
        totalRides: 1,
        totalEarnings: fare,
        totalDistance: distance,
      },
    });

    console.log("✅ Ride completed and captain stats updated:", {
      rideId: ride._id,
      captainId: captainId,
      newTotals: {
        totalRides: updatedCaptain.totalRides,
        totalEarnings: updatedCaptain.totalEarnings,
        totalDistance: updatedCaptain.totalDistance,
      },
    });

    res.status(200).json({
      success: true,
      message: "Ride completed successfully",
      ride: {
        _id: ride._id,
        status: ride.status,
        fare: ride.fare,
        distance: ride.distance,
        duration: ride.duration,
        completedAt: ride.completedAt,
      },
      captain: {
        totalRides: updatedCaptain.totalRides,
        totalEarnings: updatedCaptain.totalEarnings,
        totalDistance: updatedCaptain.totalDistance,
      },
    });
  } catch (error) {
    console.error("❌ Complete ride error:", error);
    return res.status(500).json({ error: error.message });
  }
};

export default {
  createRide,
  getFare,
  confirmRide,
  acceptRide,
  startRide,
  completeRide,
};
