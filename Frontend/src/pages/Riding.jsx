import React, { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ChevronUpIcon,
  PhoneIcon,
  ChatBubbleLeftIcon,
  CreditCardIcon,
  CurrencyRupeeIcon,
  StarIcon,
  HomeIcon,
} from "@heroicons/react/24/solid";
import LiveTracking from "../components/LiveTracking";

function Riding({
  selectedVehicle,
  pickup,
  destination,
  selectedPayment,
  onCancel,
  onHome,
}) {
  const [isPanelExpanded, setIsPanelExpanded] = useState(false);
  const [eta, setEta] = useState(8);

  // Memoized driver data to prevent unnecessary re-renders
  const driverData = useMemo(
    () => ({
      name: "Rajesh Kumar",
      rating: 4.8,
      totalRides: 1247,
      photo:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      numberPlate: "MH 12 AB 1234",
      carModel:
        selectedVehicle?.name === "CarGo"
          ? "Maruti Swift"
          : selectedVehicle?.name === "Auto"
          ? "Bajaj Auto"
          : selectedVehicle?.name === "Bike"
          ? "Honda Activa"
          : "Toyota Innova",
      carColor: "White",
    }),
    [selectedVehicle?.name]
  );

  // Optimized location update handler
  const handleUserLocationUpdate = useCallback((location) => {
    // You can send this to backend if needed
  }, []);

  // Memoized panel toggle handler
  const togglePanel = useCallback(() => {
    setIsPanelExpanded((prev) => !prev);
  }, []);

  // Animation variants - memoized for performance
  const panelVariants = useMemo(
    () => ({
      collapsed: {
        height: "140px",
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 35,
          mass: 0.5,
          restDelta: 0.001,
          restSpeed: 0.001,
        },
      },
      expanded: {
        height: "80vh",
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 35,
          mass: 0.5,
          restDelta: 0.001,
          restSpeed: 0.001,
        },
      },
    }),
    []
  );

  const contentVariants = useMemo(
    () => ({
      collapsed: {
        opacity: 0,
        y: 10,
        transition: { duration: 0.2, ease: [0.4, 0.0, 0.2, 1] },
      },
      expanded: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3, ease: [0.4, 0.0, 0.2, 1], delay: 0.1 },
      },
    }),
    []
  );

  // Format location display
  const formatLocation = useCallback((location) => {
    if (typeof location === "string") return location;
    return location?.address || "Location not specified";
  }, []);

  // Action buttons component
  const ActionButtons = ({ onCall, onMessage }) => (
    <div className="flex space-x-2">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onCall}
        className="p-2 bg-green-100 hover:bg-green-200 rounded-full transition-colors"
        aria-label="Call driver"
      >
        <PhoneIcon className="w-5 h-5 text-green-600" />
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onMessage}
        className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
        aria-label="Message driver"
      >
        <ChatBubbleLeftIcon className="w-5 h-5 text-blue-600" />
      </motion.button>
    </div>
  );

  // Vehicle details component
  const VehicleDetails = () => (
    <div className="bg-gray-50 rounded-2xl p-4">
      <h4 className="font-bold mb-3">Vehicle Details</h4>
      <div className="flex items-center space-x-4">
        <img
          src={selectedVehicle?.image}
          alt={selectedVehicle?.name}
          className="w-16 h-12 object-contain rounded-lg bg-white p-2"
        />
        <div className="flex-1 grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-500">Model</p>
            <p className="font-semibold">{driverData.carModel}</p>
          </div>
          <div>
            <p className="text-gray-500">Color</p>
            <p className="font-semibold">{driverData.carColor}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Trip details component
  const TripDetails = () => (
    <div className="bg-white border border-gray-200 rounded-2xl p-4">
      <h4 className="font-bold mb-3">Trip Details</h4>
      <div className="space-y-3">
        <div>
          <p className="text-gray-400 font-medium text-sm mb-1">FROM</p>
          <p className="font-medium text-gray-900">{formatLocation(pickup)}</p>
        </div>
        <div className="border-l-2 border-gray-200 ml-2 h-4"></div>
        <div>
          <p className="text-gray-400 font-medium text-sm mb-1">TO</p>
          <p className="font-medium text-gray-900">
            {formatLocation(destination)}
          </p>
        </div>
      </div>
    </div>
  );

  // Payment status component
  const PaymentStatus = () => {
    const isCash = selectedPayment === "cash";
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-4">
        <h4 className="font-bold mb-3">Payment</h4>
        <div
          className={`flex items-center justify-between p-3 rounded-xl border ${
            isCash
              ? "bg-yellow-50 border-yellow-200"
              : "bg-green-50 border-green-200"
          }`}
        >
          <div className="flex items-center">
            {isCash ? (
              <CurrencyRupeeIcon className="w-5 h-5 text-yellow-600 mr-3" />
            ) : (
              <CreditCardIcon className="w-5 h-5 text-green-600 mr-3" />
            )}
            <div>
              <span className="font-medium capitalize">
                {selectedPayment || "Cash"}
              </span>
              <p
                className={`text-xs ${
                  isCash ? "text-yellow-600" : "text-green-600"
                }`}
              >
                {isCash ? "Pay at end of trip" : "Payment completed"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="font-bold text-lg">
              {selectedVehicle?.price || "₹299"}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Live tracking status component
  const LiveTrackingStatus = () => (
    <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
      <h4 className="font-bold mb-3 text-blue-900">Live Tracking</h4>
      <div className="flex items-center space-x-3">
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
        <div>
          <p className="text-blue-800 font-medium">GPS Active</p>
          <p className="text-xs text-blue-600">
            Your location is being tracked for safety
          </p>
        </div>
      </div>
    </div>
  );

  // Emergency buttons component
  const EmergencyButtons = () => (
    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-white via-white/95 to-transparent backdrop-blur-sm border-t border-gray-100">
      <div className="flex space-x-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          aria-label="Emergency contact"
        >
          Emergency
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCancel}
          className="flex-1 py-3 bg-red-100 text-red-700 rounded-xl font-semibold hover:bg-red-200 transition-colors"
          aria-label="Cancel current trip"
        >
          Cancel Trip
        </motion.button>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full overflow-hidden fixed inset-0 bg-black">
      {/* Live Tracking Map */}
      <div className="absolute inset-0 z-0">
        <LiveTracking
          pickup={
            pickup
              ? {
                  lat: pickup.latitude || 0,
                  lng: pickup.longitude || 0,
                }
              : null
          }
          destination={
            destination
              ? {
                  lat: destination.latitude || 0,
                  lng: destination.longitude || 0,
                }
              : null
          }
          rideStatus="in-progress"
          onLocationUpdate={handleUserLocationUpdate}
        />
      </div>

      {/* Top Status Bar */}
      <motion.div
        className="absolute top-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-b shadow-sm"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-semibold">Trip in Progress</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="font-bold">ETA: {eta} min</p>
              <p className="text-sm text-gray-600">3.2 km remaining</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onHome}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm border border-white/20 transition-colors"
              aria-label="Go to home"
            >
              <HomeIcon className="w-5 h-5 text-gray-700" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Expandable Bottom Panel */}
      <motion.div
        variants={panelVariants}
        initial="collapsed"
        animate={isPanelExpanded ? "expanded" : "collapsed"}
        className="absolute bottom-0 left-0 right-0 z-30 bg-white rounded-t-3xl shadow-2xl md:right-0 md:w-[400px] flex flex-col"
        style={{ willChange: "height", contain: "layout style paint" }}
      >
        {/* Panel Handle */}
        <motion.div
          className="flex justify-center py-3 cursor-pointer bg-white rounded-t-3xl relative z-40 flex-shrink-0"
          onClick={togglePanel}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-12 h-1 bg-gray-300 rounded-full mb-2"></div>
          <motion.div
            animate={{ rotate: isPanelExpanded ? 180 : 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="absolute top-4"
          >
            <ChevronUpIcon className="w-6 h-6 text-gray-400" />
          </motion.div>
        </motion.div>

        {/* Collapsed View - Driver Summary */}
        <div className="px-4 md:px-6 pb-4 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <img
              src={driverData.photo}
              alt={`${driverData.name} profile`}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
            />
            <div className="flex-1">
              <h4 className="font-bold">{driverData.name}</h4>
              <div className="flex items-center">
                <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                <span className="text-sm">{driverData.rating}</span>
                <span className="text-sm text-gray-500 ml-2">
                  {driverData.numberPlate}
                </span>
              </div>
            </div>
            <ActionButtons />
          </div>
        </div>

        {/* Expanded View - Full Details */}
        <motion.div
          variants={contentVariants}
          animate={isPanelExpanded ? "expanded" : "collapsed"}
          className="flex-1 overflow-hidden"
        >
          <div
            className="px-4 md:px-6 pb-20 space-y-4 overflow-y-auto h-full"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgb(203 213 225) transparent",
            }}
          >
            <VehicleDetails />
            <TripDetails />
            <PaymentStatus />
            <LiveTrackingStatus />
          </div>
          <EmergencyButtons />
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Riding;
