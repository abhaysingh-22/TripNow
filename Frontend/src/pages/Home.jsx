import React, { useState, useEffect, useCallback, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { SocketProvider, useSocket } from "../context/SocketContext.jsx";
import { UserContext } from "../context/UserContext.jsx";

// Components
import LocationSearchPanel from "../components/LocationSearchPanel";
import LocationInputForm from "../components/LocationInputForm";
import AppHeader from "../components/AppHeader";
import PanelHeader from "../components/PanelHeader";
import ConfirmRide from "../components/ConfirmRide";
import LookingForDriver from "../components/LookingForDriver";
import WaitingForDriver from "../components/WaitingForDriver";
import Riding from "./Riding";
import LoadingScreen from "../components/LoadingScreen";
import VehiclePanel from "../components/VehiclePanel";

// Custom Hooks
import { useSuggestions } from "../hooks/useSuggestions";
import { useRideManagement } from "../hooks/useRideManagement";

// Assets
import mapVideo from "../assets/maps.mp4";

// Animation variants
const panelVariants = {
  mobile: {
    initial: { y: "100%", opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: { type: "tween", ease: "easeInOut", duration: 0.4 },
    },
    exit: {
      y: "100%",
      opacity: 0,
      transition: { type: "tween", ease: "easeInOut", duration: 0.4 },
    },
  },
  desktop: {
    initial: { x: "100%", opacity: 0 },
    animate: {
      x: 0,
      opacity: 1,
      transition: { type: "tween", ease: "easeInOut", duration: 0.4 },
    },
    exit: {
      x: "100%",
      opacity: 0,
      transition: { type: "tween", ease: "easeInOut", duration: 0.4 },
    },
  },
};

const headerVariants = {
  expanded: { scale: 1, opacity: 1, marginBottom: "2rem" },
  minimized: { scale: 0.9, opacity: 0.8, marginBottom: "0.5rem" },
};

const formVariants = {
  expanded: { height: "auto", opacity: 1, marginTop: "1rem" },
  minimized: { height: 0, opacity: 0, marginTop: 0, overflow: "hidden" },
};

// ✅ Add this new component inside Home.jsx (after imports, before Home function)
const OTPDisplay = ({ otp, onClose }) => {
  if (!otp) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-70 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25 }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Your Ride OTP
          </h3>
          <p className="text-sm text-gray-600">
            Share this code with your driver
          </p>
        </div>

        {/* OTP Display */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">One-Time Password</p>
            <div className="text-4xl font-bold text-blue-600 tracking-wider font-mono">
              {otp}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-sm">
              <p className="text-blue-800 font-medium mb-1">Important:</p>
              <p className="text-blue-700">
                Show this 4-digit code to your driver when they arrive. Keep it
                safe!
              </p>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <motion.button
          onClick={onClose}
          className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Got it
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

function Home() {
  const { sendMessage, onMessage } = useSocket();
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (user && sendMessage) {
      sendMessage("join", {
        userId: user._id,
        role: "user",
      });
    }
  }, [user, sendMessage]);

  // Basic UI states
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [activeInput, setActiveInput] = useState("pickup");
  const [isPanelMinimized, setIsPanelMinimized] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Fare check states (for active ride users)
  const [fareCheckPickup, setFareCheckPickup] = useState("");
  const [fareCheckDestination, setFareCheckDestination] = useState("");

  const [currentRide, setCurrentRide] = useState(null);
  const [isSubmittingRide, setIsSubmittingRide] = useState(false);

  // ✅ Add this state near other state declarations (around line 85)
  const [showOTP, setShowOTP] = useState(false);
  const [userOTP, setUserOTP] = useState(null);

  // Around line 90-100, ADD these state variables:

  // const [showLookingForDriver, setShowLookingForDriver] = useState(false);
  // const [showWaitingForDriver, setShowWaitingForDriver] = useState(false);

  // Custom hooks
  const {
    suggestions,
    isLoadingSuggestions,
    showSuggestions,
    fetchSuggestions,
    clearSuggestions,
    setShowSuggestions,
  } = useSuggestions();

  const {
    showRideOptions,
    selectedRide,
    isSearching,
    showConfirmRide,
    selectedVehicle,
    showLookingForDriver,
    showWaitingForDriver,
    selectedPaymentMethod,
    showRiding,
    hasActiveRide,
    fareCheckSelectedRide,
    rideTypes,
    fares,
    isLoadingFares,
    getFareForRide,
    submitHandler,
    confirmRide,
    handleVehicleSelect,
    handleCancelLooking,
    handleCancelWaiting,
    handleBackToLocations,
    handleBackToRides,
    handleConfirmPickup,
    handleGoHome,
    handleGoBackToRide,
    handleCancelRiding,
    setShowLookingForDriver,
    setShowWaitingForDriver,
    setShowConfirmRide,
  } = useRideManagement();

  // Add this right after the useRideManagement destructuring (around line 130):

  // ✅ DEBUG: Add this temporary debug panel
  console.log("🔍 DEBUG Panel States:", {
    showConfirmRide,
    showLookingForDriver,
    showWaitingForDriver,
    showRiding,
    selectedVehicle: selectedVehicle?.name,
    selectedPaymentMethod,
  });

  // Input change handler

  // Update the handleCreateRide function:
  const handleCreateRide = useCallback(
    async (rideData) => {
      if (!rideData.pickup || !rideData.dropoff) {
        toast.error("Please select pickup and destination");
        return;
      }

      setIsSubmittingRide(true);
      try {
        const token = localStorage.getItem("token") || user?.token;

        const res = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/rides/confirm`, // ✅ Fixed endpoint
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              pickup: rideData.pickup,
              dropoff: rideData.dropoff,
              vehicleType: rideData.vehicleType,
              paymentMethod: rideData.paymentMethod,
            }),
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to create ride");
        }

        console.log("✅ Ride confirmed:", data);

        setCurrentRide({
          ...data.ride,
          _id: data.ride._id, // ✅ Use the ride ID from confirmRide response
          otp: data.ride.otp, // ✅ Use the OTP from confirmRide response
        });

        if (data.ride?.otp) {
          setUserOTP(data.ride.otp);
          setShowOTP(true);
          console.log("✅ OTP set:", data.ride.otp);
        }

        setShowConfirmRide(false);
        setShowLookingForDriver(true);
        setShowWaitingForDriver(false);
        toast.success("Ride request sent to nearby drivers!", {
          duration: 3000,
        });
      } catch (error) {
        console.error("Create ride error:", error);
        toast.error(error.message || "Failed to create ride");
      } finally {
        setIsSubmittingRide(false);
      }
    },
    [user, setShowConfirmRide, setShowLookingForDriver, setShowWaitingForDriver] // ✅ Add handleConfirmPickup to dependencies
  );

  // Around line 247-290, REPLACE both socket listeners with this single one:

  useEffect(() => {
    const cleanup = onMessage("ride-accepted", (data) => {
      console.log("🎉 Captain accepted ride:", data);
      console.log("🔑 OTP from socket:", data.otp);

      // Update current ride with captain info
      setCurrentRide((prev) => ({
        ...prev,
        captain: data.captain,
        status: "accepted",
        estimatedArrival: data.estimatedArrival || "3 min",
      }));

      // Handle OTP
      if (data.otp) {
        setUserOTP(data.otp);
        setShowOTP(true);
        console.log("✅ OTP updated from socket:", data.otp);
      }

      // ✅ TRIGGER PANEL TRANSITIONS
      console.log("✅ Showing LookingForDriver panel");
      setShowLookingForDriver(true);
      setShowWaitingForDriver(false);

      // ✅ After 3 seconds, switch to WaitingForDriver
      setTimeout(() => {
        console.log("✅ Switched to WaitingForDriver panel");
        setShowLookingForDriver(false);
        setShowWaitingForDriver(true);
      }, 7000);

      // Show success message
      toast.success("Driver found! Your ride has been accepted.", {
        duration: 5000,
      });
    });

    return cleanup;
  }, [onMessage, setShowLookingForDriver, setShowWaitingForDriver]);

  // ✅ REMOVE the second useEffect with "ride-accepted-by-captain" entirely

  const handleInputChange = useCallback(
    (value, inputType) => {
      console.log("handleInputChange called:", { value, inputType });
      setActiveInput(inputType);

      if (hasActiveRide) {
        if (inputType === "pickup") {
          setFareCheckPickup(value);
        } else {
          setFareCheckDestination(value);
        }
      } else {
        if (inputType === "pickup") {
          setPickup(value);
        } else {
          setDestination(value);
        }
      }

      fetchSuggestions(value);
    },
    [hasActiveRide, fetchSuggestions]
  );

  // Suggestion selection handler
  const handleSuggestionSelect = useCallback(
    (suggestion) => {
      const selectedLocation = suggestion.description || suggestion.name;

      if (hasActiveRide) {
        if (activeInput === "pickup") {
          setFareCheckPickup(selectedLocation);
        } else {
          setFareCheckDestination(selectedLocation);
        }
      } else {
        if (activeInput === "pickup") {
          setPickup(selectedLocation);
        } else {
          setDestination(selectedLocation);
        }
      }

      clearSuggestions();
    },
    [activeInput, hasActiveRide, clearSuggestions]
  );

  // Panel management
  const handlePanelClose = useCallback(() => {
    setIsSidePanelOpen(false);
    clearSuggestions();
  }, [clearSuggestions]);

  const handleFocus = useCallback((inputType) => {
    setActiveInput(inputType);
    setIsSidePanelOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    (e) => {
      submitHandler(
        e,
        pickup,
        destination,
        fareCheckPickup,
        fareCheckDestination
      );
      setIsPanelMinimized(true);
    },
    [submitHandler, pickup, destination, fareCheckPickup, fareCheckDestination]
  );

  const handleBackToLocationForm = useCallback(() => {
    // Reset all ride-related states to go back to the form
    handleBackToLocations();
    setIsPanelMinimized(false);
  }, [handleBackToLocations]);

  const handleRideComplete = useCallback(() => {
    handleCancelRiding();
    handlePanelClose();
    setPickup("");
    setDestination("");
    setShowOTP(false);
    setUserOTP(null);
  }, [handleCancelRiding, handlePanelClose]);

  // Effects
  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 3000);
    return () => clearTimeout(loadingTimer);
  }, []);

  useEffect(() => {
    if (!isSidePanelOpen) {
      clearSuggestions();
    }
  }, [isSidePanelOpen, clearSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSuggestions && !event.target.closest(".suggestions-container")) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSuggestions, setShowSuggestions]);

  useEffect(() => {
    if (!onMessage) return;

    // listen for server push updates about an active ride (distance/duration/eta etc.)
    const cleanup = onMessage("ride-update", (data) => {
      // data may be { rideId, distance, duration, ... } or full ride
      const rideUpdate = data.ride || data;
      const rideId = data.rideId || rideUpdate._id || rideUpdate.id;

      setCurrentRide((prev) => {
        if (!prev) return prev;
        if (rideId && (prev._id === rideId || prev.id === rideId)) {
          return { ...prev, ...rideUpdate };
        }
        return prev;
      });
    });

    return cleanup;
  }, [onMessage, setCurrentRide]);

  // Loading screen
  if (isInitialLoading) {
    return <LoadingScreen />;
  }

  // Riding view
  if (showRiding) {
    return (
      <Riding
        selectedVehicle={selectedVehicle}
        pickup={pickup}
        destination={destination}
        selectedPayment={selectedPaymentMethod}
        onCancel={handleRideComplete}
        onHome={handleGoHome}
      />
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden fixed inset-0">
      {/* Header */}
      <AppHeader
        hasActiveRide={hasActiveRide}
        onMenuClick={() => setIsSidePanelOpen(true)}
        onGoBackToRide={handleGoBackToRide}
      />

      {/* ✅ Move OTP Display here with AnimatePresence */}
      <AnimatePresence>
        {showOTP && userOTP && (
          <OTPDisplay
            otp={userOTP}
            onClose={() => {
              setShowOTP(false);
              setUserOTP(null);
              console.log("🔒 OTP closed");
            }}
          />
        )}
      </AnimatePresence>

      {/* Map Section */}
      <motion.div
        className="absolute inset-0"
        animate={{
          x: isSidePanelOpen ? (window.innerWidth < 768 ? 0 : "-15rem") : 0,
        }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <div className="absolute inset-0 bg-black/20 z-10"></div>
        <video
          className="h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={mapVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </motion.div>

      {/* Backdrop */}
      <AnimatePresence>
        {isSidePanelOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handlePanelClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* ✅ ADD THIS SECTION - Ride Status Components (Outside Side Panel) */}
      <AnimatePresence mode="wait">
        {showLookingForDriver && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-60 bg-white"
          >
            <LookingForDriver
              selectedVehicle={selectedVehicle}
              pickup={pickup}
              destination={destination}
              fare={getFareForRide(selectedVehicle?.id)?.fare}
              selectedPayment={selectedPaymentMethod}
              onBack={() => setShowLookingForDriver(false)}
              onCancel={handleCancelLooking}
              driverFound={currentRide?.status === "accepted"}
              captainInfo={currentRide?.captain}
            />
          </motion.div>
        )}

        {showWaitingForDriver && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-60 bg-white"
          >
            <WaitingForDriver
              selectedVehicle={selectedVehicle}
              pickup={pickup}
              destination={destination}
              fare={getFareForRide(selectedVehicle?.id)?.fare}
              selectedPayment={selectedPaymentMethod}
              onBack={() => setShowWaitingForDriver(false)}
              onCancel={handleCancelWaiting}
              captainInfo={currentRide?.captain}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side/Bottom Panel */}
      <AnimatePresence mode="wait">
        {isSidePanelOpen && (
          <motion.div
            variants={panelVariants}
            initial={
              window.innerWidth < 768 ? "mobile.initial" : "desktop.initial"
            }
            animate={
              window.innerWidth < 768 ? "mobile.animate" : "desktop.animate"
            }
            exit={window.innerWidth < 768 ? "mobile.exit" : "desktop.exit"}
            className="fixed md:absolute md:right-0 md:top-0 bottom-0 h-[85vh] md:h-full w-full md:w-96 bg-white/95 backdrop-blur-sm z-50 shadow-xl rounded-t-3xl md:rounded-none"
          >
            <div className="p-6">
              {/* Active Ride Warning */}
              {hasActiveRide && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-blue-800 text-sm font-medium">
                      You can check fares but cannot book new rides during
                      active trip
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Main Panel Container */}
              <motion.div
                variants={headerVariants}
                animate={
                  showRideOptions && isPanelMinimized ? "minimized" : "expanded"
                }
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={`bg-white rounded-xl shadow-sm border ${
                  hasActiveRide ? "opacity-50" : ""
                }`}
              >
                {/* Panel Header */}
                <PanelHeader
                  showRideOptions={showRideOptions}
                  isPanelMinimized={isPanelMinimized}
                  hasActiveRide={hasActiveRide}
                  onClose={handlePanelClose}
                  onToggleMinimize={() =>
                    setIsPanelMinimized(!isPanelMinimized)
                  }
                />

                {/* Form Section */}
                <motion.div
                  variants={formVariants}
                  animate={isPanelMinimized ? "minimized" : "expanded"}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="px-4 pb-4">
                    <LocationInputForm
                      pickup={pickup}
                      destination={destination}
                      fareCheckPickup={fareCheckPickup}
                      fareCheckDestination={fareCheckDestination}
                      hasActiveRide={hasActiveRide}
                      activeInput={activeInput}
                      suggestions={suggestions}
                      showSuggestions={showSuggestions}
                      isSearching={isSearching}
                      onInputChange={handleInputChange}
                      onSuggestionSelect={handleSuggestionSelect}
                      onSubmit={handleFormSubmit}
                      onFocus={handleFocus}
                    />
                  </div>
                </motion.div>
              </motion.div>

              {/* Dynamic Content Area */}
              {showRideOptions ? (
                showConfirmRide ? (
                  <ConfirmRide
                    selectedVehicle={selectedVehicle}
                    pickup={pickup}
                    destination={destination}
                    fare={getFareForRide(selectedVehicle?.id)}
                    onBack={handleBackToRides}
                    onConfirm={handleCreateRide}
                    submitting={isSubmittingRide}
                    rideResult={currentRide}
                  />
                ) : (
                  <VehiclePanel
                    rideTypes={rideTypes}
                    selectedRide={selectedRide}
                    fareCheckSelectedRide={fareCheckSelectedRide}
                    hasActiveRide={hasActiveRide}
                    isPanelMinimized={isPanelMinimized}
                    fares={fares}
                    isLoadingFares={isLoadingFares}
                    getFareForRide={getFareForRide}
                    onVehicleSelect={handleVehicleSelect}
                    onBackToLocations={handleBackToLocationForm}
                    onConfirmPickup={handleConfirmPickup}
                  />
                )
              ) : (
                !isPanelMinimized && (
                  <LocationSearchPanel
                    setPickup={hasActiveRide ? setFareCheckPickup : setPickup}
                    setDestination={
                      hasActiveRide ? setFareCheckDestination : setDestination
                    }
                    pickup={hasActiveRide ? fareCheckPickup : pickup}
                    destination={
                      hasActiveRide ? fareCheckDestination : destination
                    }
                    activeInput={activeInput}
                    hasActiveRide={hasActiveRide}
                    suggestions={suggestions}
                    isLoadingSuggestions={isLoadingSuggestions}
                    showSuggestions={showSuggestions}
                    onSuggestionSelect={handleSuggestionSelect}
                    onInputChange={handleInputChange}
                  />
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Toaster position="top-center" />
    </div>
  );
}

export default Home;
