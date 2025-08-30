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
import PaymentGateway from "../components/PaymentGateway";
import LiveTracking from "../components/LiveTracking";

// Custom Hooks
import { useSuggestions } from "../hooks/useSuggestions";
import { useRideManagement } from "../hooks/useRideManagement";

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

// OTP Display Component
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

  // OTP and Payment states
  const [showOTP, setShowOTP] = useState(false);
  const [userOTP, setUserOTP] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [pendingRideData, setPendingRideData] = useState(null);

  // Live tracking states
  const [captainLocation, setCaptainLocation] = useState(null);

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
    setShowRiding,
    setShowRideOptions,
    setHasActiveRide,
  } = useRideManagement();

  // Listen for captain location updates
  useEffect(() => {
    if (!onMessage) return;

    const cleanup = onMessage("captain-location-update", (data) => {
      console.log("📍 Captain location update:", data);
      setCaptainLocation({
        lat: data.latitude,
        lng: data.longitude,
      });
    });

    return cleanup;
  }, [onMessage]);

  // Handle user location updates
  const handleUserLocationUpdate = (location) => {
    if (sendMessage && hasActiveRide && currentRide?._id) {
      sendMessage("user-location-update", {
        rideId: currentRide._id,
        latitude: location.lat,
        longitude: location.lng,
      });
    }
  };

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
          `${import.meta.env.VITE_BASE_URL}/api/rides/confirm`,
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
          _id: data.ride._id,
          otp: data.ride.otp,
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
    [user, setShowConfirmRide, setShowLookingForDriver, setShowWaitingForDriver]
  );

  // Socket listener for ride acceptance
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
      if (data.ride?.otp) {
        console.log("✅ OTP updated from socket:", data.ride.otp);
      }

      // Trigger panel transitions
      console.log("✅ Showing LookingForDriver panel");
      setShowLookingForDriver(true);
      setShowWaitingForDriver(false);

      // After 3 seconds, switch to WaitingForDriver
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

  // Ride completion listener
  useEffect(() => {
    if (!onMessage) return;

    console.log("🔌 Setting up ride-completed listener");

    const cleanup = onMessage("ride-completed", (data) => {
      console.log("🏁 RIDE COMPLETED EVENT RECEIVED:");
      console.log("📋 Full data:", JSON.stringify(data, null, 2));
      console.log("💳 Payment method:", data.paymentMethod);
      console.log("💰 Amount:", data.amount);
      console.log("🆔 Ride ID:", data.rideId);

      // Check if payment is required (UPI method)
      if (data.paymentMethod === "upi") {
        console.log("🚀 UPI PAYMENT REQUIRED - SHOWING PAYMENT GATEWAY");

        const paymentRideData = {
          _id: data.rideId,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          destination: currentRide?.destination || { address: "Destination" },
          user: currentRide?.user || { name: "User" },
        };

        console.log("📦 Setting pendingRideData:", paymentRideData);
        setPendingRideData(paymentRideData);
        setShowPayment(true);

        console.log("✅ Payment gateway should now be visible");
      } else {
        // Cash payment - direct completion
        console.log("💵 CASH PAYMENT - DIRECT COMPLETION");
        completeRideFlow();
      }
    });

    return cleanup;
  }, [onMessage, currentRide]);

  const completeRideFlow = () => {
    console.log("🏠 Completing ride flow - resetting all states");
    setShowRiding(false);
    setHasActiveRide(false);
    setShowConfirmRide(false);
    setShowRideOptions(false);
    setShowLookingForDriver(false);
    setShowWaitingForDriver(false);
    setIsSidePanelOpen(false);
    setIsPanelMinimized(false);
    setCurrentRide(null);
    setPickup("");
    setDestination("");
    setUserOTP(null);
    setShowOTP(false);
    setShowPayment(false);
    setPendingRideData(null);
    setCaptainLocation(null);
    toast.success("Ride completed successfully!");
  };

  // Payment handler functions
  const handlePaymentSuccess = (paymentData) => {
    console.log("✅ Payment successful:", paymentData);
    completeRideFlow();
  };

  const handlePaymentCancel = () => {
    console.log("❌ Payment cancelled");
    setShowPayment(false);
    setPendingRideData(null);
    toast.error("Payment cancelled");
  };

  useEffect(() => {
    if (!onMessage) return;

    // listen for server push updates about an active ride
    const cleanup = onMessage("ride-update", (data) => {
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

      {/* OTP Display
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
      </AnimatePresence> */}

      {/* Live Tracking Map */}
      <div className="absolute inset-0 z-0">
        <LiveTracking
          pickup={
            currentRide?.pickup
              ? {
                  lat: currentRide.pickup.latitude || 0,
                  lng: currentRide.pickup.longitude || 0,
                }
              : null
          }
          destination={
            currentRide?.destination
              ? {
                  lat: currentRide.destination.latitude || 0,
                  lng: currentRide.destination.longitude || 0,
                }
              : null
          }
          captainLocation={captainLocation}
          rideStatus={
            showRiding
              ? "in-progress"
              : showWaitingForDriver
              ? "accepted"
              : showLookingForDriver
              ? "waiting"
              : "default"
          }
          estimatedArrival={showWaitingForDriver ? "5 min" : undefined}
          onLocationUpdate={handleUserLocationUpdate}
        />
      </div>

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

      {/* Ride Status Components */}
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
              otp={currentRide?.otp}
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

      {/* Payment Gateway */}
      {showPayment && pendingRideData && (
        <div>
          {console.log("🎨 RENDERING PAYMENT GATEWAY")}
          <PaymentGateway
            rideData={pendingRideData}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentCancel={handlePaymentCancel}
          />
        </div>
      )}

      <Toaster position="top-center" />
    </div>
  );
}

export default Home;
