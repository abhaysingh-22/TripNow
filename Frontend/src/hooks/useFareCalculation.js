import { useState, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "./useAuth";

// API Configuration
const API_BASE_URL = `${import.meta.env.VITE_BASE_URL}/api`;

// Vehicle type mapping from frontend to backend
const vehicleTypeMapping = {
  1: "car", // UberGo
  2: "auto", // Auto
  3: "bike", // Bike
  4: "car", // Premier (also car category)
};

export const useFareCalculation = () => {
  const [fares, setFares] = useState({});
  const [isLoadingFares, setIsLoadingFares] = useState(false);
  const { getAuthToken } = useAuth();

  const calculateFares = useCallback(
    async (pickup, dropoff, rideTypes) => {
      console.log("calculateFares called with:", {
        pickup,
        dropoff,
        rideTypes,
      });

      if (!pickup || !dropoff || !pickup.trim() || !dropoff.trim()) {
        console.log("Missing pickup or dropoff locations");
        return;
      }

      if (!rideTypes || rideTypes.length === 0) {
        console.log("No ride types provided");
        return;
      }

      setIsLoadingFares(true);
      const newFares = {};

      try {
        const token = getAuthToken();
        console.log("Token retrieved:", token ? "Token exists" : "No token");

        // Temporary: Allow testing without login for development
        if (!token) {
          console.warn(
            "No token found - proceeding without authentication for testing"
          );
          // We'll still make the API call but handle 401 errors gracefully
        }

        console.log("Calculating fares for:", { pickup, dropoff });

        // Calculate fare for each vehicle type
        const farePromises = rideTypes.map(async (rideType) => {
          try {
            const vehicleType = vehicleTypeMapping[rideType.id] || "car";
            console.log(
              `Requesting fare for ${rideType.name} (${vehicleType})`
            );

            const requestHeaders = {
              "Content-Type": "application/json",
            };

            // Only add Authorization header if token exists
            if (token) {
              requestHeaders.Authorization = `Bearer ${token}`;
            }

            const response = await axios.get(`${API_BASE_URL}/ride/fare`, {
              params: {
                pickup: pickup.trim(),
                dropoff: dropoff.trim(),
                vehicleType,
              },
              headers: requestHeaders,
              timeout: 10000,
            });

            console.log(`Fare response for ${rideType.name}:`, response.data);

            if (response.data && response.data.fare) {
              return {
                rideTypeId: rideType.id,
                fare: response.data.fare,
                distance: response.data.distance,
                duration: response.data.duration,
                vehicleType: response.data.vehicleType,
              };
            }
            return null;
          } catch (error) {
            console.error(
              `Error calculating fare for ${rideType.name}:`,
              error
            );

            // More detailed error logging
            if (error.response) {
              console.error("Response error:", error.response.data);
              console.error("Response status:", error.response.status);
            } else if (error.request) {
              console.error("Request error:", error.request);
            } else {
              console.error("Error message:", error.message);
            }

            // Return default fare if API fails
            return {
              rideTypeId: rideType.id,
              fare: null,
              error: true,
              errorMessage: error.message,
            };
          }
        });

        const fareResults = await Promise.all(farePromises);

        // Process results
        fareResults.forEach((result) => {
          if (result && result.rideTypeId) {
            newFares[result.rideTypeId] = result;
          }
        });

        console.log("Final calculated fares:", newFares);
        setFares(newFares);
      } catch (error) {
        console.error("Error in fare calculation:", error);
        toast.error("Failed to calculate fares. Using default prices.");
      } finally {
        setIsLoadingFares(false);
      }
    },
    [getAuthToken]
  );

  const clearFares = useCallback(() => {
    setFares({});
  }, []);

  const getFareForRide = useCallback(
    (rideTypeId) => {
      return fares[rideTypeId] || null;
    },
    [fares]
  );

  return {
    fares,
    isLoadingFares,
    calculateFares,
    clearFares,
    getFareForRide,
  };
};
