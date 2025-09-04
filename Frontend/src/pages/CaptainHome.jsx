import React, { useState, useRef, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import CaptainDetails from "../components/CaptainDetails";
import RidePopup from "../components/RidePopup";
import ConfirmRidePopup from "../components/ConfirmRidePopup";
import { useSocket } from "../context/SocketContext.jsx";
import { CaptainContext } from "../context/CaptainContext.jsx";
import LoadingScreen from "../components/LoadingScreen.jsx";
import TripNowBlack from "../assets/TripNowBlack.png";
import LiveTracking from "../components/LiveTracking";

const CaptainHome = () => {
  // UI State Management
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [showRideRequest, setShowRideRequest] = useState(false);
  const [showConfirmRide, setShowConfirmRide] = useState(false);
  const [rideData, setRideData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isOnline, setIsOnline] = useState(() => {
    const saved = localStorage.getItem("captainOnlineStatus");
    return saved ? JSON.parse(saved) : true;
  });

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
        return;
      }
      setRideData({
        ...data.ride,
        user: data.user,
        isMockData: false,
        _id: data.ride._id,
      });

      setShowRideRequest(true);
    });
    return cleanup;
  }, [onMessage, isOnline]);

  useEffect(() => {
    if (captain && sendMessage) {
      // Join captain room
      sendMessage("join", {
        userId: captain._id,
        userType: "captain",
      });

      // Add timeout for join confirmation
      const joinTimeout = setTimeout(() => {
        console.warn("⚠️ Socket join timeout - connection may have failed");
        toast.error("Connection issue detected. Please refresh the page.");
      }, 5000);

      // Listen for join confirmation
      const cleanup = onMessage("joined", (data) => {
        clearTimeout(joinTimeout);
        if (data.success && data.userType === "captain") {
          console.log("✅ Captain successfully joined socket room");
          toast.success("Connected successfully!");
        }
      });

      // Listen for join errors
      const errorCleanup = onMessage("error", (error) => {
        clearTimeout(joinTimeout);
        console.error("❌ Socket join error:", error);
        toast.error(`Connection failed: ${error.message}`);
      });

      return () => {
        clearTimeout(joinTimeout);
        cleanup();
        errorCleanup();
      };
    }
  }, [captain, sendMessage, onMessage]);

  useEffect(() => {
    const cleanupJoined = onMessage("joined", (data) => {
      console.log("Successfully joined as:", data.role);
    });

    const cleanupError = onMessage("error", (error) => {
      console.error("Socket error:", error.message);
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
          sendMessage("update-location-captain", {
            userId: captain._id,
            role: "captain",
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          });
        });
      }
    };

    const locationInterval = setInterval(updateLocation, 10000);
    updateLocation();

    return () => clearInterval(locationInterval);
  }, [isOnline, captain, sendMessage]);

  useEffect(() => {
    localStorage.setItem("captainOnlineStatus", JSON.stringify(isOnline));
  }, [isOnline]);

  useEffect(() => {
    if (!isOnline) {
      setShowRideRequest(false);
      setShowConfirmRide(false);
    }
  }, [isOnline]);

  const handleCaptainLocationUpdate = (location) => {
    if (sendMessage && captain) {
      sendMessage("captain-location-update", {
        captainId: captain._id,
        latitude: location.lat,
        longitude: location.lng,
      });
    }
  };

  if (isLoading) {
    return (
      <LoadingScreen
        title="Welcome Captain"
        subtitle="Ready to serve riders..."
        loadingText="Preparing your Dashboard..."
      />
    );
  }

  const handleLogout = () => {
    window.location.href = "/captain-login";
  };

  const toggleDetailsPanel = () => setDetailsExpanded(!detailsExpanded);

  const handleAcceptRide = async (rideId) => {
    console.log("🚗 Attempting to accept ride:", rideId);

    // Validate inputs
    if (!rideId || typeof rideId !== "string") {
      console.error("❌ Invalid ride ID:", rideId);
      toast.error("Invalid ride information");
      return;
    }

    if (!captain?._id) {
      console.error("❌ No captain data found");
      toast.error("Captain authentication failed. Please login again.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("❌ No authentication token found");
        toast.error("Authentication required. Please login again.");
        return;
      }

      console.log("📡 Sending accept ride request...");

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

      const data = await res.json();
      console.log("📨 Accept ride response:", { status: res.status, data });

      if (!res.ok) {
        console.error("❌ Accept ride failed:", data);

        // Handle specific error cases
        if (res.status === 401) {
          toast.error("Session expired. Please login again.");
          // Redirect to login
          localStorage.removeItem("token");
          window.location.href = "/captain-login";
          return;
        } else if (res.status === 404) {
          toast.error("Ride not found or already taken");
        } else if (res.status === 400) {
          toast.error(data.error || "Ride no longer available");
        } else {
          toast.error(data.error || "Failed to accept ride");
        }

        // Hide the ride request on error
        setShowRideRequest(false);
        return;
      }

      console.log("✅ Ride accepted successfully");
      toast.success("Ride accepted successfully!");

      // Store ride data for navigation
      const completeRideData = {
        ...rideData,
        _id: rideId,
        status: "accepted",
        acceptedAt: new Date().toISOString(),
        captain: captain,
      };

      localStorage.setItem("activeRide", JSON.stringify(completeRideData));

      // Update UI state
      setShowRideRequest(false);
      setShowConfirmRide(true);
    } catch (error) {
      console.error("❌ Network/Parse error:", error);

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        toast.error("Network connection failed. Please check your internet.");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }

      // Hide the ride request on error
      setShowRideRequest(false);
    }
  };

  const handleIgnoreRide = (rideId) => {
    sendMessage("ride-response", { rideId, status: "rejected" });
    setShowRideRequest(false);
  };

  const handleConfirmRide = (rideId, otp) => {
    setShowConfirmRide(false);
  };

  const handleCancelRide = (rideId) => {
    setShowConfirmRide(false);
  };

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
      {/* Live Tracking Map */}
      <div className="absolute inset-0 z-0">
        <LiveTracking
          pickup={
            rideData?.pickup
              ? {
                  lat: rideData.pickup.latitude || 0,
                  lng: rideData.pickup.longitude || 0,
                }
              : null
          }
          destination={
            rideData?.destination
              ? {
                  lat: rideData.destination.latitude || 0,
                  lng: rideData.destination.longitude || 0,
                }
              : null
          }
          captainLocation={{
            lat: captain?.location?.latitude || 0,
            lng: captain?.location?.longitude || 0,
          }}
          rideStatus={
            showRideRequest || showConfirmRide ? "accepted" : "default"
          }
          onLocationUpdate={handleCaptainLocationUpdate}
        />
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-3 sm:p-4">
        <div className="flex items-center">
          <img
            src={TripNowBlack}
            alt="TripNow Logo"
            className="w-15 h-15 sm:w-15 sm:h-7"
          />
        </div>

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
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </header>

      {/* Ride Request and Confirm Popups */}
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

      {/* Captain Details Panel */}
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
            <div
              className="py-3 px-4 flex justify-center cursor-pointer bg-yellow-400"
              onClick={toggleDetailsPanel}
            >
              <div className="w-10 h-1 bg-white rounded-full"></div>
            </div>

            <div className="max-h-[75vh] overflow-y-auto">
              <CaptainDetails isOnline={isOnline} setIsOnline={setIsOnline} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Indicator */}
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
    </div>
  );
};

export default CaptainHome;
