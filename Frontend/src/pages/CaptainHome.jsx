// CaptainHome.jsx - Main dashboard for captain to manage rides and status
import React, { useState, useRef, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import mapVideo from "../assets/maps.mp4";
import toast from "react-hot-toast";
import CaptainDetails from "../components/CaptainDetails";
import RidePopup from "../components/RidePopup";
import ConfirmRidePopup from "../components/ConfirmRidePopup";
import { useSocket } from "../context/SocketContext.jsx";
import { CaptainContext } from "../context/CaptainContext.jsx";
import LoadingScreen from "../components/LoadingScreen.jsx";
import TripNowBlack from "../assets/TripNowBlack.png";

const CaptainHome = () => {
  // UI State Management
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [mapZoom, setMapZoom] = useState(1);
  const [showRideRequest, setShowRideRequest] = useState(false);
  const [showConfirmRide, setShowConfirmRide] = useState(false);
  const [rideData, setRideData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isOnline, setIsOnline] = useState(() => {
    const saved = localStorage.getItem("captainOnlineStatus");
    return saved ? JSON.parse(saved) : true;
  });

  // Video reference for zoom functionality
  const videoRef = useRef(null);

  const { captain } = useContext(CaptainContext);
  const { onMessage, sendMessage } = useSocket();

  useEffect(() => {
    const LoadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(LoadingTimer);
  }, []);

  useEffect(() => {
    const cleanup = onMessage("ride-request", (data) => {
      if (!isOnline) {
        console.log("Captain is offline. Ignoring ride request.");
        return;
      }
      // ✅ Store the complete data structure correctly
      setRideData({
        ...data.ride, // Spread the ride data
        user: data.user, // Add user data at top level
        isMockData: false, // Mark as real data
        _id: data.ride._id, // Ensure _id is at top level
      });

      setShowRideRequest(true);
    });
    return cleanup;
  }, [onMessage, isOnline]);

  useEffect(() => {
    if (captain && sendMessage) {
      sendMessage("join", {
        userId: captain._id,
        role: "captain", // ✅ Hardcode the role instead of using captain.role
      });
    }
  }, [captain, sendMessage]);

  useEffect(() => {
    const cleanupJoined = onMessage("joined", (data) => {
      console.log("✅ Successfully joined as:", data.role);
    });

    const cleanupError = onMessage("error", (error) => {
      console.error("❌ Socket error:", error.message);
    });

    return () => {
      cleanupJoined();
      cleanupError();
    };
  }, [onMessage]);

  useEffect(() => {
    if (!isOnline || !captain || !sendMessage) return;

    const updateLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          console.log("Sending location update:", {
            userId: captain._id,
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          });
          sendMessage("update-location-captain", {
            userId: captain._id,
            role: "captain", // ✅ Hardcode role
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          });
        });
      }
    };

    const locationInterval = setInterval(updateLocation, 10000);
    updateLocation(); // Send immediately on mount

    return () => clearInterval(locationInterval);
  }, [isOnline, captain, sendMessage]);

  // Save captain status to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("captainOnlineStatus", JSON.stringify(isOnline));
  }, [isOnline]);

  // Hide any active ride popups when captain goes offline
  useEffect(() => {
    if (!isOnline) {
      setShowRideRequest(false);
      setShowConfirmRide(false);
    }
  }, [isOnline]);

  // Apply zoom effect to map video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.style.transform = `scale(${mapZoom})`;
      videoRef.current.style.transition = "transform 0.3s ease";
    }
  }, [mapZoom]);

  if (isLoading) {
    return (
      <LoadingScreen
        title="Welcome Captain"
        subtitle="Ready to serve riders..."
        loadingText="Preparing your Dashboard..."
      />
    );
  }

  // Event Handlers
  const handleLogout = () => {
    window.location.href = "/captain-login";
    console.log("Redirecting to captain login page...");
  };

  const toggleDetailsPanel = () => setDetailsExpanded(!detailsExpanded);
  const handleZoomIn = () => setMapZoom((prev) => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setMapZoom((prev) => Math.max(prev - 0.1, 1));

  // Ride Management Handlers
  const handleAcceptRide = async (rideId) => {
    console.log(`Accepting ride: ${rideId}`);

    if (rideData?.isMockData) {
      console.log("Skipping API call for mock data");
      toast.success("Mock ride accepted! (No real API call)");
      setShowRideRequest(false);
      setShowConfirmRide(true);
      return;
    }

    if (!rideId || typeof rideId !== "string" || rideId.length !== 24) {
      console.error("❌ Invalid ride ID format:", rideId);
      toast.error("Invalid ride ID format");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("❌ No authentication token found");
        toast.error("Authentication required. Please login again.");
        return;
      }

      console.log(`📤 Sending accept request for ride: ${rideId}`);

      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/rides/accept`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rideId }),
        }
      );

      console.log(`📥 Response status: ${res.status}`);

      const data = await res.json();
      console.log(`📥 Response data:`, data);

      if (!res.ok) {
        throw new Error(data.error || "Failed to accept ride");
      }

      console.log("✅ Ride accepted successfully:", data);

      const completeRideData = {
        ...rideData, // Current ride request data
        _id: rideId,
        status: "accepted",
        acceptedAt: new Date().toISOString(),
        captain: {
          _id: captain._id,
          name: captain.fullName
            ? `${captain.fullName.firstName} ${
                captain.fullName.lastName || ""
              }`.trim()
            : captain.email,
          photo:
            captain.photo || "https://randomuser.me/api/portraits/men/34.jpg",
          rating: captain.rating || 4.8,
          vehicle: captain.vehicle,
        },
      };

      localStorage.setItem("activeRide", JSON.stringify(completeRideData));
      console.log("✅ Stored ride data:", completeRideData);

      if (sendMessage && rideData) {
        sendMessage("ride-accepted-by-captain", {
          rideId: rideId,
          captain: {
            _id: captain._id,
            name: captain.fullName
              ? `${captain.fullName.firstName} ${
                  captain.fullName.lastName || ""
                }`.trim()
              : captain.email,
            photo:
              captain.photo || "https://randomuser.me/api/portraits/men/34.jpg",
            rating: captain.rating || 4.8,
            totalRides: captain.totalRides || 1000,
            vehicle: {
              model: captain.vehicle?.model || "Swift",
              color: captain.vehicle?.color || "White",
              numberPlate: captain.vehicle?.numberPlate || "MH 12 AB 1234",
              type:
                captain.vehicle?.typeofVehicle ||
                rideData?.vehicleType ||
                "Car",
            },
          },
          estimatedArrival: "3 min", // ✅ This will be used in WaitingForDriver
          message: "Driver found! Your ride has been accepted.",
        });
      }
      setShowRideRequest(false);
      setShowConfirmRide(true);
    } catch (error) {
      console.error("❌ Accept ride error:", error);
      toast.error(error.message || "Failed to accept ride");
    }
  };

  const handleIgnoreRide = (rideId) => {
    console.log(`Ignored ride: ${rideId}`);
    // Send response to user
    sendMessage("ride-response", { rideId, status: "rejected" });
    setShowRideRequest(false);
  };

  const handleConfirmRide = (rideId, otp) => {
    console.log(`Confirmed ride: ${rideId} with OTP: ${otp}`);
    setShowConfirmRide(false);
  };

  const handleCancelRide = (rideId) => {
    console.log(`Cancelled ride: ${rideId}`);
    setShowConfirmRide(false);
  };

  // Animation variants for better performance
  const panelVariants = {
    expanded: { y: 0 },
    collapsed: { y: "calc(100% - 25vh)" },
    hidden: { y: "100%" },
  };

  const statusVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { delay: 0.5, type: "spring", stiffness: 300, damping: 20 },
    },
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      {/* Background Map Video - Full screen with zoom capability */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover origin-center"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={mapVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Header - Responsive padding and sizing */}
      <header className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-3 sm:p-4">
        <div className="flex items-center">
          <img
            src={TripNowBlack}
            alt="TripNow Logo"
            className="w-12 h-5 sm:w-15 sm:h-7"
          />
        </div>

        {/* Logout Button - Responsive sizing */}
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white p-2 sm:p-3 rounded-full transition-colors duration-200 shadow-lg"
          aria-label="Logout"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </header>

      {/* Ride Request and Confirm Popups - These appear from bottom with animation */}
      <AnimatePresence>
        {showRideRequest && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 z-40"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <RidePopup
              ride={rideData}
              onAccept={handleAcceptRide}
              onIgnore={handleIgnoreRide}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showConfirmRide && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 z-40"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <ConfirmRidePopup
              ride={rideData}
              onConfirm={handleConfirmRide}
              onCancel={handleCancelRide}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Captain Details Panel - Main info panel that can expand/collapse */}
      <AnimatePresence>
        {!showRideRequest && !showConfirmRide && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 z-20 bg-white rounded-t-2xl shadow-lg overflow-hidden"
            variants={panelVariants}
            initial="collapsed"
            animate={detailsExpanded ? "expanded" : "collapsed"}
            exit="hidden"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Panel Handle - Tap to expand/collapse */}
            <div
              className="py-3 px-4 flex justify-center cursor-pointer bg-yellow-400"
              onClick={toggleDetailsPanel}
            >
              <div className="w-10 h-1 bg-white rounded-full"></div>
            </div>

            {/* Scrollable content with responsive max height */}
            <div className="max-h-[75vh] overflow-y-auto">
              <CaptainDetails isOnline={isOnline} setIsOnline={setIsOnline} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Indicator - Shows online/offline status when panel is minimized */}
      {!detailsExpanded && !showRideRequest && !showConfirmRide && (
        <motion.div
          className={`absolute bottom-[calc(25vh+20px)] left-1/2 transform -translate-x-1/2 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-full shadow-lg z-30 flex items-center text-sm sm:text-base ${
            isOnline ? "bg-green-500" : "bg-red-500"
          }`}
          variants={statusVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          whileHover={{
            scale: 1.05,
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
          }}
        >
          <motion.span
            className="inline-block w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full mr-2"
            animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="font-medium whitespace-nowrap">
            {isOnline
              ? "Active - Ready for Rides"
              : "Inactive - Can't take rides"}
          </span>
        </motion.div>
      )}

      {/* Map Controls - Zoom and location controls */}
      {!detailsExpanded && !showRideRequest && !showConfirmRide && (
        <div className="absolute bottom-[calc(25vh+10px)] right-4 sm:right-6 flex flex-col gap-2 z-30">
          {/* Zoom In Button */}
          <motion.button
            className="bg-white rounded-full p-2 sm:p-3 shadow-lg"
            onClick={handleZoomIn}
            aria-label="Zoom in"
            whileHover={{ scale: 1.1, backgroundColor: "#f9fafb" }}
            whileTap={{ scale: 0.95 }}
          >
            <svg
              className="w-4 h-4 sm:w-6 sm:h-6 text-gray-700"
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

          {/* Zoom Out Button */}
          <motion.button
            className="bg-white rounded-full p-2 sm:p-3 shadow-lg"
            onClick={handleZoomOut}
            aria-label="Zoom out"
            whileHover={{ scale: 1.1, backgroundColor: "#f9fafb" }}
            whileTap={{ scale: 0.95 }}
          >
            <svg
              className="w-4 h-4 sm:w-6 sm:h-6 text-gray-700"
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

          {/* Center Location Button */}
          <motion.button
            className="bg-white rounded-full p-2 sm:p-3 shadow-lg"
            whileHover={{ scale: 1.1, backgroundColor: "#f9fafb" }}
            whileTap={{ scale: 0.95 }}
          >
            <svg
              className="w-4 h-4 sm:w-6 sm:h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default CaptainHome;
