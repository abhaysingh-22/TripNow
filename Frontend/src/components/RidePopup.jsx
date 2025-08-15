import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const RidePopup = ({ ride, onAccept, onIgnore }) => {
  const navigate = useNavigate();

  // Mock data for demonstration if not provided
  const mockData = {
    id: "ride-123",
    user: {
      name: "Sarah Johnson",
      rating: 4.7,
      photo: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    amount: 28.5,
    distance: 7.2,
    duration: 18, // minutes
    pickup: {
      address: "123 Park Avenue, Downtown",
      time: "3 min away",
    },
    destination: {
      address: "456 Central Plaza, Midtown",
      time: "18 min",
    },
  };

  const rideData = ride || {
    ...mockData,
    ...ride, // Real data overwrites mock data
    // Ensure specific fields are properly handled
    distance: ride?.distance ?? mockData.distance,
    duration: ride?.duration ?? mockData.duration,
    amount: ride?.amount ?? ride?.fare ?? mockData.amount,
    user: {
      ...mockData.user,
      ...ride?.user,
    },
  };

  const safePickup = {
    address:
      rideData.pickupLocation || rideData.pickup?.address || "Pickup Location",
    time: rideData.pickup?.time || "2 min away",
  };

  const safeDestination = {
    address:
      rideData.dropoffLocation ||
      rideData.destination?.address ||
      "Destination",
    time: rideData.destination?.time || "15 min",
  };

  const handleAccept = () => {
    if (onAccept) {
      onAccept(rideData.id);
    }
  };

  const handleIgnore = () => {
    if (onIgnore) {
      onIgnore(rideData.id);
    } else {
      // Default fallback - navigate back to home
      navigate("/captain-home");
    }
  };

  return (
    <motion.div
      className="bg-white rounded-t-2xl shadow-xl w-full overflow-hidden"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      transition={{ type: "spring", damping: 25 }}
    >
      {/* Header */}
      <div className="bg-yellow-400 px-6 py-3">
        <div className="flex items-center justify-between">
          <motion.div
            className="flex items-center"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div className="relative" whileHover={{ scale: 1.05 }}>
              <div className="w-2 h-2 bg-green-500 absolute top-0 right-0 rounded-full border border-white"></div>
              <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-white">
                <img
                  src={
                    rideData.user?.photo ||
                    "https://randomuser.me/api/portraits/lego/1.jpg"
                  }
                  alt={rideData.user?.name || "User Photo"}
                  className="h-full w-full object-cover"
                />
              </div>
            </motion.div>
            <div className="ml-3">
              <h3 className="font-bold text-white text-lg">
                {rideData.user?.name || "Unknown User"}
              </h3>
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-white text-sm ml-1">
                  {rideData.user?.rating ?? "N/A"}
                </span>
                <div className="flex items-center ml-2 bg-white bg-opacity-20 px-2 py-0.5 rounded">
                  <svg
                    className="w-3 h-3 text-white mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-white text-xs">{safePickup.time}</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white bg-opacity-20 rounded-lg px-3 py-1 backdrop-blur-sm"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-white font-bold">
              ₹{(rideData.amount || 0).toFixed(2)}
            </span>
          </motion.div>
        </div>

        <motion.div
          className="mt-2 flex items-center justify-center bg-white bg-opacity-20 rounded-lg py-1.5 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span className="text-white font-semibold text-center">
            New Ride Available!
          </span>
        </motion.div>
      </div>

      {/* Ride details */}
      <div className="px-6 pt-3 pb-4">
        {/* Distance and duration */}
        <motion.div
          className="flex justify-between mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-center px-4 py-2 bg-gray-50 rounded-lg flex-1 mx-1">
            <p className="text-gray-500 text-xs">Distance</p>
            <p className="font-bold text-gray-800">
              {(Number(rideData.distance) || 0).toFixed(1)} km
            </p>
          </div>

          <div className="text-center px-4 py-2 bg-gray-50 rounded-lg flex-1 mx-1">
            <p className="text-gray-500 text-xs">Duration</p>
            <p className="font-bold text-gray-800">
              {Number(rideData.duration) || 0} min
            </p>
          </div>

          <div className="text-center px-4 py-2 bg-gray-50 rounded-lg flex-1 mx-1">
            <p className="text-gray-500 text-xs">Earning</p>
            <p className="font-bold text-green-600">
              ₹{(Number(rideData.amount) || 0).toFixed(2)}
            </p>
          </div>
        </motion.div>

        {/* Route details */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {/* Pickup */}
          <div className="flex mb-4">
            <div className="mr-4">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div className="mx-auto w-0.5 h-10 bg-gray-300 my-1"></div>
            </div>
            <div className="flex-1">
              <p className="text-gray-500 text-sm">Pickup Location</p>
              <p className="font-semibold text-gray-800">
                {safePickup.address}
              </p>
              <p className="text-sm text-green-600 font-medium">
                {safePickup.time}
              </p>
            </div>
          </div>

          {/* Destination */}
          <div className="flex">
            <div className="mr-4">
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <svg
                  className="h-5 w-5 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-gray-500 text-sm">Destination Location</p>
              <p className="font-semibold text-gray-800">
                {safeDestination.address}
              </p>
              <p className="text-sm text-green-600 font-medium">
                Est. arrival: {safeDestination.time}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 border-t border-gray-100">
        <motion.button
          className="py-2.5 rounded-xl bg-white border border-gray-300 text-gray-700 font-medium"
          onClick={handleIgnore}
          whileHover={{ scale: 1.03, backgroundColor: "#f9fafb" }}
          whileTap={{ scale: 0.97 }}
        >
          Ignore
        </motion.button>

        <motion.button
          className="py-2.5 rounded-xl bg-green-500 text-white font-medium"
          onClick={handleAccept}
          whileHover={{ scale: 1.03, backgroundColor: "#059669" }}
          whileTap={{ scale: 0.97 }}
        >
          Accept
        </motion.button>
      </div>
    </motion.div>
  );
};

export default RidePopup;
