import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import Captain from "../models/captain.model.js";

// Configure environment
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

/**
 * Get coordinates for an address using SerpAPI
 */
async function getCoordinates(address) {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) throw new Error("SerpAPI key not found");

  const validAddress = address?.trim() || "New York, NY";

  try {
    const response = await axios.get("https://serpapi.com/search.json", {
      params: {
        engine: "google_maps",
        q: validAddress,
        api_key: apiKey,
        type: "search",
      },
    });

    const location = response.data.local_results?.[0];
    if (!location?.gps_coordinates) {
      throw new Error("No coordinates found");
    }

    return {
      latitude: location.gps_coordinates.latitude,
      longitude: location.gps_coordinates.longitude,
    };
  } catch (error) {
    throw new Error(`Geocoding failed: ${error.message}`);
  }
}

/**
 * Get distance and time between two locations using SerpAPI
 */
async function getDistanceTime(origin, destination) {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) throw new Error("SerpAPI key not found");
  if (!origin || !destination)
    throw new Error("Origin and destination required");

  const originStr =
    typeof origin === "object"
      ? `${origin.latitude},${origin.longitude}`
      : origin;
  const destStr =
    typeof destination === "object"
      ? `${destination.latitude},${destination.longitude}`
      : destination;

  try {
    const response = await axios.get("https://serpapi.com/search.json", {
      params: {
        engine: "google_maps_directions",
        start_addr: originStr,
        end_addr: destStr,
        api_key: apiKey,
      },
    });

    const route = response.data.directions?.[0];
    if (!route) throw new Error("No route found");

    const distanceInKm = route.distance / 1000;
    const durationInMinutes = Math.round(route.duration / 60);

    return {
      distance: parseFloat(distanceInKm.toFixed(2)),
      duration: durationInMinutes,
      distanceText: route.formatted_distance || `${distanceInKm.toFixed(1)} km`,
      durationText: route.formatted_duration || `${durationInMinutes} min`,
    };
  } catch (error) {
    throw new Error(`Distance calculation failed: ${error.message}`);
  }
}

/**
 * Get place suggestions using SerpAPI
 */
async function getSuggestions(input) {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) throw new Error("SerpAPI key not found");
  if (!input?.trim()) throw new Error("Input required");

  try {
    const response = await axios.get("https://serpapi.com/search.json", {
      params: {
        engine: "google_maps",
        q: input.trim(),
        api_key: apiKey,
        type: "search",
      },
    });

    const results = response.data.local_results || [];
    return results.map((item) => ({
      description: `${item.title}${item.address ? `, ${item.address}` : ""}`,
      place_id: item.place_id || item.data_id || `${Date.now()}`,
      structured_formatting: {
        main_text: item.title || "",
        secondary_text: item.address || "",
      },
    }));
  } catch (error) {
    throw new Error(`Suggestions failed: ${error.message}`);
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Find captains within a radius
 */
async function getCaptainsInRadius(latitude, longitude, radius) {
  if (!latitude || !longitude || !radius) {
    throw new Error("Latitude, longitude, and radius required");
  }

  try {
    const allCaptains = await Captain.find({
      "location.latitude": { $exists: true },
      "location.longitude": { $exists: true },
    });

    return allCaptains.filter((captain) => {
      const distance = calculateDistance(
        latitude,
        longitude,
        captain.location.latitude,
        captain.location.longitude
      );
      return distance <= radius;
    });
  } catch (error) {
    throw new Error(`Captain search failed: ${error.message}`);
  }
}

/**
 * Calculate fare based on distance, duration, and vehicle type
 */
function calculateFare(distance, duration, vehicleType) {
  const fares = {
    auto: { base: 25, perKm: 12, perMin: 2 },
    car: { base: 50, perKm: 15, perMin: 3 },
    bike: { base: 20, perKm: 8, perMin: 1.5 },
    motorcycle: { base: 20, perKm: 8, perMin: 1.5 },
  };

  const fare = fares[vehicleType?.toLowerCase()] || fares.car;
  const total = fare.base + distance * fare.perKm + duration * fare.perMin;

  return Math.round(total * 100) / 100;
}

/**
 * Get fare details for a trip
 */
async function getFareWithDetails(pickup, dropoff, vehicleType) {
  try {
    const trip = await getDistanceTime(pickup, dropoff);
    const fare = calculateFare(trip.distance, trip.duration, vehicleType);

    return {
      fare,
      distance: trip.distance,
      duration: trip.duration,
      distanceText: trip.distanceText,
      durationText: trip.durationText,
    };
  } catch (error) {
    throw new Error(`Fare calculation failed: ${error.message}`);
  }
}

export default {
  getCoordinates,
  getDistanceTime,
  getSuggestions,
  getCaptainsInRadius,
  getFareWithDetails,
  calculateFare,
};
