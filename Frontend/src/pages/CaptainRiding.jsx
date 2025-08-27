// CaptainRiding.jsx - Active ride management interface for captains
// Features: Real-time destination tracking, ride completion, responsive design
// This component handles the captain's view during an active ride with animations and state management
import React, { useState, useRef, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import mapVideo from "../assets/maps.mp4";
import { CaptainContext } from "../context/CaptainContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";
import TripNow from "../assets/TripNow.png";
import TripNowBlack from "../assets/TripNowBlack.png";

function CaptainRiding() {
  // Add these imports and context
  const { captain } = useContext(CaptainContext);
  const { onMessage, sendMessage } = useSocket();

  // Map interaction state
  const [mapZoom, setMapZoom] = useState(1);
  const [remainingTime, setRemainingTime] = useState(0);
  const [remainingDistance, setRemainingDistance] = useState(0);
  const [isRideComplete, setIsRideComplete] = useState(false);
  const [showFinishPanel, setShowFinishPanel] = useState(false);
  const [showDestinationMessage, setShowDestinationMessage] = useState(false);

  // ✅ Real ride data state instead of mock data
  const [rideData, setRideData] = useState({
    id: "ride-123",
    user: {
      name: "Loading...",
      rating: 4.5,
      photo: "https://randomuser.me/api/portraits/lego/1.jpg",
    },
    amount: 250,
    distance: 12.5,
    duration: 25,
    pickup: {
      address: "Loading pickup location...",
      time: "3 min away",
    },
    destination: {
      address: "Loading destination...",
      time: "18 min",
    },
  });

  // Refs and navigation
  const videoRef = useRef(null);
  const navigate = useNavigate();

  // Simulation settings for demo - in production this would use real GPS data
  const simulationSpeed = 500; // milliseconds between updates

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

  // ...existing code...
  const handleRideFinished = async () => {
    // ✅ Get real ride data from localStorage
    const activeRide = JSON.parse(localStorage.getItem("activeRide") || "{}");
    const rideId = activeRide._id || rideData._id || rideData.id;
    const earnings =
      activeRide.amount || activeRide.fare || rideData.amount || 0;
    const distance = activeRide.distance || rideData.distance || 0;
    const duration = activeRide.duration || rideData.duration || 0;

    console.log("🎯 Finishing ride with REAL data:", {
      rideId,
      earnings,
      distance,
      duration,
      activeRide,
    });

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/rides/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            rideId: rideId, // ✅ Use real ride ID
            fare: Number(earnings),
            distance: Number(distance),
            duration: Number(duration),
          }),
        }
      );

      const responseData = await response.json();
      console.log("📥 Complete ride response:", responseData);

      if (response.ok) {
        console.log("✅ Ride completed successfully on backend");

        // ✅ Clear the active ride from localStorage
        localStorage.removeItem("activeRide");

        // ✅ Dispatch custom event with REAL earnings
        window.dispatchEvent(
          new CustomEvent("rideCompleted", {
            detail: { rideId, earnings: Number(earnings) },
          })
        );
      } else {
        console.error("❌ Failed to complete ride on backend:", responseData);
        toast.error(
          "Failed to complete ride: " +
            (responseData.message || "Unknown error")
        );
      }
    } catch (error) {
      console.error("❌ Error completing ride:", error);
      toast.error("Error completing ride: " + error.message);
    }

    // ✅ Send socket message for user redirect
    if (sendMessage && rideId) {
      console.log("🚀 Broadcasting ride completion to all users");
      sendMessage("message", {
        type: "ride-completed",
        rideId,
        message: "Ride has been completed",
        timestamp: Date.now(),
      });
    }

    setIsRideComplete(true);
    setShowFinishPanel(false);

    setTimeout(() => {
      navigate("/captain-home");
    }, 3000);
  };
  // ...existing code...
  // ✅ REPLACE the entire useEffect that loads ride data (around line 160-190)
  useEffect(() => {
    // Get ride data from location state (passed from ConfirmRidePopup after OTP verification)
    const { state } = location;
    console.log("📍 Location state in CaptainRiding:", state);

    if (state?.rideData) {
      const { rideData } = state;
      console.log("✅ Using real ride data from navigation state:", rideData);

      setRideData({
        _id: rideData._id || rideData.id, // ✅ Use real MongoDB _id
        user: {
          name: rideData.user?.name || "Unknown User",
          rating: rideData.user?.rating || 4.5,
          photo:
            rideData.user?.photo ||
            "https://randomuser.me/api/portraits/lego/1.jpg",
        },
        amount: Number(rideData.amount || rideData.fare || 0),
        distance: Number(rideData.distance || 0),
        duration: Number(rideData.duration || 0),
        pickup: {
          address:
            rideData.pickupLocation ||
            rideData.pickup?.address ||
            "Pickup Location",
          time: "Picked up",
        },
        destination: {
          address:
            rideData.dropoffLocation ||
            rideData.destination?.address ||
            "Destination",
          time: "Arriving soon",
        },
      });
    } else {
      // ✅ Fallback: Try to get from localStorage (if captain refreshes page)
      const activeRide = JSON.parse(localStorage.getItem("activeRide") || "{}");
      console.log("📍 Fallback: Active ride from localStorage:", activeRide);

      if (activeRide && activeRide._id) {
        setRideData({
          _id: activeRide._id, // ✅ Use real MongoDB _id
          user: {
            name: activeRide.user?.name || "Unknown User",
            rating: activeRide.user?.rating || 4.5,
            photo:
              activeRide.user?.photo ||
              "https://randomuser.me/api/portraits/lego/1.jpg",
          },
          amount: Number(activeRide.amount || activeRide.fare || 0),
          distance: Number(activeRide.distance || 0),
          duration: Number(activeRide.duration || 0),
          pickup: {
            address: activeRide.pickupLocation || "Pickup Location",
            time: "Picked up",
          },
          destination: {
            address: activeRide.dropoffLocation || "Destination",
            time: "Arriving soon",
          },
        });
      } else {
        console.warn("⚠️ No real ride data found. Using mock data for demo.");
        // Keep existing mock data as fallback
      }
    }
  }, [location]);
  // ...existing code...

  // ✅ Add useEffect to get real ride data
  useEffect(() => {
    // Get ride data from localStorage or API
    const activeRide = JSON.parse(localStorage.getItem("activeRide") || "{}");
    console.log("📍 Active ride from localStorage:", activeRide);

    if (activeRide && Object.keys(activeRide).length > 0) {
      // ✅ Extract user data from the ride structure
      const userData = activeRide.user || {};

      setRideData({
        id: activeRide._id || activeRide.id || "ride-123",
        user: {
          name: userData.name || "Unknown User",
          rating: userData.rating || 4.5,
          photo:
            userData.photo || "https://randomuser.me/api/portraits/lego/1.jpg",
        },
        amount: Number(activeRide.amount || activeRide.fare || 0),
        distance: Number(activeRide.distance || 0),
        duration: Number(activeRide.duration || 0),
        pickup: {
          address:
            activeRide.pickupLocation ||
            activeRide.pickup?.address ||
            "Pickup Location",
          time: activeRide.pickup?.time || "Picked up",
        },
        destination: {
          address:
            activeRide.dropoffLocation ||
            activeRide.destination?.address ||
            "Destination",
          time: activeRide.destination?.time || "Arriving soon",
        },
      });

      console.log("✅ Processed ride data for CaptainRiding:", {
        id: activeRide._id,
        user: userData,
        amount: activeRide.amount || activeRide.fare,
        pickup: activeRide.pickupLocation,
        destination: activeRide.dropoffLocation,
      });
    }
  }, []);

  // ✅ Listen for ride updates
  useEffect(() => {
    if (!onMessage) return;

    const cleanup = onMessage("ride-update", (data) => {
      console.log("Ride update received:", data);
      setRideData((prevData) => ({
        ...prevData,
        ...data,
        user: data.user || prevData.user,
        pickup: data.pickup || prevData.pickup,
        destination: data.destination || prevData.destination,
      }));
    });

    return cleanup;
  }, [onMessage]);

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

      {/* Header - TripNow branding and ride status indicator */}
      <header className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-3 sm:p-4 bg-white bg-opacity-90 shadow-md">
        <div className="flex items-center">
          <img
            src={isDarkMode ? TripNow : TripNowBlack}
            alt="TripNow Logo"
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
            <div className="p-4 sm:p-6 h-full overflow-y-auto">
              {/* ✅ Inline FinishRide content instead of separate component */}
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
                <h2 className="text-lg font-bold text-gray-800">
                  Ride Completed
                </h2>
                <p className="text-sm text-gray-500">
                  Finalize the ride details
                </p>
              </div>

              {/* User Information */}
              <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="h-10 w-10 rounded-full overflow-hidden">
                  <img
                    src={rideData.user.photo}
                    alt={rideData.user.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="font-medium text-gray-800">
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
                  <p className="font-bold text-green-600">
                    ₹{rideData.amount.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Trip Details */}
              <div className="space-y-3 mb-4">
                {/* Pickup */}
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <svg
                      className="w-3 h-3 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="3" strokeWidth="2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Pickup</p>
                    <p className="font-medium text-gray-800 text-sm">
                      {rideData.pickup.address}
                    </p>
                  </div>
                </div>

                {/* Destination */}
                <div className="flex items-center">
                  <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
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
                  <div>
                    <p className="text-xs text-gray-500">Destination</p>
                    <p className="font-medium text-gray-800 text-sm">
                      {rideData.destination.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Trip Summary */}
              <div className="flex justify-between mb-4 py-2 px-3 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Distance</p>
                  <p className="font-bold text-gray-800 text-sm">
                    {rideData.distance.toFixed(1)} km
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="font-bold text-gray-800 text-sm">
                    {Math.round(rideData.duration)} min
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="font-bold text-green-600 text-sm">
                    ₹{rideData.amount.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <motion.button
                  className="w-full py-3 rounded-xl bg-green-500 text-white font-medium text-sm"
                  onClick={handleRideFinished}
                  whileHover={{ scale: 1.02, backgroundColor: "#059669" }}
                  whileTap={{ scale: 0.98 }}
                >
                  Finish This Ride
                </motion.button>
                <motion.button
                  className="w-full py-2 rounded-xl bg-gray-100 text-gray-700 font-medium text-sm"
                  onClick={handleCloseFinishPanel}
                  whileHover={{ scale: 1.02, backgroundColor: "#f3f4f6" }}
                  whileTap={{ scale: 0.98 }}
                >
                  Back
                </motion.button>
              </div>
            </div>
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
