// CaptainHome.jsx - Main dashboard for captain to manage rides and status
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import mapVideo from "../assets/maps.mp4";
import CaptainDetails from "../components/CaptainDetails";
import RidePopup from "../components/RidePopup";
import ConfirmRidePopup from "../components/ConfirmRidePopup";

const CaptainHome = () => {
  // UI State Management
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [mapZoom, setMapZoom] = useState(1);
  const [showRideRequest, setShowRideRequest] = useState(false);
  const [showConfirmRide, setShowConfirmRide] = useState(false);
  const [rideData, setRideData] = useState(null);
  
  // Video reference for zoom functionality
  const videoRef = useRef(null);

  // Captain online/offline status with localStorage persistence
  // This ensures status survives page refreshes
  const [isOnline, setIsOnline] = useState(() => {
    const saved = localStorage.getItem('captainOnlineStatus');
    return saved ? JSON.parse(saved) : true;
  });

  // Save captain status to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('captainOnlineStatus', JSON.stringify(isOnline));
  }, [isOnline]);

  // Hide any active ride popups when captain goes offline
  useEffect(() => {
    if (!isOnline) {
      setShowRideRequest(false);
      setShowConfirmRide(false);
    }
  }, [isOnline]);

  // Simulate ride requests only when captain is online
  useEffect(() => {
    if (!isOnline) return; // Don't show rides if offline
    
    const timer = setTimeout(() => {
      // Mock ride data - in production this comes from backend
      setRideData({
        id: "ride-" + Math.floor(Math.random() * 1000),
        user: {
          name: "Alex Thompson",
          rating: 4.8,
          photo: "https://randomuser.me/api/portraits/men/32.jpg",
        },
        amount: 32.75,
        distance: 8.4,
        duration: 22,
        pickup: {
          address: "789 Maple Street, Downtown",
          time: "4 min away",
        },
        destination: {
          address: "567 Oak Avenue, Westside",
          time: "22 min",
        },
      });
      setShowRideRequest(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [isOnline]);

  // Apply zoom effect to map video
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.style.transform = `scale(${mapZoom})`;
      videoRef.current.style.transition = "transform 0.3s ease";
    }
  }, [mapZoom]);

  // Event Handlers
  const handleLogout = () => {
    window.location.href = "/captain-login";
    console.log("Redirecting to captain login page...");
  };

  const toggleDetailsPanel = () => setDetailsExpanded(!detailsExpanded);
  const handleZoomIn = () => setMapZoom(prev => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setMapZoom(prev => Math.max(prev - 0.1, 1));

  // Ride Management Handlers
  const handleAcceptRide = (rideId) => {
    console.log(`Accepted ride: ${rideId}`);
    setShowRideRequest(false);
    setShowConfirmRide(true);
  };

  const handleIgnoreRide = (rideId) => {
    console.log(`Ignored ride: ${rideId}`);
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
    hidden: { y: "100%" }
  };

  const statusVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { delay: 0.5, type: "spring", stiffness: 300, damping: 20 }
    }
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
            src="https://w7.pngwing.com/pngs/801/240/png-transparent-uber-hd-logo.png"
            alt="Uber Logo"
            className="w-12 h-5 sm:w-15 sm:h-7"
          />
        </div>
        
        {/* Logout Button - Responsive sizing */}
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white p-2 sm:p-3 rounded-full transition-colors duration-200 shadow-lg"
          aria-label="Logout"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
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
            <RidePopup ride={rideData} onAccept={handleAcceptRide} onIgnore={handleIgnoreRide} />
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
            <ConfirmRidePopup ride={rideData} onConfirm={handleConfirmRide} onCancel={handleCancelRide} />
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
          className={`absolute bottom-[calc(25vh+20px)] left-1/2 transform -translate-x-1/2 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-full shadow-lg z-30 flex items-center text-sm sm:text-base ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}
          variants={statusVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)" }}
        >
          <motion.span
            className="inline-block w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full mr-2"
            animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="font-medium whitespace-nowrap">
            {isOnline ? "Active - Ready for Rides" : "Inactive - Can't take rides"}
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
            <svg className="w-4 h-4 sm:w-6 sm:h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
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
            <svg className="w-4 h-4 sm:w-6 sm:h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </motion.button>
          
          {/* Center Location Button */}
          <motion.button
            className="bg-white rounded-full p-2 sm:p-3 shadow-lg"
            whileHover={{ scale: 1.1, backgroundColor: "#f9fafb" }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="w-4 h-4 sm:w-6 sm:h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default CaptainHome;
