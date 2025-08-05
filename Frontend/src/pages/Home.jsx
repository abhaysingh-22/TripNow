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
import axios from "axios";
import mapVideo from "../assets/maps.mp4";
import LocationSearchPanel from "../components/LocationSearchPanel";
import ConfirmRide from "../components/ConfirmRide";
import LookingForDriver from "../components/LookingForDriver";
import WaitingForDriver from "../components/WaitingForDriver";
import Riding from "./Riding";
import LoadingScreen from "../components/LoadingScreen";
import VehiclePanel from "../components/VehiclePanel";
import DebugSuggestions from "../components/DebugSuggestions";

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
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionInputValue, setSuggestionInputValue] = useState("");

  // API Configuration
  const API_BASE_URL = "http://localhost:3000/api";

  // Get token from localStorage, sessionStorage, or cookies
  const getAuthToken = () => {
    // Try localStorage first
    let token = localStorage.getItem("token");

    // Try sessionStorage if not in localStorage
    if (!token) {
      token = sessionStorage.getItem("token");
    }

    // Try cookies if not in storage
    if (!token) {
      const cookies = document.cookie.split(";");
      const tokenCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("token=")
      );
      if (tokenCookie) {
        token = tokenCookie.split("=")[1];
      }
    }

    // For debugging purposes - Add a test token if none found
    if (!token) {
      console.warn("No token found, using test token for debugging");
      // You should replace this with actual login functionality
      token = "test-token-for-debugging";
    }

    return token || "";
  };

  // Debounce function for API calls
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Fetch suggestions from backend
  const fetchSuggestions = async (input) => {
    console.log("fetchSuggestions called with input:", input);

    if (!input || input.trim().length < 2) {
      console.log("Input too short, clearing suggestions");
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    console.log("Starting to fetch suggestions...");

    try {
      const token = getAuthToken();
      console.log("Token found:", !!token);

      if (!token) {
        console.log("No token found");
        toast.error("Please login to search locations");
        setSuggestions([]);
        setShowSuggestions(false);
        setIsLoadingSuggestions(false);
        return;
      }

      console.log("Making API call to:", `${API_BASE_URL}/maps/suggestions`);
      const response = await axios.get(`${API_BASE_URL}/maps/suggestions`, {
        params: { input: input.trim() },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 10000, // 10 second timeout
      });

      console.log("API response status:", response.status);
      console.log("API response:", response.data);

      if (response.data && Array.isArray(response.data)) {
        console.log("Setting suggestions:", response.data.length, "items");
        setSuggestions(response.data);
        setShowSuggestions(response.data.length > 0);
      } else {
        console.log("Invalid response format:", response.data);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        code: error.code,
      });

      if (error.code === "ECONNABORTED") {
        toast.error("Request timeout. Please try again.");
      } else if (error.response?.status === 401) {
        toast.error("Please login to search locations");
      } else if (error.response?.status === 429) {
        toast.error("Too many requests. Please wait a moment.");
      } else if (error.response?.status >= 500) {
        toast.error("Server error. Please try again later.");
      } else if (!navigator.onLine) {
        toast.error("Please check your internet connection");
      } else {
        toast.error(`Failed to fetch location suggestions: ${error.message}`);
      }

      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Debounced version of fetchSuggestions
  const debouncedFetchSuggestions = debounce(fetchSuggestions, 300);

  // Handle input change for pickup/destination fields
  const handleInputChange = (value, inputType) => {
    console.log("handleInputChange called:", { value, inputType });
    setSuggestionInputValue(value);
    setActiveInput(inputType);

    if (inputType === "pickup") {
      setPickup(value);
    } else {
      setDestination(value);
    }

    // Fetch suggestions with debouncing
    debouncedFetchSuggestions(value);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    const selectedLocation = suggestion.description || suggestion.name;

    if (activeInput === "pickup") {
      setPickup(selectedLocation);
    } else {
      setDestination(selectedLocation);
    }

    // Clear suggestions
    setSuggestions([]);
    setShowSuggestions(false);
    setSuggestionInputValue("");
  };

  // Handle panel close with cleanup
  const handlePanelClose = () => {
    setIsSidePanelOpen(false);
    setSuggestions([]);
    setShowSuggestions(false);
    setSuggestionInputValue("");
  };

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
    handlePanelClose();
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

  // Clear suggestions when panel is closed
  useEffect(() => {
    if (!isSidePanelOpen) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSuggestionInputValue("");
    }
  }, [isSidePanelOpen]);

  // Handle clicking outside suggestions to close them
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showSuggestions && !event.target.closest(".suggestions-container")) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSuggestions]);

  if (isInitialLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="h-screen w-full overflow-hidden fixed inset-0">
      {/* Debug Component - Remove in production */}
      <DebugSuggestions />

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
                onClick={() => handlePanelClose()}
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
                          onClick={() => handlePanelClose()}
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
                            className="relative suggestions-container"
                            whileFocus={{ scale: 1.02 }}
                          >
                            <MapPinIcon className="absolute left-3 top-3 w-5 h-5 text-blue-500" />
                            <input
                              type="text"
                              placeholder="Pickup Location"
                              value={hasActiveRide ? fareCheckPickup : pickup}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (hasActiveRide) {
                                  setFareCheckPickup(value);
                                } else {
                                  handleInputChange(value, "pickup");
                                }
                              }}
                              onFocus={() => {
                                setActiveInput("pickup");
                                setIsSidePanelOpen(true);
                              }}
                              className="pl-10 pr-4 py-3 w-full border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                            
                            {/* Suggestions for pickup input */}
                            {activeInput === "pickup" && showSuggestions && suggestions.length > 0 && (
                              <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto z-[1000]">
                                {suggestions.slice(0, 5).map((suggestion, index) => (
                                  <div
                                    key={suggestion.place_id || index}
                                    onClick={() => handleSuggestionSelect(suggestion)}
                                    className="flex items-start p-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-150"
                                  >
                                    <MapPinIcon className="w-4 h-4 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-medium text-gray-900 truncate">
                                        {suggestion.structured_formatting?.main_text || 
                                         suggestion.description?.split(',')[0] || 
                                         'Unknown Location'}
                                      </div>
                                      <div className="text-xs text-gray-500 truncate">
                                        {suggestion.structured_formatting?.secondary_text || 
                                         suggestion.description || 
                                         'No address available'}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </motion.div>

                          <motion.div className="relative suggestions-container">
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
                                const value = e.target.value;
                                if (hasActiveRide) {
                                  setFareCheckDestination(value);
                                } else {
                                  handleInputChange(value, "destination");
                                }
                              }}
                              onFocus={() => {
                                setActiveInput("destination");
                                setIsSidePanelOpen(true);
                              }}
                              className="pl-10 pr-4 py-3 w-full border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                            
                            {/* Suggestions for destination input */}
                            {activeInput === "destination" && showSuggestions && suggestions.length > 0 && (
                              <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto z-[1000]">
                                {suggestions.slice(0, 5).map((suggestion, index) => (
                                  <div
                                    key={suggestion.place_id || index}
                                    onClick={() => handleSuggestionSelect(suggestion)}
                                    className="flex items-start p-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-150"
                                  >
                                    <MapPinIcon className="w-4 h-4 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-medium text-gray-900 truncate">
                                        {suggestion.structured_formatting?.main_text || 
                                         suggestion.description?.split(',')[0] || 
                                         'Unknown Location'}
                                      </div>
                                      <div className="text-xs text-gray-500 truncate">
                                        {suggestion.structured_formatting?.secondary_text || 
                                         suggestion.description || 
                                         'No address available'}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
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
        </>
      )}
      <Toaster position="top-center" />
    </div>
  );
}

export default Home;
