import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  PhoneIcon,
  ChatBubbleLeftIcon,
  CreditCardIcon,
  CurrencyRupeeIcon,
  StarIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

function WaitingForDriver({
  selectedVehicle,
  pickup,
  destination,
  fare,
  selectedPayment,
  onBack,
  onCancel,
  captainInfo = null,
}) {
  const [eta, setEta] = useState(3);

  const driverData = captainInfo
    ? {
        name: captainInfo.name || "Driver",
        rating: captainInfo.rating || 4.8,
        totalRides: captainInfo.totalRides || 1000,
        photo:
          captainInfo.photo ||
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        numberPlate:
          captainInfo.vehicle?.numberPlate ||
          captainInfo.numberPlate ||
          "MH 12 AB 1234",
        carModel:
          captainInfo.vehicle?.model ||
          (selectedVehicle?.name === "UberGo"
            ? "Maruti Swift"
            : selectedVehicle?.name === "Auto"
            ? "Bajaj Auto"
            : selectedVehicle?.name === "Bike"
            ? "Honda Activa"
            : "Toyota Innova"),
        carColor: captainInfo.vehicle?.color || "White",
      }
    : {
        // Fallback mock data
        name: "Rajesh Kumar",
        rating: 4.8,
        totalRides: 1247,
        photo:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        numberPlate: "MH 12 AB 1234",
        carModel:
          selectedVehicle?.name === "UberGo"
            ? "Maruti Swift"
            : selectedVehicle?.name === "Auto"
            ? "Bajaj Auto"
            : selectedVehicle?.name === "Bike"
            ? "Honda Activa"
            : "Toyota Innova",
        carColor: "White",
      };

  useEffect(() => {
    if (captainInfo?.estimatedArrival) {
      // Extract minutes from "3 min" or similar format
      const minutes =
        parseInt(captainInfo.estimatedArrival.match(/\d+/)?.[0]) || 3;
      setEta(minutes);
    }
  }, [captainInfo]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute inset-x-0 top-0 bg-white min-h-screen md:min-h-0 md:rounded-lg overflow-hidden"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between p-4 md:p-5">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeftIcon className="w-5 h-5 md:w-6 md:h-6" />
          </motion.button>
          <div className="text-center">
            <h3 className="text-xl md:text-2xl font-bold">Driver Assigned</h3>
            <p className="text-sm text-gray-500">Arriving in {eta} min</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <XMarkIcon className="w-5 h-5 md:w-6 md:h-6" />
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto max-h-[calc(100vh-180px)] md:max-h-[calc(100vh-250px)] pb-24 md:pb-32">
        {/* Driver Info Card */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white border-2 border-gray-200 rounded-2xl p-5 md:p-6 shadow-sm"
        >
          <div className="flex items-center space-x-4">
            <img
              src={driverData.photo}
              alt={driverData.name}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 border-gray-200"
            />
            <div className="flex-1">
              <h4 className="text-lg md:text-xl font-bold">
                {driverData.name}
              </h4>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex items-center">
                  <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="font-semibold">{driverData.rating}</span>
                  <span className="text-gray-500 text-sm ml-1">
                    ({driverData.totalRides} rides)
                  </span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-green-100 hover:bg-green-200 rounded-full"
              >
                <PhoneIcon className="w-5 h-5 text-green-600" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-blue-100 hover:bg-blue-200 rounded-full"
              >
                <ChatBubbleLeftIcon className="w-5 h-5 text-blue-600" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Vehicle Details */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-50 rounded-2xl p-5 md:p-6"
        >
          <h4 className="font-bold text-lg mb-4">Vehicle Details</h4>
          <div className="flex items-center space-x-4">
            <img
              src={selectedVehicle.image}
              alt={selectedVehicle.name}
              className="w-20 h-14 md:w-24 md:h-16 object-contain rounded-lg bg-white p-2"
            />
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Model</p>
                  <p className="font-semibold">{driverData.carModel}</p>
                </div>
                <div>
                  <p className="text-gray-500">Color</p>
                  <p className="font-semibold">{driverData.carColor}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Number Plate</p>
                  <p className="font-bold text-lg tracking-wider">
                    {driverData.numberPlate}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trip Details */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-gray-200 rounded-2xl p-5 md:p-6"
        >
          <h4 className="font-bold text-lg mb-4">Trip Details</h4>
          <div className="space-y-3">
            <div>
              <p className="text-gray-400 font-medium text-sm mb-1">FROM</p>
              <p className="font-medium text-gray-900">{pickup}</p>
            </div>

            <div className="border-l-2 border-gray-200 ml-2 h-4"></div>

            <div>
              <p className="text-gray-400 font-medium text-sm mb-1">TO</p>
              <p className="font-medium text-gray-900">{destination}</p>
            </div>
          </div>
        </motion.div>

        {/* Payment Status */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-gray-200 rounded-2xl p-4 md:p-6"
        >
          <h4 className="font-bold text-lg md:text-xl mb-3">Payment</h4>
          <div
            className={`flex items-center justify-between p-3 md:p-4 rounded-xl border ${
              selectedPayment === "cash"
                ? "bg-yellow-50 border-yellow-200"
                : "bg-green-50 border-green-200"
            }`}
          >
            <div className="flex items-center">
              {selectedPayment === "cash" ? (
                <CurrencyRupeeIcon
                  className={`w-5 h-5 mr-3 ${
                    selectedPayment === "cash"
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                />
              ) : (
                <CreditCardIcon className="w-5 h-5 text-green-600 mr-3" />
              )}
              <div>
                <span className="font-medium capitalize">
                  {selectedPayment}
                </span>
                <p
                  className={`text-xs ${
                    selectedPayment === "cash"
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {selectedPayment === "cash"
                    ? "Payment pending"
                    : "Payment done"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-bold text-lg">
                {fare !== undefined ? `₹${fare}` : "—"}
              </span>
              <p
                className={`text-xs ${
                  selectedPayment === "cash"
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}
              >
                {selectedPayment === "cash" ? "⏳ Pending" : "✓ Done"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Status Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center bg-blue-50 rounded-2xl p-4 md:p-6 border border-blue-200 mb-6 md:mb-8"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-2xl mb-2"
          >
            🚗
          </motion.div>
          <p className="font-medium text-blue-900">
            Your driver is on the way!
          </p>
          <p className="text-sm text-blue-700">Track your ride in real-time</p>
        </motion.div>
      </div>

      {/* Cancel Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 border-t backdrop-blur-lg bg-white/90">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCancel}
          className="w-full py-3 md:py-4 bg-red-100 text-red-700 rounded-xl font-bold text-base md:text-lg hover:bg-red-200 transition-colors border border-red-200"
        >
          Cancel Ride
        </motion.button>
      </div>
    </motion.div>
  );
}

export default WaitingForDriver;
