import React, { useState } from "react";
import {
  MapPinIcon,
  HomeIcon,
  BuildingOfficeIcon,
  ClockIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

function LocationSearchPanel({ 
  setPickup, 
  setDestination, 
  activeInput, 
  hasActiveRide,
  suggestions = [],
  isLoadingSuggestions = false,
  showSuggestions = false,
  onSuggestionSelect,
  onInputChange,
  pickup = "",
  destination = ""
}) {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  // Debug logging
  console.log('LocationSearchPanel props:', {
    suggestions: suggestions?.length || 0,
    isLoadingSuggestions,
    showSuggestions,
    activeInput
  });

  const locations = [
    {
      icon: <HomeIcon className="w-5 h-5" />,
      name: "Home",
      address: "Koregaon Park, Pune 411001",
    },
    {
      icon: <BuildingOfficeIcon className="w-5 h-5" />,
      name: "Work",
      address: "Electronic City Phase 1, Bangalore",
    },
    {
      icon: <ClockIcon className="w-5 h-5" />,
      name: "Pune International Airport",
      address: "Lohegaon, Pune, Maharashtra 411032",
    },
    {
      icon: <StarIcon className="w-5 h-5" />,
      name: "Favorite Place",
      address: "Phoenix Market City, Pune 411014",
    },
    {
      icon: <MapPinIcon className="w-5 h-5" />,
      name: "Other",
      address: "Fergusson College, Pune 411004",
    },
  ];

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    const fullLocation = location.name + ", " + location.address;
    
    if (activeInput === "destination") {
      setDestination(fullLocation);
    } else {
      setPickup(fullLocation);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
          onSuggestionSelect && onSuggestionSelect(suggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setSelectedSuggestionIndex(-1);
        // Clear suggestions by calling parent
        onInputChange && onInputChange('', activeInput);
        break;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-6 border-t pt-6 relative w-full"
    >
      <h3 className="text-sm font-medium text-gray-900 mb-4 text-left">
        {hasActiveRide ? "CHECK FARES FOR " : "SELECT "}
        {activeInput === "destination" ? "DESTINATION" : "PICKUP LOCATION"}
      </h3>
      
      {hasActiveRide && (
        <div className="mb-4 p-2 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-600">
            You can check fares for different locations but cannot book while in an active ride
          </p>
        </div>
      )}
      
      <div className="space-y-1 max-h-[300px] overflow-y-auto">
        <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
          Quick Selections
        </div>
        {locations.map((location, index) => (
          <div
            key={index}
            onClick={() => handleLocationSelect(location)}
            className={`flex items-start w-full p-2 hover:bg-gray-100 cursor-pointer border-2 transition-all duration-200
                ${
                  selectedLocation === index
                    ? "border-black rounded-xl"
                    : "border-transparent rounded-xl"
                }`}
          >
            <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100">
              {location.icon}
            </div>
            <div className="flex-1 ml-2 text-left">
              <div className="text-base font-semibold rounded-xl text-gray-900">
                {location.name}
              </div>
              <div className="text-sm rounded-xl text-gray-500">
                {location.address}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default LocationSearchPanel;
