import React, { useState } from "react";
import {
  MapPinIcon,
  HomeIcon,
  BuildingOfficeIcon,
  ClockIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

function LocationSearchPanel({ setPickup, setDestination, activeInput, hasActiveRide }) {
  const [selectedLocation, setSelectedLocation] = useState(null);

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-6 border-t pt-6"
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
