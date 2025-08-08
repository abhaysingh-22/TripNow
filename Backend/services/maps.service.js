import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Captain from "../models/captain.model.js";

// Get the directory of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Configure dotenv to look for .env file in the Backend directory
dotenv.config({ path: path.join(__dirname, "..", ".env") });

import axios from "axios";
/**
 * Get coordinates (latitude, longitude) for a given address using GoMaps.pro Geocoding API.
 * @param {string} address - The address to geocode.
 * @returns {Promise<{ latitude: number, longitude: number }>} - Coordinates object.
 */

async function getCoordinates(address) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("GoMaps.pro API key not set in environment variables.");
  }
  // Use a default address if input is invalid
  const validAddress =
    address && typeof address === "string" && address.trim() !== ""
      ? address
      : "1600 Amphitheatre Parkway, Mountain View, CA";
  const url = `https://maps.gomaps.pro/maps/api/geocode/json`;

  try {
    const response = await axios.get(url, {
      params: {
        address: validAddress,
        key: apiKey,
      },
    });
    // Check for API error or invalid status
    const data = response.data;
    if (data.status !== "OK") {
      const errorMsg =
        data.error_message || `GoMaps.pro API error: ${data.status}`;
      throw new Error(errorMsg);
    }
    const results = data.results;
    if (results && results.length > 0) {
      const location = results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng,
      };
    } else {
      throw new Error("No results found for the given address.");
    }
  } catch (error) {
    throw new Error(`Failed to fetch coordinates: ${error.message}`);
  }
}
// Test the function when running this file directly (ES6 module)
// if (fileURLToPath(import.meta.url) === process.argv[1]) {
//     (async () => {
//         try {
//             const coords = await getCoordinates('1600 Amphitheatre Parkway, Mountain View, CA');
//             console.log('Coordinates:', coords);
//         } catch (err) {
//             console.error('Error:', err.message);
//         }
//     })();
// }

async function getDistanceTime(origin, destination) {
  if (!origin || !destination) {
    throw new Error("Origin and destination must be provided.");
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("Google Maps API key not set in environment variables.");
  }
  const url = `https://maps.gomaps.pro/maps/api/distancematrix/json`;
  try {
    const response = await axios.get(url, {
      params: {
        origins: origin,
        destinations: destination,
        key: apiKey,
      },
    });
    const data = response.data;
    if (data.status !== "OK") {
      throw new Error(`GoMaps.pro API error: ${data.status}`);
    }
    if (data.rows && data.rows.length > 0 && data.rows[0].elements.length > 0) {
      const element = data.rows[0].elements[0];
      return {
        distance: element.distance.text,
        duration: element.duration.text,
      };
    } else {
      throw new Error("No results found for the given origin and destination.");
    }
  } catch (error) {
    throw new Error(`Failed to fetch distance and time: ${error.message}`);
  }
}

async function getSuggestions(input) {
  if (!input || typeof input !== "string" || input.trim() === "") {
    throw new Error("Input must be a non-empty string.");
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error("Google Maps API key not set in environment variables.");
  }
  const url = `https://maps.gomaps.pro/maps/api/place/autocomplete/json`;
  try {
    const response = await axios.get(url, {
      params: {
        input,
        key: apiKey,
      },
    });
    const data = response.data;
    if (data.status !== "OK") {
      throw new Error(`GoMaps.pro API error: ${data.status}`);
    }
    return data.predictions;
  } catch (error) {
    throw new Error(`Failed to fetch suggestions: ${error.message}`);
  }
}

async function getCaptainsInRadius(latitude, longitude, radius) {
  if (!latitude || !longitude || !radius) {
    throw new Error("Latitude, longitude, and radius must be provided.");
  }

  try {
    console.log("=== DEBUGGING CAPTAIN SEARCH ===");
    console.log("Search center:", { latitude, longitude });
    console.log("Search radius:", radius, "km");

    // Get all captains (without geospatial query)
    const allCaptains = await Captain.find({
      "location.latitude": { $exists: true },
      "location.longitude": { $exists: true },
    });

    console.log("All captains found:", allCaptains.length);
    
    // Log each captain's location
    allCaptains.forEach((captain, index) => {
      console.log(`Captain ${index + 1} (${captain._id}):`);
      console.log(`  Location: lat=${captain.location.latitude}, lng=${captain.location.longitude}`);
      console.log(`  Name: ${captain.fullName || 'N/A'}`);
    });

    // Filter by distance manually using Haversine formula
    const captainsInRadius = allCaptains.filter((captain, index) => {
      if (
        !captain.location ||
        !captain.location.latitude ||
        !captain.location.longitude
      ) {
        console.log(`Captain ${index + 1}: SKIPPED - Missing location data`);
        return false;
      }

      const distance = calculateDistance(
        latitude,
        longitude,
        captain.location.latitude,
        captain.location.longitude
      );

      console.log(`Captain ${index + 1} (${captain._id}):`);
      console.log(`  Distance: ${distance.toFixed(2)}km`);
      console.log(`  Within radius (${radius}km)?: ${distance <= radius ? 'YES' : 'NO'}`);
      
      return distance <= radius;
    });

    console.log("=== SEARCH RESULTS ===");
    console.log("Captains in radius:", captainsInRadius.length);
    console.log("================================");
    
    return captainsInRadius;

  } catch (error) {
    console.error("Error in getCaptainsInRadius:", error);
    throw error;
  }
}

// Add this helper function for distance calculation 
// we are doing manual calc because MongoDB can't execute the $geoNear query because there's no geospatial index on the location field.
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

export default {
  getCoordinates,
  getDistanceTime,
  getSuggestions,
  getCaptainsInRadius,
};
