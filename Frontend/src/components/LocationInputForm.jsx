import React from "react";
import { motion } from "framer-motion";
import { MapPinIcon, ArrowRightIcon } from "@heroicons/react/24/solid";

const LocationInputForm = ({
  pickup,
  destination,
  fareCheckPickup,
  fareCheckDestination,
  hasActiveRide,
  activeInput,
  suggestions,
  showSuggestions,
  isSearching,
  onInputChange,
  onSuggestionSelect,
  onSubmit,
  onFocus,
}) => {
  const getCurrentPickup = () => (hasActiveRide ? fareCheckPickup : pickup);
  const getCurrentDestination = () =>
    hasActiveRide ? fareCheckDestination : destination;

  const renderSuggestions = (inputType) => {
    if (
      activeInput === inputType &&
      showSuggestions &&
      suggestions.length > 0
    ) {
      return (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto z-[1000]">
          {suggestions.slice(0, 5).map((suggestion, index) => (
            <div
              key={suggestion.place_id || index}
              onClick={() => onSuggestionSelect(suggestion)}
              className="flex items-start p-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-150"
            >
              <MapPinIcon className="w-4 h-4 text-gray-400 mt-1 mr-3 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {suggestion.structured_formatting?.main_text ||
                    suggestion.description?.split(",")[0] ||
                    "Unknown Location"}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {suggestion.structured_formatting?.secondary_text ||
                    suggestion.description ||
                    "No address available"}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Pickup Input */}
      <motion.div
        className="relative suggestions-container"
        whileFocus={{ scale: 1.02 }}
      >
        <MapPinIcon className="absolute left-3 top-3 w-5 h-5 text-blue-500" />
        <input
          type="text"
          placeholder="Pickup Location"
          value={getCurrentPickup()}
          onChange={(e) => onInputChange(e.target.value, "pickup")}
          onFocus={() => onFocus("pickup")}
          className="pl-10 pr-4 py-3 w-full border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
        {renderSuggestions("pickup")}
      </motion.div>

      {/* Destination Input */}
      <motion.div className="relative suggestions-container">
        <ArrowRightIcon className="absolute left-3 top-3 w-5 h-5 text-blue-500" />
        <input
          type="text"
          placeholder="Destination"
          value={getCurrentDestination()}
          onChange={(e) => onInputChange(e.target.value, "destination")}
          onFocus={() => onFocus("destination")}
          className="pl-10 pr-4 py-3 w-full border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
        {renderSuggestions("destination")}
      </motion.div>

      {/* Submit Button */}
      <motion.button
        whileHover={hasActiveRide ? {} : { scale: 1.02 }}
        whileTap={hasActiveRide ? {} : { scale: 0.98 }}
        type="submit"
        disabled={isSearching || hasActiveRide}
        className={`w-full py-3 rounded-xl font-semibold transition-all relative ${
          hasActiveRide
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-black text-white hover:bg-gray-800"
        } ${isSearching ? "opacity-50" : ""}`}
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
  );
};

export default LocationInputForm;
