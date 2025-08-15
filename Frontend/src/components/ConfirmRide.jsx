import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeftIcon,
  CreditCardIcon,
  CurrencyRupeeIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";
import toast from "react-hot-toast"; // <-- add import

function ConfirmRide({
  selectedVehicle,
  pickup,
  destination,
  fare,
  onBack,
  onConfirm,
  submitting = false,
  rideResult = null,
}) {
  const [selectedPayment, setSelectedPayment] = useState(null);

  console.log("=== CONFIRMRIDE DEBUG ===");
  console.log("fare prop:", fare);
  console.log("rideResult prop:", rideResult);
  console.log("selectedVehicle:", selectedVehicle);
  console.log("========================");

  // Use rideResult values first, then props/fallbacks
  const displayFare =
    (rideResult?.amount ?? fare?.fare) !== undefined
      ? Number(rideResult?.amount ?? fare?.fare).toFixed(2)
      : "—";

  const vehicleName =
    selectedVehicle?.name || selectedVehicle?.type || "Vehicle";

  const vehicleImage = selectedVehicle?.image || "";

  const pickupAddress = rideResult?.pickup?.address || pickup || "Pickup";
  const pickupTime = rideResult?.pickup?.time || "Now";

  const destinationAddress =
    rideResult?.destination?.address || destination || "Destination";
  const destinationTime = rideResult?.destination?.time || "—";

  const displayDistance =
    rideResult?.distance ?? fare?.distance ?? selectedVehicle?.distance ?? null;
  const displayDuration =
    rideResult?.duration ?? fare?.duration ?? selectedVehicle?.duration ?? null;

  const formattedDuration = displayDuration
    ? Math.round(Number(displayDuration))
    : null;

  console.log("Display values:", {
    displayFare,
    displayDistance,
    displayDuration,
    originalDuration: displayDuration,
  });

  const handleConfirm = () => {
    if (!selectedPayment) {
      toast.error("Please select a payment method");
      return;
    }
    // call onConfirm with selected payment (Home will handle API)
    onConfirm(selectedPayment);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-x-0 top-0 bg-white min-h-screen md:min-h-0 md:rounded-lg"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="flex items-center p-4 md:p-5">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeftIcon className="w-5 h-5 md:w-6 md:h-6" />
          </motion.button>
          <h3 className="text-xl md:text-2xl font-bold ml-3">Confirm Ride</h3>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="overflow-y-auto h-[calc(100vh-200px)] md:h-[calc(100vh-300px)] p-4 md:p-6 space-y-5 mb-24">
        {/* Vehicle Details Card */}
        <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200">
          <div className="flex items-start space-x-4 md:space-x-6">
            <img
              src={vehicleImage}
              alt={vehicleName}
              className="w-24 h-16 md:w-32 md:h-20 object-contain rounded-lg"
            />
            <div className="ml-4 flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-lg">{vehicleName}</h4>
                  <div className="flex items-center text-gray-500 mt-1">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    <span className="text-sm">
                      {selectedVehicle?.time || "Arriving soon"}
                    </span>
                  </div>
                </div>
                <span className="text-xl font-bold">
                  {displayFare !== "—" ? `₹${displayFare}` : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Route Details */}
        <div className="space-y-4 bg-gray-50 p-4 md:p-6 rounded-xl">
          <div>
            <p className="text-gray-400 font-medium text-sm mb-1">FROM</p>
            <p className="font-medium">{pickupAddress}</p>
            <p className="text-sm text-green-600 font-medium">{pickupTime}</p>
          </div>
          <div>
            <p className="text-gray-400 font-medium text-sm mb-1">TO</p>
            <p className="font-medium">{destinationAddress}</p>
            <p className="text-sm text-green-600 font-medium">
              Est. arrival: {destinationTime}
            </p>
          </div>
          {displayDistance != null && (
            <p className="text-sm text-gray-500">
              Distance: {displayDistance} km
            </p>
          )}
          {displayDuration != null && (
            <p className="text-sm text-gray-500">
              Duration: {Math.round(Number(displayDuration))} min
            </p>
          )}
        </div>

        {/* Payment Methods */}
        <div className="pb-24 md:pb-28">
          <h4 className="font-bold text-lg md:text-xl mb-4">Payment Method</h4>
          <div className="space-y-3 md:space-y-4">
            {["cash", "upi"].map((method) => (
              <motion.button
                key={method}
                onClick={() => setSelectedPayment(method)}
                className={`w-full flex items-center justify-between p-4 md:p-5 rounded-xl border-2 transition-all ${
                  selectedPayment === method
                    ? "border-green-900 bg-green-800 text-white"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center space-x-3">
                  {method === "cash" ? (
                    <CurrencyRupeeIcon className="w-5 h-5" />
                  ) : (
                    <CreditCardIcon className="w-5 h-5" />
                  )}
                  <span className="font-medium">
                    {method.charAt(0).toUpperCase() + method.slice(1)}
                  </span>
                </div>
                <span className="font-bold">
                  {displayFare !== "—" ? `₹${displayFare}` : "—"}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-white border-t md:backdrop-blur-lg md:bg-white/90">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleConfirm}
          disabled={!selectedPayment || submitting}
          className={`w-full py-4 md:py-5 rounded-xl font-bold text-lg md:text-xl ${
            selectedPayment
              ? "bg-black text-white hover:bg-gray-900"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {submitting
            ? "Requesting..."
            : selectedPayment
            ? "Confirm Pickup"
            : "Select Payment Method"}
        </motion.button>
      </div>
    </motion.div>
  );
}

export default ConfirmRide;
