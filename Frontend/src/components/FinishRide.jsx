import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function FinishRide({ rideData, onClose, onFinish }) {
  const navigate = useNavigate();

  console.log("FinishRide - Received rideData:", rideData);

  // ✅ Better data extraction with multiple fallback paths
  const safeRideData = {
    user: {
      name:
        rideData?.user?.name ||
        (rideData?.user?.fullName
          ? `${rideData.user.fullName.firstName || ""} ${
              rideData.user.fullName.lastName || ""
            }`.trim()
          : null) ||
        rideData?.user?.email ||
        "Unknown User",
      rating: rideData?.user?.rating || 4.5,
      photo:
        rideData?.user?.photo ||
        "https://randomuser.me/api/portraits/lego/1.jpg",
    },
    amount: Number(rideData?.amount || rideData?.fare || 0),
    distance: Number(rideData?.distance || 0),
    duration: Number(rideData?.duration || 0),
    pickup: {
      address:
        rideData?.pickup?.address ||
        rideData?.pickupLocation ||
        "Pickup Location",
    },
    destination: {
      address:
        rideData?.destination?.address ||
        rideData?.dropoffLocation ||
        "Destination",
    },
  };

  console.log("FinishRide - Processed safeRideData:", safeRideData);

  // Update the handleFinishRide function:

  const handleFinishRide = async () => {
    try {
      // ✅ Send ride completion to backend to update captain stats
      const token = localStorage.getItem("token");

      if (token && rideData?._id) {
        const requestBody = {
          rideId: rideData._id,
          fare: safeRideData.amount,
          distance: safeRideData.distance,
          duration: safeRideData.duration,
        };

        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/rides/complete`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              rideId: rideData._id,
              fare: safeRideData.amount,
              distance: safeRideData.distance,
              duration: safeRideData.duration,
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Ride completed successfully:", data);

          setTimeout(() => {
            window.dispatchEvent(
              new CustomEvent("rideCompleted", {
                detail: {
                  earnings: safeRideData.amount,
                  distance: safeRideData.distance,
                  duration: safeRideData.duration,
                },
              })
            );
          }, 500);
        } else {
          const errorData = await response.text();
          console.error("❌ Failed to complete ride:", {
            status: response.status,
            error: errorData,
          });
        }
      }

      // Clear active ride data
      localStorage.removeItem("activeRide");
      console.log("✅ Cleared active ride from localStorage");

      // Navigate back to captain home
      navigate("/captain-home");
    } catch (error) {
      console.error("❌ Error completing ride:", error);
      // Still navigate even if API call fails
      localStorage.removeItem("activeRide");
      navigate("/captain-home");
    }
  };

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl p-4 sm:p-6 max-w-sm w-full mx-auto shadow-2xl max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25 }}
      >
        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-800">Ride Completed</h2>
          <p className="text-sm text-gray-500">Finalize the ride details</p>
        </div>

        {/* User Information */}
        <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
            <img
              src={safeRideData.user.photo}
              alt={safeRideData.user.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <h3 className="font-medium text-gray-800 truncate">
              {safeRideData.user.name}
            </h3>
            <div className="flex items-center">
              <svg
                className="w-3 h-3 text-yellow-400 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-xs ml-1">{safeRideData.user.rating}</span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs text-gray-500">Earning</p>
            <p className="font-bold text-green-600">
              ₹{safeRideData.amount.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Ride Information */}
        <div className="space-y-3 mb-4">
          {/* Pickup Location */}
          <div className="flex items-start">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
              <svg
                className="w-3 h-3 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="3" strokeWidth="2" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">Pickup Location</p>
              <p className="font-medium text-gray-800 text-sm break-words">
                {safeRideData.pickup.address}
              </p>
            </div>
          </div>

          {/* Destination Location */}
          <div className="flex items-start">
            <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
              <svg
                className="w-3 h-3 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">Destination</p>
              <p className="font-medium text-gray-800 text-sm break-words">
                {safeRideData.destination.address}
              </p>
            </div>
          </div>
        </div>

        {/* Ride Summary */}
        <div className="flex justify-between mb-4 py-3 px-3 bg-gray-50 rounded-lg">
          <div className="text-center flex-1">
            <p className="text-xs text-gray-500">Distance</p>
            <p className="font-bold text-gray-800 text-sm">
              {safeRideData.distance.toFixed(1)} km
            </p>
          </div>
          <div className="text-center flex-1">
            <p className="text-xs text-gray-500">Duration</p>
            <p className="font-bold text-gray-800 text-sm">
              {Math.round(safeRideData.duration)} min
            </p>
          </div>
          <div className="text-center flex-1">
            <p className="text-xs text-gray-500">Total</p>
            <p className="font-bold text-green-600 text-sm">
              ₹{safeRideData.amount.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <motion.button
            className="w-full py-3 rounded-xl bg-green-500 text-white font-medium"
            onClick={handleFinishRide}
            whileHover={{ scale: 1.02, backgroundColor: "#059669" }}
            whileTap={{ scale: 0.98 }}
          >
            Finish This Ride
          </motion.button>

          <motion.button
            className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium"
            onClick={onClose}
            whileHover={{ scale: 1.02, backgroundColor: "#f3f4f6" }}
            whileTap={{ scale: 0.98 }}
          >
            Back
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default FinishRide;
