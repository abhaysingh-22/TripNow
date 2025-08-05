import React from "react";
import { motion } from "framer-motion";
import { XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/solid";

const PanelHeader = ({
  showRideOptions,
  isPanelMinimized,
  hasActiveRide,
  onClose,
  onToggleMinimize,
}) => {
  return (
    <div className="flex justify-between items-center p-4">
      <h2 className={`font-bold ${isPanelMinimized ? "text-lg" : "text-2xl"}`}>
        Plan your ride
      </h2>

      <div className="flex items-center space-x-2">
        {/* Minimize/Expand Button */}
        {showRideOptions && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onToggleMinimize}
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

        {/* Close Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="p-2"
        >
          <XMarkIcon className="w-6 h-6" />
        </motion.button>
      </div>
    </div>
  );
};

export default PanelHeader;
