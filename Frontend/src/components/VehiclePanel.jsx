import React from 'react'
import { motion } from 'framer-motion'
import { ArrowLeftIcon } from '@heroicons/react/24/solid'
import { UserIcon } from '@heroicons/react/24/outline'

function VehiclePanel({ 
  rideTypes, 
  selectedRide, 
  fareCheckSelectedRide, 
  hasActiveRide, 
  isPanelMinimized, 
  onVehicleSelect, 
  onBackToLocations,
  onConfirmPickup 
}) {
  return (
    <div
      className="mt-6 border-t pt-6 flex flex-col"
      style={{ 
        height: isPanelMinimized 
          ? "calc(100vh - 200px)" 
          : "calc(100vh - 400px)" 
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onBackToLocations}
            className="p-2 hover:bg-gray-100 rounded-full mr-2"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </motion.button>
          <h3 className="text-lg font-semibold">
            {hasActiveRide ? "Check Fares" : "Choose a Ride"}
          </h3>
        </div>
      </div>
      
      <div className={`flex-1 ${isPanelMinimized ? '' : 'overflow-y-auto'}`}>
        <div className={`space-y-4 ${isPanelMinimized ? 'pb-8' : 'pb-16'}`}>
          {rideTypes.map((ride) => (
            <motion.div
              key={ride.id}
              onClick={() => onVehicleSelect(ride)}
              className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                (hasActiveRide ? fareCheckSelectedRide : selectedRide) === ride.id
                  ? hasActiveRide 
                    ? "bg-blue-50 border-2 border-blue-200" 
                    : "bg-gray-100 border-3 border-black"
                  : "border-2 border-gray-200 hover:bg-gray-50"
              } ${hasActiveRide ? 'relative' : ''}`}
            >
              {hasActiveRide && (
                <div className="absolute top-2 right-2">
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                    View Only
                  </span>
                </div>
              )}
              
              <img
                src={ride.image}
                alt={ride.name}
                className="w-20 h-12 object-contain"
              />
              <div className="flex-1 ml-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{ride.name}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <UserIcon className="w-4 h-4 mr-1" />
                      <span>{ride.persons}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{ride.price}</p>
                    <p className="text-sm text-gray-500">{ride.time}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {selectedRide && !hasActiveRide && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onConfirmPickup}
          className="w-full py-3 bg-black text-white rounded-xl font-semibold mt-4 sticky bottom-0"
        >
          Confirm Pickup
        </motion.button>
      )}

      {(selectedRide || fareCheckSelectedRide) && hasActiveRide && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full py-3 bg-blue-100 text-blue-700 rounded-xl font-semibold mt-4 sticky bottom-0 text-center"
        >
          Cannot book during active ride
        </motion.div>
      )}
    </div>
  )
}

export default VehiclePanel