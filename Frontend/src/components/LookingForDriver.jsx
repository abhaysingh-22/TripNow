import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  CreditCardIcon,
  CurrencyRupeeIcon,
  ClockIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

function LookingForDriver({
  selectedVehicle,
  pickup,
  destination,
  fare,
  selectedPayment,
  onBack,
  onCancel,
  driverFound = false,
  captainInfo = null,
}) {
  const [dots, setDots] = useState(".");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "." : prev + "."));
    }, 500);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (driverFound) return 100;
        return prev >= 100 ? 0 : prev + 2;
      });
    }, 100);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(progressInterval);
    };
  }, [driverFound]);

  const handleCancelRide = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handleBackNavigation = () => {
    // Also cancel when back is pressed
    if (onCancel) {
      onCancel();
    }
  };

  const headerText = driverFound ? "Driver Found!" : `Looking for Driver${dots}`;
  const subText = driverFound
    ? "Connecting you with your driver..."
    : "This usually takes a few seconds";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute inset-x-0 top-0 bg-white min-h-screen md:min-h-0 md:rounded-lg"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="flex items-center justify-between p-4 md:p-5">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleBackNavigation}
            className="p-2 hover:bg-gray-100 rounded-full"
            disabled={driverFound} // Disable back when driver found
          >
            <ArrowLeftIcon className={`w-5 h-5 ${driverFound ? "text-gray-400" : ""}`} />
          </motion.button>
          <h3 className="text-xl md:text-2xl font-bold">{headerText}</h3>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleCancelRide}
            className="p-2 hover:bg-gray-100 rounded-full"
            disabled={driverFound} // Disable cancel when driver found
          >
            <XMarkIcon className={`w-5 h-5 ${driverFound ? "text-gray-400" : ""}`} />
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto h-[calc(100vh-180px)] md:h-[calc(100vh-300px)]">
        {/* Loading Animation */}
        <div className="text-center py-6 md:py-8">
          <motion.div
            animate={{
              scale: driverFound ? [1, 1.3, 1] : [1, 1.2, 1],
              rotate: driverFound ? [0, 0] : [0, 360],
              backgroundColor: driverFound ? "#10B981" : "#000000",
            }}
            transition={{
              duration: driverFound ? 0.8 : 2,
              repeat: driverFound ? 3 : Infinity,
              ease: "easeInOut",
            }}
            className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
          >
            {driverFound ? (
              <motion.svg
                className="w-10 h-10 md:w-12 md:h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </motion.svg>
            ) : (
              <motion.div
                animate={{ rotate: [0, -360] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 md:w-12 md:h-12 border-4 border-white border-t-transparent rounded-full"
              />
            )}
          </motion.div>

          <h2 className="text-xl md:text-2xl font-bold mb-2">
            {driverFound ? "Driver Found!" : `Finding your driver${dots}`}
          </h2>
          <p className="text-sm md:text-base text-gray-600">{subText}</p>

          {/* ✅ Show captain info when driver found */}
          {driverFound && captainInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200"
            >
              <div className="flex items-center justify-center">
                <img
                  src={captainInfo.photo}
                  alt={captainInfo.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-green-300 mr-3"
                />
                <div className="text-left">
                  <p className="font-semibold text-green-800">{captainInfo.name}</p>
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 text-yellow-400 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm text-green-700">{captainInfo.rating}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <motion.div
              className={`h-2 rounded-full ${driverFound ? "bg-green-500" : "bg-black"}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          {/* Loading Line Animation - Hide when driver found */}
          {!driverFound && (
            <div className="mt-6 space-y-2">
              <motion.div
                className="h-1 bg-gray-300 rounded-full mx-auto"
                initial={{ width: "20%" }}
                animate={{ width: ["20%", "80%", "40%", "90%", "20%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="h-1 bg-gray-400 rounded-full mx-auto"
                initial={{ width: "30%" }}
                animate={{ width: ["30%", "60%", "85%", "45%", "30%"] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              />
              <motion.div
                className="h-1 bg-gray-500 rounded-full mx-auto"
                initial={{ width: "15%" }}
                animate={{ width: ["15%", "70%", "25%", "95%", "15%"] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
              />
            </div>
          )}
        </div>

        {/* Vehicle Details */}
        <div className="bg-gray-50 p-4 md:p-6 rounded-xl md:rounded-2xl">
          <div className="flex items-center mb-4">
            <img
              src={selectedVehicle.image}
              alt={selectedVehicle.name}
              className="w-24 h-16 object-contain"
            />
            <div className="ml-4 flex-1">
              <h4 className="font-bold text-lg">{selectedVehicle.name}</h4>
              <div className="flex items-center text-gray-500 mt-1">
                <ClockIcon className="w-4 h-4 mr-1" />
                <span className="text-sm">
                  {driverFound && captainInfo ? "Arriving in 3 min" : selectedVehicle.time}
                </span>
              </div>
            </div>
            <span className="text-2xl font-bold">{fare !== undefined ? `₹${fare}` : "—"}</span>
          </div>
        </div>

        {/* Trip Details */}
        <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6">
          <h4 className="font-bold text-lg mb-4">Trip Details</h4>

          <div className="space-y-4">
            <div>
              <p className="text-gray-400 font-medium text-sm mb-1">
                PICKUP LOCATION
              </p>
              <p className="font-medium text-gray-900">
                {pickup || "Not specified"}
              </p>
            </div>

            <div className="border-l-2 border-gray-200 ml-2 h-6"></div>

            <div>
              <p className="text-gray-400 font-medium text-sm mb-1">
                DESTINATION
              </p>
              <p className="font-medium text-gray-900">
                {destination || "Not specified"}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6">
          <h4 className="font-bold text-lg mb-3">Payment Method</h4>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center">
              {selectedPayment === "cash" ? (
                <CurrencyRupeeIcon className="w-5 h-5 text-gray-700 mr-3" />
              ) : (
                <CreditCardIcon className="w-5 h-5 text-gray-700 mr-3" />
              )}
              <span className="font-medium capitalize">
                {selectedPayment || "Not selected"}
              </span>
            </div>
            <span className="font-bold">
              {fare !== undefined ? `₹${fare}` : "—"}
            </span>
          </div>
        </div>

        {/* Status Messages */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center space-y-2 pb-16 md:pb-20"
        >
          {driverFound ? (
            <>
              <p className="text-sm text-green-600">✅ Driver assigned successfully</p>
              <p className="text-sm text-green-600">🚗 Preparing your ride details...</p>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500">🔍 Searching for nearby drivers</p>
              <p className="text-sm text-gray-500">📱 We'll notify you when a driver accepts</p>
            </>
          )}
        </motion.div>
      </div>

      {/* Cancel Button - Hide when driver found */}
      {!driverFound && (
        <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-white border-t">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCancelRide}
            className="w-full py-3 md:py-4 bg-red-100 text-red-700 rounded-xl font-bold text-base md:text-lg hover:bg-red-200 transition-colors border border-red-200"
          >
            Cancel Ride
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}

export default LookingForDriver;
