import Ride from "../models/ride.model.js";
import mapsService from "./maps.service.js";
import bcrypt from "bcrypt";
import crypto from "crypto";

async function getFare(pickupLocation, dropoffLocation, vehicleType = "car") {
  if (!pickupLocation || !dropoffLocation) {
    throw new Error("Both pickup and dropoff locations are required.");
  }

  try {
    const { distance, duration } = await mapsService.getDistanceTime(
      pickupLocation,
      dropoffLocation
    );
    if (!distance || !duration) {
      throw new Error("Could not retrieve distance or duration.");
    }
    const fare = calculateFare(distance, duration, vehicleType);
    return fare;
  } catch (error) {
    throw new Error(`Failed to calculate fare: ${error.message}`);
  }
}

function calculateFare(distance, duration, vehicleType = "car") {
  const rates = {
    auto: {
      baseFare: 25,
      perKm: 12,
      perMinute: 2,
    },
    car: {
      baseFare: 50,
      perKm: 15,
      perMinute: 3,
    },
    motorcycle: {
      baseFare: 20,
      perKm: 8,
      perMinute: 1.5,
    },
    bike: {
      baseFare: 20,
      perKm: 8,
      perMinute: 1.5,
    },
  };

  const vehicleRate = rates[(vehicleType || "car").toLowerCase()] || rates.car;

  // ✅ Now distance and duration should be numbers
  const distanceInKm = typeof distance === "number" ? distance : parseFloat(distance) || 0;
  const durationInMinutes = typeof duration === "number" ? duration : parseFloat(duration) || 0;

  console.log("Fare calculation inputs:", {
    vehicleType,
    distanceInKm,
    durationInMinutes,
    rates: vehicleRate,
  });

  const fare =
    vehicleRate.baseFare +
    distanceInKm * vehicleRate.perKm +
    durationInMinutes * vehicleRate.perMinute;

  const finalFare = Math.round(fare * 100) / 100; // Round to 2 decimal places

  console.log("Calculated fare:", finalFare);

  return finalFare;
}

// ✅ Update getFareWithDetails to return properly formatted data
async function getFareWithDetails(
  pickupLocation,
  dropoffLocation,
  vehicleType = "car"
) {
  const trip = await mapsService.getDistanceTime(
    pickupLocation,
    dropoffLocation
  );
  const fare = calculateFare(trip.distance, trip.duration, vehicleType);

  return {
    fare,
    distance: trip.distance, // Already a number
    duration: trip.duration, // Already a number
    distanceText: trip.distanceText, // For display purposes
    durationText: trip.durationText, // For display purposes
  };
}

const createRide = async (rideData) => {
  const { userId, pickupLocation, dropoffLocation, vehicleType } = rideData;

  if (!userId || !pickupLocation || !dropoffLocation || !vehicleType) {
    throw new Error(
      "User ID, pickup location, dropoff location, and vehicle type are required."
    );
  }

  try {
    const fare = await getFare(pickupLocation, dropoffLocation, vehicleType);
    const { otp } = generateOTP();
    const newRide = new Ride({
      userId,
      pickupLocation,
      dropoffLocation,
      fare,
      status: "pending",
      otp: otp,
    });

    const savedRide = await newRide.save();
    return savedRide;
  } catch (error) {
    throw new Error(`Failed to create ride: ${error.message}`);
  }
};
function generateOTP() {
  const otp = crypto.randomInt(1000, 9999).toString();
  const hashedOTP = bcrypt.hashSync(otp, 10);
  return { otp, hashedOTP };
}

export default {
  createRide,
  generateOTP,
  getFare,
  calculateFare,
  getFareWithDetails,
};
