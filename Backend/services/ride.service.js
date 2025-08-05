import Ride from "../models/ride.model.js";
import mapsService from "./maps.service.js";
import bcrypt from 'bcrypt';
import crypto from 'crypto';

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

  // Parse distance - extract numeric value from strings like "5.2 km" or "5200 m"
  let distanceInKm;
  if (typeof distance === "string") {
    const distanceMatch = distance.match(/[\d.]+/);
    const distanceValue = parseFloat(distanceMatch ? distanceMatch[0] : 0);
    if (distance.toLowerCase().includes("km")) {
      distanceInKm = distanceValue;
    } else if (distance.toLowerCase().includes("m")) {
      distanceInKm = distanceValue / 1000;
    } else {
      distanceInKm = distanceValue / 1000; // assume meters if no unit
    }
  } else {
    distanceInKm = distance / 1000; // assume meters
  }

  // Parse duration - extract numeric value from strings like "15 mins" or "900 secs"
  let durationInMinutes;
  if (typeof duration === "string") {
    const durationMatch = duration.match(/[\d.]+/);
    const durationValue = parseFloat(durationMatch ? durationMatch[0] : 0);
    if (duration.toLowerCase().includes("hour")) {
      durationInMinutes = durationValue * 60;
    } else if (duration.toLowerCase().includes("min")) {
      durationInMinutes = durationValue;
    } else if (duration.toLowerCase().includes("sec")) {
      durationInMinutes = durationValue / 60;
    } else {
      durationInMinutes = durationValue / 60; // assume seconds if no unit
    }
  } else {
    durationInMinutes = duration / 60; // assume seconds
  }

  const fare =
    vehicleRate.baseFare +
    distanceInKm * vehicleRate.perKm +
    durationInMinutes * vehicleRate.perMinute;

  return Math.round(fare * 100) / 100;
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
};
