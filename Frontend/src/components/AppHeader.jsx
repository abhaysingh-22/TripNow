import React from "react";
import { motion } from "framer-motion";
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";
import TripNowBlack from "../assets/TripNowBlack.png";

const AppHeader = ({ hasActiveRide, onMenuClick, onGoBackToRide }) => {
  const handleMenuClick = () => {
    if (hasActiveRide) {
      toast.error("Complete your current ride to plan a new one");
      return;
    }
    onMenuClick();
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="flex justify-between items-center p-4">
        {/* Logo */}
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
              src={TripNowBlack}
              alt="TripNow Logo"
              className="w-8 h-8 object-contain"
            />
          </motion.div>
        </motion.div>

        {/* Right Side Buttons */}
        <div className="flex items-center space-x-3">
          {/* Current Ride Button */}
          {hasActiveRide && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onGoBackToRide}
              className="bg-green-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2"
            >
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold">Current Ride</span>
            </motion.button>
          )}

          {/* Menu Button */}
          <motion.button
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMenuClick}
            className="bg-white p-3 rounded-full shadow-lg mr-2"
          >
            <EllipsisVerticalIcon className="w-6 h-6" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default AppHeader;
