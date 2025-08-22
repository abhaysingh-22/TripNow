import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { useFareCalculation } from "./useFareCalculation";

export const useRideManagement = () => {
  // Ride-related states
  const [showRideOptions, setShowRideOptions] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showConfirmRide, setShowConfirmRide] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showLookingForDriver, setShowLookingForDriver] = useState(false);
  const [showWaitingForDriver, setShowWaitingForDriver] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [driverSearchTimeout, setDriverSearchTimeout] = useState(null);
  const [showRiding, setShowRiding] = useState(false);
  const [hasActiveRide, setHasActiveRide] = useState(false);
  const [fareCheckSelectedRide, setFareCheckSelectedRide] = useState(null);

  // Fare calculation hook
  const { fares, isLoadingFares, calculateFares, clearFares, getFareForRide } =
    useFareCalculation();

  // Ride types data
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

  // Submit handler for ride search
  const submitHandler = useCallback(
    (e, pickup, destination, fareCheckPickup, fareCheckDestination) => {
      e.preventDefault();

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

      setIsSearching(true);

      // Calculate fares for all vehicle types
      calculateFares(currentPickup, currentDestination, rideTypes)
        .then(() => {
          setTimeout(() => {
            setIsSearching(false);
            setShowRideOptions(true);
          }, 2000);
        })
        .catch(() => {
          setTimeout(() => {
            setIsSearching(false);
            setShowRideOptions(true);
          }, 2000);
        });
    },
    [hasActiveRide, calculateFares, rideTypes]
  );

  // Confirm ride booking
  const confirmRide = useCallback((paymentMethod) => {
    setSelectedPaymentMethod(paymentMethod);
    setShowLookingForDriver(true);
  }, []);

  //   const searchTimeout = setTimeout(() => {
  //     setShowLookingForDriver(false);
  //     setShowWaitingForDriver(true);
  //     toast.success("Driver found! Driver is on the way");

  //     setTimeout(() => {
  //       setShowWaitingForDriver(false);
  //       setShowRiding(true);
  //       toast.success("Trip started! Enjoy your ride");
  //     }, 5000);
  //   }, 3000);

  //   setDriverSearchTimeout(searchTimeout);
  // }, []);

  // Handle vehicle selection
  const handleVehicleSelect = useCallback(
    (ride) => {
      if (hasActiveRide) {
        setFareCheckSelectedRide(ride.id);
        toast.error(
          "You can view fares but cannot book while in an active ride"
        );
        return;
      }

      setSelectedRide(ride.id);
      setSelectedVehicle(ride);
      setShowConfirmRide(true);
    },
    [hasActiveRide]
  );

  // Cancel looking for driver
  const handleCancelLooking = useCallback(() => {
    if (driverSearchTimeout) {
      clearTimeout(driverSearchTimeout);
      setDriverSearchTimeout(null);
    }

    setShowLookingForDriver(false);
    setSelectedPaymentMethod(null);
    setShowConfirmRide(false);
    setSelectedVehicle(null);
    toast.success("Ride cancelled successfully");
  }, [driverSearchTimeout]);

  // Cancel waiting for driver
  const handleCancelWaiting = useCallback(() => {
    setShowWaitingForDriver(false);
    setSelectedPaymentMethod(null);
    setShowConfirmRide(false);
    setSelectedVehicle(null);
    toast.success("Ride cancelled successfully");
  }, []);

  // Navigation handlers
  const handleBackToLocations = useCallback(() => {
    setShowRideOptions(false);
    setSelectedRide(null);
    setFareCheckSelectedRide(null);
    clearFares();
  }, [clearFares]);

  const handleBackToRides = useCallback(() => {
    setShowConfirmRide(false);
    setSelectedVehicle(null);
  }, []);

  const handleConfirmPickup = useCallback(() => {
    const selected = rideTypes.find((r) => r.id === selectedRide);
    setSelectedVehicle(selected);
    setShowConfirmRide(true);
  }, [selectedRide]);

  // Ride management
  const handleGoHome = useCallback(() => {
    setShowRiding(false);
    setHasActiveRide(true);
  }, []);

  const handleGoBackToRide = useCallback(() => {
    setShowRiding(true);
  }, []);

  const handleCancelRiding = useCallback(() => {
    setShowRiding(false);
    setHasActiveRide(false);
    setSelectedPaymentMethod(null);
    setShowConfirmRide(false);
    setSelectedVehicle(null);
    setShowRideOptions(false);
    toast.success("Trip cancelled successfully");
  }, []);

  return {
    // States
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

    // Fare-related states and functions
    fares,
    isLoadingFares,
    getFareForRide,

    // Handlers
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

    // Setters (for external control)
    setShowRideOptions,
    setSelectedRide,
    setIsSearching,
    setShowConfirmRide,
    setSelectedVehicle,
    setShowLookingForDriver,
    setShowWaitingForDriver,
    setSelectedPaymentMethod,
    setShowRiding,
    setHasActiveRide,
    setFareCheckSelectedRide,
    setIsPanelMinimized: (value) => {}, // Placeholder for external panel control
  };
};
