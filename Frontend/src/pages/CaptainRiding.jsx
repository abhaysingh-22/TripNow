// CaptainRiding.jsx - Active ride management interface for captains
// Features: Real-time destination tracking, ride completion, responsive design
// This component handles the captain's view during an active ride with animations and state management
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import mapVideo from "../assets/maps.mp4";

function CaptainRiding() {
  // Map interaction state
  const [mapZoom, setMapZoom] = useState(1);

  // Ride progress tracking - initialized to show immediate destination reached for demo
  const [remainingTime, setRemainingTime] = useState(0); // in minutes
  const [remainingDistance, setRemainingDistance] = useState(0); // in km
  const [isRideComplete, setIsRideComplete] = useState(false);
  const [showFinishPanel, setShowFinishPanel] = useState(false);
  const [showDestinationMessage, setShowDestinationMessage] = useState(false);

  // Refs and navigation
  const videoRef = useRef(null);
  const navigate = useNavigate();

  // Simulation settings for demo - in production this would use real GPS data
  const simulationSpeed = 500; // milliseconds between updates

  // Mock ride data - would typically come from API or context in production
  const [rideData] = useState({
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
  });

  // Apply smooth zoom transitions to the map video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.style.transform = `scale(${mapZoom})`;
      videoRef.current.style.transition = "transform 0.3s ease";
    }
  }, [mapZoom]);

  // Show destination reached message after component mounts (for demo purposes)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDestinationMessage(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Set to always show destination reached for immediate testing/demo
  const hasReachedDestination = true;

  // Map zoom controls - allows captains to zoom in/out on the map
  const handleZoomIn = () => {
    setMapZoom((prev) => Math.min(prev + 0.1, 1.5));
  };

  const handleZoomOut = () => {
    setMapZoom((prev) => Math.max(prev - 0.1, 1));
  };

  // Handle ride completion - shows finish panel immediately
  const handleCompleteRide = () => {
    console.log("Complete Ride button clicked!");
    setShowFinishPanel(true);
  };

  // Close finish panel without completing ride
  const handleCloseFinishPanel = () => {
    setShowFinishPanel(false);
  };

  // Complete the ride and navigate back to captain home
  const handleRideFinished = () => {
    setIsRideComplete(true);
    setShowFinishPanel(false);

    // Show completion message briefly, then navigate to captain home
    setTimeout(() => {
      navigate("/captain-home");
    }, 3000);
  };

  // Animation variants for consistent animations
  const animations = {
    panel: {
      hidden: { y: "100%", opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring", damping: 25, stiffness: 200 },
      },
      exit: {
        y: "100%",
        opacity: 0,
        transition: { duration: 0.3 },
      },
    },
    message: {
      hidden: { scale: 0, opacity: 0 },
      visible: {
        scale: 1,
        opacity: 1,
        transition: { type: "spring", damping: 20 },
      },
      exit: {
        scale: 0,
        opacity: 0,
        transition: { duration: 0.2 },
      },
    },
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden m-0 p-0">
      {/* Full-screen interactive map with zoom capability */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover origin-center"
          autoPlay
          loop
          muted
          playsInline
          aria-label="Navigation map showing current route"
        >
          <source src={mapVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Header - Uber branding and ride status indicator */}
      <header className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-3 sm:p-4 bg-white bg-opacity-90 shadow-md">
        <div className="flex items-center">
          <img
            src="https://w7.pngwing.com/pngs/801/240/png-transparent-uber-hd-logo.png"
            alt="Uber Logo"
            className="w-12 h-6 sm:w-15 sm:h-7"
          />
        </div>

        {/* Active ride status indicator with animation */}
        <div className="flex items-center">
          <div className="flex items-center bg-green-100 px-2 sm:px-3 py-1 rounded-full">
            <motion.div
              className="w-2 h-2 bg-green-500 rounded-full mr-2"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
            <span className="text-xs sm:text-sm font-medium text-green-800">
              Active Ride
            </span>
          </div>
        </div>
      </header>

      {/* Map zoom controls - positioned for easy thumb access */}
      <div className="absolute top-16 sm:top-20 right-4 sm:right-6 flex flex-col gap-2 z-30">
        {/* Zoom controls for map interaction */}
        <motion.button
          className="bg-white rounded-full p-2 sm:p-3 shadow-lg"
          onClick={handleZoomIn}
          aria-label="Zoom in"
          whileHover={{ scale: 1.1, backgroundColor: "#f9fafb" }}
          whileTap={{ scale: 0.95 }}
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </motion.button>
        <motion.button
          className="bg-white rounded-full p-2 sm:p-3 shadow-lg"
          onClick={handleZoomOut}
          aria-label="Zoom out"
          whileHover={{ scale: 1.1, backgroundColor: "#f9fafb" }}
          whileTap={{ scale: 0.95 }}
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 12H4"
            />
          </svg>
        </motion.button>
      </div>

      {/* Dynamic Bottom Panel - Contains ride info and controls */}
      {/* Panel height adjusts based on current state: default, destination reached, or finish ride */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 z-40 bg-white rounded-t-2xl shadow-lg overflow-hidden"
        initial={{ y: 0, height: "180px" }}
        animate={{
          height: showFinishPanel
            ? "450px"
            : showDestinationMessage
            ? "320px"
            : "180px",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{ bottom: 0 }}
      >
        {/* Panel drag handle for visual feedback */}
        <div className="py-2 sm:py-3 px-4 flex justify-center cursor-pointer">
          <div className="w-8 sm:w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Scrollable content area - allows vertical scrolling when content exceeds panel height */}
        <div className="h-full overflow-y-auto pb-6">
          {/* Finish Ride Panel - Shows payment collection and ride completion interface */}
          {showFinishPanel ? (
            <motion.div
              variants={animations.panel}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="p-4 sm:p-6"
            >
              {/* Ride Completion Interface Header */}
              <div className="text-center mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-8 h-8 sm:w-10 sm:h-10 text-green-500"
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
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                  Ride Completed
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Finalize the ride details
                </p>
              </div>

              {/* Customer Information Card */}
              <div className="flex items-center mb-3 sm:mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden">
                  <img
                    src={rideData.user.photo}
                    alt={`${rideData.user.name} profile`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="font-medium text-gray-800 text-sm sm:text-base">
                    {rideData.user.name}
                  </h3>
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
                <div className="text-right">
                  <p className="text-xs text-gray-500">Earning</p>
                  <p className="font-bold text-green-600 text-sm sm:text-base">
                    ₹{rideData.amount.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Trip Route Information */}
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-5">
                {/* Pickup Location */}
                <div className="flex">
                  <div className="mr-3">
                    <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg
                        className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600"
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
                    <p className="font-medium text-gray-800 text-sm">
                      {rideData.pickup.address}
                    </p>
                  </div>
                </div>

                {/* Destination Location */}
                <div className="flex">
                  <div className="mr-3">
                    <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-yellow-100 flex items-center justify-center">
                      <svg
                        className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600"
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
                    <p className="font-medium text-gray-800 text-sm">
                      {rideData.destination.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Trip Summary Statistics */}
              <div className="flex justify-between mb-4 sm:mb-5 py-2 sm:py-3 px-3 sm:px-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Distance</p>
                  <p className="font-bold text-gray-800 text-sm">
                    {rideData.distance} km
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="font-bold text-gray-800 text-sm">
                    {rideData.duration} min
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="font-bold text-green-600 text-sm">
                    ₹{rideData.amount.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Action Buttons - Complete or cancel ride completion */}
              <div className="flex flex-col gap-2 sm:gap-3">
                <motion.button
                  className="w-full py-3 rounded-xl bg-green-500 text-white font-medium text-sm sm:text-base"
                  onClick={() => navigate("/captain-home")}
                  whileHover={{ scale: 1.02, backgroundColor: "#059669" }}
                  whileTap={{ scale: 0.98 }}
                  aria-label="Finish ride and return to captain home"
                >
                  Finish This Ride
                </motion.button>

                <motion.button
                  className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 font-medium text-sm sm:text-base"
                  onClick={handleCloseFinishPanel}
                  whileHover={{ scale: 1.02, backgroundColor: "#f3f4f6" }}
                  whileTap={{ scale: 0.98 }}
                  aria-label="Cancel and return to ride view"
                >
                  Back
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <>
              {/* Destination Reached Notification - Appears after 3 second delay */}
              <AnimatePresence>
                {showDestinationMessage && (
                  <motion.div
                    variants={animations.message}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="bg-green-100 px-3 sm:px-4 py-2 flex items-center justify-center"
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-green-800 font-medium text-sm sm:text-base">
                      You've reached the destination!
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Active Ride Information Panel */}
              <div className="px-4 sm:px-6 py-2 space-y-2 sm:space-y-3">
                {/* Customer and earnings information */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden border-2 border-green-400">
                        <img
                          src={rideData.user.photo}
                          alt={`${rideData.user.name} profile`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="ml-3">
                      <h3 className="font-bold text-gray-800 text-base sm:text-lg">
                        {rideData.user.name}
                      </h3>
                      <div className="flex items-center">
                        <svg
                          className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-xs sm:text-sm ml-1">
                          {rideData.user.rating}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Trip earnings display */}
                  <div className="text-right">
                    <p className="text-xs sm:text-sm text-gray-500">Earning</p>
                    <p className="font-bold text-green-600 text-lg sm:text-xl">
                      ₹{rideData.amount.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Destination address with icon */}
                <div className="flex items-center">
                  <div className="mr-3">
                    <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                      <svg
                        className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600"
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
                    <p className="text-xs sm:text-sm text-gray-500">
                      Destination
                    </p>
                    <p className="font-semibold text-gray-800 text-sm sm:text-base">
                      {rideData.destination.address}
                    </p>
                  </div>
                </div>

                {/* Complete Ride Button - Only visible after destination message */}
                {/* This button triggers the ride completion flow */}
                <AnimatePresence>
                  {showDestinationMessage && (
                    <motion.div
                      variants={animations.panel}
                      initial="hidden"
                      animate="visible"
                      className="pt-2 sm:pt-3 pb-3 sm:pb-4"
                    >
                      <motion.button
                        className="w-full py-3 sm:py-4 rounded-xl bg-green-500 text-white font-bold text-base sm:text-lg shadow-lg hover:bg-green-600 active:bg-green-700 transition-colors duration-200"
                        onClick={handleCompleteRide}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          minHeight: "48px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        aria-label="Complete the current ride"
                      >
                        Complete Ride
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Ride Completion Success Message - Full screen overlay */}
      {/* Shows when ride is marked as complete, with auto-navigation after 3 seconds */}
      <AnimatePresence>
        {isRideComplete && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50"
            variants={animations.message}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              className="bg-white rounded-xl p-6 sm:p-8 max-w-xs sm:max-w-sm mx-4 text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 25 }}
            >
              {/* Success icon */}
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10 text-green-500"
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

              {/* Success message */}
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                Ride Completed!
              </h2>
              <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
                You've earned ₹{rideData.amount.toFixed(2)} for this trip.
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                Returning to home screen...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CaptainRiding;
