import BlacklistToken from "../models/blacklistToken.model.js";
import Captain from "../models/captain.model.js";
import { createCaptain } from "../services/captain.service.js";
import { validationResult } from "express-validator";
import Ride from "../models/ride.model.js";
import jwt from "jsonwebtoken";

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
      captain: {
        _id: captain._id,
        fullName: {
          firstName: captain.fullName.firstName,
          lastName: captain.fullName.lastName,
        },
        email: captain.email,
        vehicle: captain.vehicle,
      },
      token,
    });
  } catch (error) {
    console.error("Error registering captain:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const loginCaptain = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const captain = await Captain.findOne({ email }).select("+password");

    if (!captain) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await captain.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = captain.generateAuthToken();
    if (!token) {
      return res.status(500).json({ message: "Error generating token" });
    }

    res.cookie("token", token);

    res.status(200).json({
      message: "Captain logged in successfully",
      token,
    });
  } catch (error) {
    console.error("Error logging in captain:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getCaptainProfile = async (req, res) => {
  try {
    const captain = req.captain;
    res.status(200).json({
      message: "Captain profile fetched successfully",
      captain,
    });
  } catch (error) {
    console.error("Error fetching captain profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const logoutCaptain = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Authentication token is required" });
    }

    await BlacklistToken.create({ token });

    res.clearCookie("token");
    res.status(200).json({ message: "Captain logged out successfully" });
  } catch (error) {
    console.error("Error logging out captain:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getCaptainStats = async (req, res) => {
  try {
    const captainId = req.captain._id;

    console.log(`📊 Fetching stats for captain: ${captainId}`);

    // Get captain data with updated stats
    const captain = await Captain.findById(captainId).select(
      "totalRides totalEarnings totalDistance"
    );

    if (!captain) {
      return res.status(404).json({ error: "Captain not found" });
    }

    // Get today's date range
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

    // Get today's completed rides for this captain
    const todayRides = await Ride.find({
      captainId: captainId,
      status: "completed",
      completedAt: {
        $gte: startOfToday,
        $lt: endOfToday,
      },
    });

    // Calculate today's stats
    const todayEarnings = todayRides.reduce(
      (total, ride) => total + (ride.fare || 0),
      0
    );
    const todayDistance = todayRides.reduce(
      (total, ride) => total + (ride.distance || 0),
      0
    );
    const todayRidesCount = todayRides.length;

    // Calculate hours online (simplified - you can implement actual tracking)
    const hoursOnline =
      todayRidesCount > 0 ? Math.max(todayRidesCount * 0.5, 2) : 0;

    const stats = {
      today: {
        earnings: todayEarnings,
        hoursOnline: hoursOnline,
        distance: todayDistance,
        // rides: todayRidesCount,
      },
      career: {
        totalRides: captain.totalRides || 0,
        totalEarnings: captain.totalEarnings || 0,
        totalDistance: captain.totalDistance || 0,
      },
    };

    console.log("✅ Captain stats fetched:", stats);

    res.status(200).json({
      success: true,
      stats: stats,
    });
  } catch (error) {
    console.error("❌ Get captain stats error:", error);
    res.status(500).json({ error: "Failed to fetch captain stats" });
  }
};

export {
  registerCaptain,
  loginCaptain,
  getCaptainProfile,
  logoutCaptain,
  getCaptainStats,
};
