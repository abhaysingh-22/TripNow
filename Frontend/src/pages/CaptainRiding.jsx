import React, { useState, useRef, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { CaptainContext } from "../context/CaptainContext.jsx";
import { useSocket } from "../context/SocketContext.jsx";
import TripNowBlack from "../assets/TripNowBlack.png";
import LiveTracking from "../components/LiveTracking";
import FinishRide from "../components/FinishRide";
import toast from "react-hot-toast";

// Custom hooks for better reusability
const useRideData = (location) => {
  const [rideData, setRideData] = useState({
    _id: "ride-123",
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
      latitude: 0,
      longitude: 0,
    },
    destination: {
      address: "Loading destination...",
      latitude: 0,
      longitude: 0,
    },
  });

  useEffect(() => {
    const { state } = location;

    if (state?.rideData) {
      const { rideData: navRideData } = state;

      setRideData({
        _id: navRideData._id || navRideData.id,
        user: {
          name: navRideData.user?.name || "Unknown User",
          rating: navRideData.user?.rating || 4.5,
          photo:
            navRideData.user?.photo ||
            "https://randomuser.me/api/portraits/lego/1.jpg",
        },
        amount: Number(navRideData.amount || navRideData.fare || 0),
        distance: Number(navRideData.distance || 0),
        duration: Number(navRideData.duration || 0),
        pickup: {
          address:
            navRideData.pickupLocation ||
            navRideData.pickup?.address ||
            "Pickup Location",
          latitude: navRideData.pickup?.latitude || 0,
          longitude: navRideData.pickup?.longitude || 0,
        },
        destination: {
          address:
            navRideData.dropoffLocation ||
            navRideData.destination?.address ||
            "Destination",
          latitude: navRideData.destination?.latitude || 0,
          longitude: navRideData.destination?.longitude || 0,
        },
      });
    } else {
      const activeRide = JSON.parse(localStorage.getItem("activeRide") || "{}");

      if (activeRide && activeRide._id) {
        setRideData({
          _id: activeRide._id,
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
            latitude: activeRide.pickup?.latitude || 0,
            longitude: activeRide.pickup?.longitude || 0,
          },
          destination: {
            address: activeRide.dropoffLocation || "Destination",
            latitude: activeRide.destination?.latitude || 0,
            longitude: activeRide.destination?.longitude || 0,
          },
        });
      }
    }
  }, [location]);

  return [rideData, setRideData];
};

// Reusable status indicator component
const StatusIndicator = ({ status, text }) => (
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
      {text}
    </span>
  </div>
);

// Reusable user info component
const UserInfo = ({ user, amount, showEarning = true }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center">
      <div className="relative">
        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full overflow-hidden border-2 border-green-400">
          <img
            src={user.photo}
            alt={`${user.name} profile`}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
      <div className="ml-3">
        <h3 className="font-bold text-gray-800 text-base sm:text-lg">
          {user.name}
        </h3>
        <div className="flex items-center">
          <svg
            className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-xs sm:text-sm ml-1">{user.rating}</span>
        </div>
      </div>
    </div>

    {showEarning && (
      <div className="text-right">
        <p className="text-xs sm:text-sm text-gray-500">Earning</p>
        <p className="font-bold text-green-600 text-lg sm:text-xl">
          ₹{amount.toFixed(2)}
        </p>
      </div>
    )}
  </div>
);

// Reusable location display component
const LocationDisplay = ({ icon, label, address, color = "yellow" }) => (
  <div className="flex items-center">
    <div className="mr-3">
      <div
        className={`h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-${color}-100 flex items-center justify-center`}
      >
        {icon}
      </div>
    </div>
    <div className="flex-1">
      <p className="text-xs sm:text-sm text-gray-500">{label}</p>
      <p className="font-semibold text-gray-800 text-sm sm:text-base">
        {address}
      </p>
    </div>
  </div>
);

function CaptainRiding() {
  const { captain } = useContext(CaptainContext);
  const { onMessage, sendMessage } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  // State management
  const [isRideComplete, setIsRideComplete] = useState(false);
  const [showFinishPanel, setShowFinishPanel] = useState(false);
  const [showDestinationMessage, setShowDestinationMessage] = useState(false);

  // Custom hook for ride data
  const [rideData, setRideData] = useRideData(location);

  // Show destination reached message after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDestinationMessage(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Handle captain location updates during ride
  const handleCaptainLocationUpdate = (locationData) => {
    if (sendMessage && rideData?._id) {
      sendMessage("captain-location-update", {
        rideId: rideData._id,
        latitude: locationData.lat,
        longitude: locationData.lng,
      });
    }
  };

  // Handle ride completion
  const handleCompleteRide = () => {
    setShowFinishPanel(true);
  };

  // Close finish panel
  const handleCloseFinishPanel = () => {
    setShowFinishPanel(false);
  };

  // Finish ride and send to backend
  const handleRideFinished = async () => {
    const activeRide = JSON.parse(localStorage.getItem("activeRide") || "{}");
    const rideId = activeRide._id || rideData._id || rideData.id;
    const earnings =
      activeRide.amount || activeRide.fare || rideData.amount || 0;
    const distance = activeRide.distance || rideData.distance || 0;
    const duration = activeRide.duration || rideData.duration || 0;

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
            rideId: rideId,
            fare: Number(earnings),
            distance: Number(distance),
            duration: Number(duration),
          }),
        }
      );

      const responseData = await response.json();

      if (response.ok) {
        localStorage.removeItem("activeRide");

        window.dispatchEvent(
          new CustomEvent("rideCompleted", {
            detail: { rideId, earnings: Number(earnings) },
          })
        );
      } else {
        console.error("Failed to complete ride:", responseData);
        toast.error(
          "Failed to complete ride: " +
            (responseData.message || "Unknown error")
        );
      }
    } catch (error) {
      console.error("Error completing ride:", error);
      toast.error("Error completing ride: " + error.message);
    }

    if (sendMessage && rideId) {
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

  // Listen for ride updates
  useEffect(() => {
    if (!onMessage) return;

    const cleanup = onMessage("ride-update", (data) => {
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

  // Animation variants
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
    <div className="h-screen w-full overflow-hidden fixed inset-0 bg-gray-100">
      {/* Live Tracking Map */}
      <div className="absolute inset-0 z-0">
        <LiveTracking
          pickup={
            rideData.pickup
              ? {
                  lat: rideData.pickup.latitude || 0,
                  lng: rideData.pickup.longitude || 0,
                }
              : null
          }
          destination={
            rideData.destination
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
          rideStatus="in-progress"
          onLocationUpdate={handleCaptainLocationUpdate}
        />
      </div>

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-3 sm:p-4 bg-white/95 backdrop-blur-sm shadow-md">
        <div className="flex items-center">
          <img
            src={TripNowBlack}
            alt="TripNow Logo"
            className="w-12 h-6 sm:w-15 sm:h-7"
          />
        </div>

        <StatusIndicator status="active" text="Active Ride" />
      </header>

      {/* Dynamic Bottom Panel */}
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
      >
        {/* Panel drag handle */}
        <div className="py-2 sm:py-3 px-4 flex justify-center cursor-pointer">
          <div className="w-8 sm:w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {/* Scrollable content area */}
        <div className="h-full overflow-y-auto pb-6">
          {/* Finish Ride Panel */}
          {showFinishPanel ? (
            <FinishRide
              rideData={rideData}
              onClose={handleCloseFinishPanel}
              onFinish={handleRideFinished}
            />
          ) : (
            <>
              {/* Destination Reached Notification */}
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
                <UserInfo user={rideData.user} amount={rideData.amount} />

                {/* Destination address with icon */}
                <LocationDisplay
                  icon={
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
                  }
                  label="Destination"
                  address={rideData.destination.address}
                  color="yellow"
                />

                {/* Complete Ride Button */}
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

      {/* Ride Completion Success Message */}
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
