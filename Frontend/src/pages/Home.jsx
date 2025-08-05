import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

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

function Home() {
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
  } = useRideManagement();

  // Input change handler
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
                showWaitingForDriver ? (
                  <WaitingForDriver
                    selectedVehicle={selectedVehicle}
                    pickup={pickup}
                    destination={destination}
                    selectedPayment={selectedPaymentMethod}
                    onBack={() => setShowWaitingForDriver(false)}
                    onCancel={handleCancelWaiting}
                  />
                ) : showLookingForDriver ? (
                  <LookingForDriver
                    selectedVehicle={selectedVehicle}
                    pickup={pickup}
                    destination={destination}
                    selectedPayment={selectedPaymentMethod}
                    onBack={() => setShowLookingForDriver(false)}
                    onCancel={handleCancelLooking}
                  />
                ) : showConfirmRide ? (
                  <ConfirmRide
                    selectedVehicle={selectedVehicle}
                    pickup={pickup}
                    destination={destination}
                    onBack={handleBackToRides}
                    onConfirm={confirmRide}
                  />
                ) : (
                  <VehiclePanel
                    rideTypes={rideTypes}
                    selectedRide={selectedRide}
                    fareCheckSelectedRide={fareCheckSelectedRide}
                    hasActiveRide={hasActiveRide}
                    isPanelMinimized={isPanelMinimized}
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
