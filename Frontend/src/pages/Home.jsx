import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPinIcon,
  ArrowRightIcon,
  XMarkIcon,
  EllipsisVerticalIcon,
  ArrowLeftIcon, // Add this import
  ChevronDownIcon,
} from "@heroicons/react/24/solid";
import { CurrencyRupeeIcon, UserIcon } from "@heroicons/react/24/outline";
import toast, { Toaster } from "react-hot-toast";
import mapVideo from "../assets/maps.mp4";
import LocationSearchPanel from "../components/LocationSearchPanel";
import ConfirmRide from "../components/ConfirmRide";
import LookingForDriver from "../components/LookingForDriver";
import WaitingForDriver from "../components/WaitingForDriver";
import Riding from "./Riding";
import LoadingScreen from "../components/LoadingScreen";
import VehiclePanel from "../components/VehiclePanel";

function Home() {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [showRideOptions, setShowRideOptions] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [activeInput, setActiveInput] = useState("pickup"); // Add this state
  const [showConfirmRide, setShowConfirmRide] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isPanelMinimized, setIsPanelMinimized] = useState(false);
  const [showLookingForDriver, setShowLookingForDriver] = useState(false);
  const [showWaitingForDriver, setShowWaitingForDriver] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [driverSearchTimeout, setDriverSearchTimeout] = useState(null);
  const [showRiding, setShowRiding] = useState(false);
  const [hasActiveRide, setHasActiveRide] = useState(false); // Track active ride
  const [fareCheckPickup, setFareCheckPickup] = useState("");
  const [fareCheckDestination, setFareCheckDestination] = useState("");
  const [fareCheckSelectedRide, setFareCheckSelectedRide] = useState(null); // New state for fare checking vehicle selection
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const panelVariants = {
    mobile: {
      initial: { y: "100%", opacity: 0 },
      animate: {
        y: 0,
        opacity: 1,
        transition: {
          type: "tween",
          ease: "easeInOut",
          duration: 0.4,
        },
      },
      exit: {
        y: "100%",
        opacity: 0,
        transition: {
          type: "tween",
          ease: "easeInOut",
          duration: 0.4,
        },
      },
    },
    desktop: {
      initial: { x: "100%", opacity: 0 },
      animate: {
        x: 0,
        opacity: 1,
        transition: {
          type: "tween",
          ease: "easeInOut",
          duration: 0.4,
        },
      },
      exit: {
        x: "100%",
        opacity: 0,
        transition: {
          type: "tween",
          ease: "easeInOut",
          duration: 0.4,
        },
      },
    },
  };

  const rideTypes = [
    {
      id: 1,
      name: "UberGo",
      image: "https://www.pngplay.com/wp-content/uploads/8/Uber-PNG-Photos.png",
      price: "₹299",
      time: "2 min away",
      persons: "4",
    },
    {
      id: 2,
      name: "Auto",
      image:
        "https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1648431773/assets/1d/db8c56-0204-4ce4-81ce-56a11a07fe98/original/Uber_Auto_558x372_pixels_Desktop.png",
      price: "₹149",
      time: "1 min away",
      persons: "3",
    },
    {
      id: 3,
      name: "Bike",
      image:
        "https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1649231091/assets/2c/7fa194-c954-49b2-9c6d-a3b8601370f5/original/Uber_Moto_Orange_312x208_pixels_Mobile.png",
      price: "₹99",
      time: "1 min away",
      persons: "1",
    },
    {
      id: 4,
      name: "Premier",
      image:
        "https://www.uber-assets.com/image/upload/f_auto,q_auto:eco,c_fill,h_368,w_552/v1688558287/assets/b9/29074f-ab5d-4459-84d4-953d75430d2a/original/UberXL.png",
      price: "₹399",
      time: "5 min away",
      persons: "4",
    },
  ];

  const headerVariants = {
    expanded: {
      scale: 1,
      opacity: 1,
      marginBottom: "2rem",
    },
    minimized: {
      scale: 0.9,
      opacity: 0.8,
      marginBottom: "0.5rem",
    },
  };

  const formVariants = {
    expanded: {
      height: "auto",
      opacity: 1,
      marginTop: "1rem",
    },
    minimized: {
      height: 0,
      opacity: 0,
      marginTop: 0,
      overflow: "hidden",
    },
  };

  const submitHandler = (e) => {
    e.preventDefault();

    // Check if user has an active ride
    if (hasActiveRide) {
      toast.error("Unable to book ride because you're already in a ride");
      return;
    }

    const currentPickup = hasActiveRide ? fareCheckPickup : pickup;
    const currentDestination = hasActiveRide
      ? fareCheckDestination
      : destination;

    if (!currentPickup.trim() || !currentDestination.trim()) {
      toast.error("Please enter both pickup and destination locations");
      return;
    }
    setIsPanelMinimized(true);
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setShowRideOptions(true);
    }, 2000);
  };

  const confirmRide = (paymentMethod) => {
    setSelectedPaymentMethod(paymentMethod);
    setShowLookingForDriver(true);

    // Store timeout reference to be able to cancel it
    const searchTimeout = setTimeout(() => {
      setShowLookingForDriver(false);
      setShowWaitingForDriver(true);
      toast.success("Driver found! Driver is on the way");

      // Start ride after additional delay
      setTimeout(() => {
        setShowWaitingForDriver(false);
        setShowRiding(true);
        toast.success("Trip started! Enjoy your ride");
      }, 5000);
    }, 3000);

    setDriverSearchTimeout(searchTimeout);
  };

  const handleCancelLooking = () => {
    // Clear the timeout to prevent ride confirmation
    if (driverSearchTimeout) {
      clearTimeout(driverSearchTimeout);
      setDriverSearchTimeout(null);
    }

    // Reset all states
    setShowLookingForDriver(false);
    setSelectedPaymentMethod(null);
    setShowConfirmRide(false);
    setSelectedVehicle(null);
    setIsLoading(false);

    toast.success("Ride cancelled successfully");
  };

  const handleCancelWaiting = () => {
    setShowWaitingForDriver(false);
    setSelectedPaymentMethod(null);
    setShowConfirmRide(false);
    setSelectedVehicle(null);
    toast.success("Ride cancelled successfully");
  };

  const handleBackToLocations = () => {
    setShowRideOptions(false);
    setSelectedRide(null);
    setFareCheckSelectedRide(null); // Clear fare check selection
    setIsPanelMinimized(false);
  };

  const handleVehicleSelect = (ride) => {
    // Check if user has an active ride
    if (hasActiveRide) {
      // Allow viewing fare but don't update actual ride data
      setFareCheckSelectedRide(ride.id);
      toast.error("You can view fares but cannot book while in an active ride");
      return;
    }

    setSelectedRide(ride.id);
    setSelectedVehicle(ride);
    setShowConfirmRide(true);
  };

  const handleBackToRides = () => {
    setShowConfirmRide(false);
    setSelectedVehicle(null);
  };

  const handleGoHome = () => {
    setShowRiding(false);
    setHasActiveRide(true); // Keep track that user has an active ride
  };

  const handleGoBackToRide = () => {
    setShowRiding(true);
  };

  const handleCancelRiding = () => {
    setShowRiding(false);
    setHasActiveRide(false); // Clear active ride
    setSelectedPaymentMethod(null);
    setShowConfirmRide(false);
    setSelectedVehicle(null);
    setIsSidePanelOpen(false);
    setShowRideOptions(false);
    setPickup("");
    setDestination("");
    toast.success("Trip cancelled successfully");
  };

  const handleConfirmPickup = () => {
    const selected = rideTypes.find((r) => r.id === selectedRide);
    setSelectedVehicle(selected);
    setShowConfirmRide(true);
  };

  // Simulate initial loading
  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 3000); // 3 seconds loading time

    return () => clearTimeout(loadingTimer);
  }, []);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (driverSearchTimeout) {
        clearTimeout(driverSearchTimeout);
      }
    };
  }, [driverSearchTimeout]);

  if (isInitialLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="h-screen w-full overflow-hidden fixed inset-0">
      {showRiding ? (
        <Riding
          selectedVehicle={selectedVehicle}
          pickup={pickup}
          destination={destination}
          selectedPayment={selectedPaymentMethod}
          onCancel={handleCancelRiding}
          onHome={handleGoHome}
        />
      ) : (
        <>
          {/* Logo and Menu Section */}
          <div className="fixed top-0 left-0 right-0 z-50">
            <div className="flex justify-between items-center p-4">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="ml-2"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white p-3 rounded-full shadow-lg cursor-pointer"
                >
                  <img
                    src="https://w7.pngwing.com/pngs/801/240/png-transparent-uber-hd-logo.png"
                    alt="Uber"
                    className="w-8 h-8 object-contain"
                  />
                </motion.div>
              </motion.div>

              <div className="flex items-center space-x-3">
                {hasActiveRide && (
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleGoBackToRide}
                    className="bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2"
                  >
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold">Current Ride</span>
                  </motion.button>
                )}

                <motion.button
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (hasActiveRide) {
                      toast.error(
                        "Complete your current ride to plan a new one"
                      );
                      return;
                    }
                    setIsSidePanelOpen(true);
                  }}
                  className="bg-white p-3 rounded-full shadow-lg mr-2"
                >
                  <EllipsisVerticalIcon className="w-6 h-6" />
                </motion.button>
              </div>
            </div>
          </div>

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
                onClick={() => setIsSidePanelOpen(false)}
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

                  <motion.div
                    variants={headerVariants}
                    animate={
                      showRideOptions && isPanelMinimized
                        ? "minimized"
                        : "expanded"
                    }
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className={`bg-white rounded-xl shadow-sm border ${
                      hasActiveRide ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex justify-between items-center p-4">
                      <h2
                        className={`font-bold ${
                          isPanelMinimized ? "text-lg" : "text-2xl"
                        }`}
                      >
                        Plan your ride
                      </h2>
                      <div className="flex items-center space-x-2">
                        {showRideOptions && (
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              setIsPanelMinimized(!isPanelMinimized)
                            }
                            className="p-2 hover:bg-gray-100 rounded-full"
                          >
                            <motion.div
                              animate={{ rotate: isPanelMinimized ? 0 : 180 }}
                              transition={{ duration: 0.3 }}
                            >
                              <ChevronDownIcon className="w-5 h-5" />
                            </motion.div>
                          </motion.button>
                        )}
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsSidePanelOpen(false)}
                          className="p-2"
                        >
                          <XMarkIcon className="w-6 h-6" />
                        </motion.button>
                      </div>
                    </div>

                    <motion.div
                      variants={formVariants}
                      animate={isPanelMinimized ? "minimized" : "expanded"}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-4 pb-4">
                        <form onSubmit={submitHandler} className="space-y-4">
                          <motion.div
                            className="relative"
                            whileFocus={{ scale: 1.02 }}
                          >
                            <MapPinIcon className="absolute left-3 top-3 w-5 h-5 text-blue-500" />
                            <input
                              type="text"
                              placeholder="Pickup Location"
                              value={hasActiveRide ? fareCheckPickup : pickup}
                              onChange={(e) => {
                                if (hasActiveRide) {
                                  setFareCheckPickup(e.target.value);
                                } else {
                                  setPickup(e.target.value);
                                }
                              }}
                              onFocus={() => setActiveInput("pickup")}
                              className="pl-10 pr-4 py-3 w-full border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                          </motion.div>

                          <motion.div className="relative">
                            <ArrowRightIcon className="absolute left-3 top-3 w-5 h-5 text-blue-500" />
                            <input
                              type="text"
                              placeholder="Destination"
                              value={
                                hasActiveRide
                                  ? fareCheckDestination
                                  : destination
                              }
                              onChange={(e) => {
                                if (hasActiveRide) {
                                  setFareCheckDestination(e.target.value);
                                } else {
                                  setDestination(e.target.value);
                                }
                              }}
                              onFocus={() => setActiveInput("destination")}
                              className="pl-10 pr-4 py-3 w-full border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                          </motion.div>

                          <motion.button
                            whileHover={hasActiveRide ? {} : { scale: 1.02 }}
                            whileTap={hasActiveRide ? {} : { scale: 0.98 }}
                            type="submit"
                            disabled={isLoading || isSearching || hasActiveRide}
                            className={`w-full py-3 rounded-xl font-semibold transition-all relative ${
                              hasActiveRide
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-black text-white hover:bg-gray-800"
                            } ${isLoading || isSearching ? "opacity-50" : ""}`}
                          >
                            {hasActiveRide ? (
                              "Complete current ride first"
                            ) : isSearching ? (
                              <div className="flex items-center justify-center">
                                <svg
                                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Searching...
                              </div>
                            ) : (
                              "Search Nearby Taxis"
                            )}
                          </motion.button>
                        </form>
                      </div>
                    </motion.div>
                  </motion.div>

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
                        onBackToLocations={handleBackToLocations}
                        onConfirmPickup={handleConfirmPickup}
                      />
                    )
                  ) : (
                    !isPanelMinimized && (
                      <LocationSearchPanel
                        setPickup={
                          hasActiveRide ? setFareCheckPickup : setPickup
                        }
                        setDestination={
                          hasActiveRide
                            ? setFareCheckDestination
                            : setDestination
                        }
                        activeInput={activeInput}
                        hasActiveRide={hasActiveRide}
                      />
                    )
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
      <Toaster position="top-center" />
    </div>
  );
}

export default Home;
