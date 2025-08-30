import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import Captain from "../models/captain.model.js";

// Configure environment
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

/**
 * Get coordinates for an address using Google Maps Geocoding API
 */
async function getCoordinates(address) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error("Google Maps API key not found");

  const validAddress = address?.trim() || "New York, NY";

  console.log("🌍 Geocoding address:", validAddress);

  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/geocode/json",
      {
        params: {
          address: validAddress,
          key: apiKey,
          region: "in", // Bias results towards India
        },
      }
    );

    console.log(
      "📡 Google Maps geocoding response:",
      JSON.stringify(response.data, null, 2)
    );

    if (response.data.status !== "OK") {
      console.error("❌ Geocoding API error:", response.data.status);
      throw new Error(`Geocoding failed: ${response.data.status}`);
    }

    if (!response.data.results || response.data.results.length === 0) {
      console.error("❌ No results found for address:", validAddress);
      throw new Error(`No coordinates found for address: ${validAddress}`);
    }

    const location = response.data.results[0].geometry.location;
    const result = {
      latitude: location.lat,
      longitude: location.lng,
    };

    console.log("✅ Geocoding successful:", result);
    return result;
  } catch (error) {
    console.error("❌ Geocoding error:", error.message);

    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }

    throw new Error(`Geocoding failed: ${error.message}`);
  }
}

/**
 * Get distance and time between two locations using Google Maps Distance Matrix API
 */
async function getDistanceTime(origin, destination) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error("Google Maps API key not found");
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

  console.log("🚗 Getting distance/time from:", originStr, "to:", destStr);

  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/distancematrix/json",
      {
        params: {
          origins: originStr,
          destinations: destStr,
          mode: "driving",
          units: "metric",
          key: apiKey,
        },
      }
    );

    console.log(
      "📡 Distance Matrix response:",
      JSON.stringify(response.data, null, 2)
    );

    if (response.data.status !== "OK") {
      throw new Error(`Distance Matrix API error: ${response.data.status}`);
    }

    const element = response.data.rows[0]?.elements[0];
    if (!element || element.status !== "OK") {
      throw new Error(`Route not found: ${element?.status || "Unknown error"}`);
    }

    const distanceInKm = element.distance.value / 1000;
    const durationInMinutes = Math.round(element.duration.value / 60);

    const result = {
      distance: parseFloat(distanceInKm.toFixed(2)),
      duration: durationInMinutes,
      distanceText: element.distance.text,
      durationText: element.duration.text,
    };

    console.log("✅ Distance/time calculation successful:", result);
    return result;
  } catch (error) {
    console.error("❌ Distance calculation error:", error.message);
    throw new Error(`Distance calculation failed: ${error.message}`);
  }
}

/**
 * Get place suggestions using Google Maps Places API (Text Search)
 */
async function getSuggestions(input) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error("Google Maps API key not found");
  if (!input?.trim()) throw new Error("Input required");

  console.log("🔍 Getting place suggestions for:", input.trim());

  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/place/textsearch/json",
      {
        params: {
          query: input.trim(),
          key: apiKey,
          region: "in", // Bias results towards India
          language: "en",
        },
      }
    );

    console.log(
      "📡 Places API response:",
      JSON.stringify(response.data, null, 2)
    );

    if (
      response.data.status !== "OK" &&
      response.data.status !== "ZERO_RESULTS"
    ) {
      throw new Error(`Places API error: ${response.data.status}`);
    }

    const results = response.data.results || [];
    const suggestions = results.slice(0, 5).map((place) => ({
      description: `${place.name}${
        place.formatted_address ? `, ${place.formatted_address}` : ""
      }`,
      place_id: place.place_id,
      structured_formatting: {
        main_text: place.name || "",
        secondary_text: place.formatted_address || "",
      },
    }));

    console.log("✅ Suggestions found:", suggestions.length);
    return suggestions;
  } catch (error) {
    console.error("❌ Suggestions error:", error.message);
    throw new Error(`Suggestions failed: ${error.message}`);
  }
}

/**
 * Get place details using Google Maps Places API (Place Details)
 */
async function getPlaceDetails(placeId) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error("Google Maps API key not found");
  if (!placeId) throw new Error("Place ID required");

  console.log("📍 Getting place details for:", placeId);

  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/place/details/json",
      {
        params: {
          place_id: placeId,
          fields: "name,formatted_address,geometry,place_id",
          key: apiKey,
        },
      }
    );

    if (response.data.status !== "OK") {
      throw new Error(`Place Details API error: ${response.data.status}`);
    }

    const place = response.data.result;
    return {
      name: place.name,
      address: place.formatted_address,
      location: {
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
      },
      place_id: place.place_id,
    };
  } catch (error) {
    console.error("❌ Place details error:", error.message);
    throw new Error(`Place details failed: ${error.message}`);
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

  console.log(
    `🎯 Finding captains within ${radius}km of ${latitude}, ${longitude}`
  );

  try {
    const allCaptains = await Captain.find({
      "location.latitude": { $exists: true },
      "location.longitude": { $exists: true },
      status: "active", // Only find active captains
    });

    const nearbyCaptains = allCaptains.filter((captain) => {
      const distance = calculateDistance(
        latitude,
        longitude,
        captain.location.latitude,
        captain.location.longitude
      );
      return distance <= radius;
    });

    console.log(`✅ Found ${nearbyCaptains.length} captains within radius`);
    return nearbyCaptains;
  } catch (error) {
    console.error("❌ Captain search error:", error.message);
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

  const calculatedFare = Math.round(total * 100) / 100;
  console.log(
    `💰 Fare calculated: ₹${calculatedFare} for ${distance}km, ${duration}min, ${vehicleType}`
  );

  return calculatedFare;
}

/**
 * Get fare details for a trip
 */
async function getFareWithDetails(pickup, dropoff, vehicleType) {
  console.log("💸 Calculating fare for trip:", {
    pickup,
    dropoff,
    vehicleType,
  });

  try {
    const trip = await getDistanceTime(pickup, dropoff);
    const fare = calculateFare(trip.distance, trip.duration, vehicleType);

    const result = {
      fare,
      distance: trip.distance,
      duration: trip.duration,
      distanceText: trip.distanceText,
      durationText: trip.durationText,
    };

    console.log("✅ Fare calculation successful:", result);
    return result;
  } catch (error) {
    console.error("❌ Fare calculation error:", error.message);
    throw new Error(`Fare calculation failed: ${error.message}`);
  }
}

/**
 * Get directions between two points using Google Maps Directions API
 */
async function getDirections(origin, destination) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error("Google Maps API key not found");
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

  console.log("🗺️ Getting directions from:", originStr, "to:", destStr);

  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/directions/json",
      {
        params: {
          origin: originStr,
          destination: destStr,
          mode: "driving",
          key: apiKey,
        },
      }
    );

    if (response.data.status !== "OK") {
      throw new Error(`Directions API error: ${response.data.status}`);
    }

    const route = response.data.routes[0];
    if (!route) {
      throw new Error("No route found");
    }

    return {
      polyline: route.overview_polyline.points,
      bounds: route.bounds,
      legs: route.legs,
      distance: route.legs[0].distance,
      duration: route.legs[0].duration,
    };
  } catch (error) {
    console.error("❌ Directions error:", error.message);
    throw new Error(`Directions failed: ${error.message}`);
  }
}

export default {
  getCoordinates,
  getDistanceTime,
  getSuggestions,
  getPlaceDetails,
  getCaptainsInRadius,
  getFareWithDetails,
  calculateFare,
  getDirections,
};
