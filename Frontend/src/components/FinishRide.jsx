import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function FinishRide({ rideData, onClose, onFinish }) {
  const navigate = useNavigate();

  const handleFinishRide = () => {
    // Directly navigate to captain-home without any callback
    navigate("/captain-home");
  };

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-xl p-6 max-w-sm w-full mx-4"
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 25 }}
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-10 h-10 text-green-500"
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
          <h2 className="text-xl font-bold text-gray-800">Ride Completed</h2>
          <p className="text-sm text-gray-500 mt-1">
            Finalize the ride details
          </p>
        </div>

        {/* User Information */}
        <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="h-12 w-12 rounded-full overflow-hidden">
            <img
              src={rideData.user.photo}
              alt={rideData.user.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="ml-3">
            <h3 className="font-medium text-gray-800">{rideData.user.name}</h3>
            <div className="flex items-center">
              <svg
                className="w-3 h-3 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-xs ml-1">{rideData.user.rating}</span>
            </div>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-gray-500">Earning</p>
            <p className="font-bold text-green-600">
              ₹{rideData.amount.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Ride Information */}
        <div className="space-y-3 mb-5">
          {/* Pickup Location */}
          <div className="flex">
            <div className="mr-3">
              <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center">
                <svg
                  className="h-4 w-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="3" strokeWidth="2" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 22s8-4.5 8-11.8c0-4.5-3.5-8.2-8-8.2S4 5.7 4 10.2C4 17.5 12 22 12 22z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Pickup Location</p>
              <p className="font-medium text-gray-800">
                {rideData.pickup.address}
              </p>
            </div>
          </div>

          {/* Destination Location */}
          <div className="flex">
            <div className="mr-3">
              <div className="h-7 w-7 rounded-full bg-yellow-100 flex items-center justify-center">
                <svg
                  className="h-4 w-4 text-yellow-600"
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
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500">Destination</p>
              <p className="font-medium text-gray-800">
                {rideData.destination.address}
              </p>
            </div>
          </div>
        </div>

        {/* Ride Summary */}
        <div className="flex justify-between mb-5 py-3 px-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-xs text-gray-500">Distance</p>
            <p className="font-bold text-gray-800">{rideData.distance} km</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Duration</p>
            <p className="font-bold text-gray-800">{rideData.duration} min</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Total</p>
            <p className="font-bold text-green-600">
              ${rideData.amount.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <motion.button
            className="w-full py-3 rounded-xl bg-green-500 text-white font-medium"
            onClick={handleFinishRide}
            whileHover={{ scale: 1.02, backgroundColor: "#059669" }}
            whileTap={{ scale: 0.98 }}
          >
            Finish This Ride
          </motion.button>

          <motion.button
            className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 font-medium"
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
