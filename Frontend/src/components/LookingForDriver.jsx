import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  CreditCardIcon,
  CurrencyRupeeIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/solid'

function LookingForDriver({ 
  selectedVehicle, 
  pickup, 
  destination, 
  selectedPayment, 
  onBack, 
  onCancel 
}) {
  const [dots, setDots] = useState('.');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '.' : prev + '.');
    }, 500);

    const progressInterval = setInterval(() => {
      setProgress(prev => prev >= 100 ? 0 : prev + 2);
    }, 100);

    return () => {
      clearInterval(dotsInterval);
      clearInterval(progressInterval);
    };
  }, []);

  const handleCancelRide = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handleBackNavigation = () => {
    // Also cancel when back is pressed
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute inset-x-0 top-0 bg-white min-h-screen md:min-h-0 md:rounded-lg"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="flex items-center justify-between p-4 md:p-5">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleBackNavigation}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </motion.button>
          <h3 className="text-xl md:text-2xl font-bold">Looking for Driver{dots}</h3>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleCancelRide}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <XMarkIcon className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto h-[calc(100vh-180px)] md:h-[calc(100vh-300px)]">
        {/* Loading Animation */}
        <div className="text-center py-6 md:py-8">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 360]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 bg-black rounded-full flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: [0, -360] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 md:w-12 md:h-12 border-4 border-white border-t-transparent rounded-full"
            />
          </motion.div>
          
          <h2 className="text-xl md:text-2xl font-bold mb-2">Finding your driver{dots}</h2>
          <p className="text-sm md:text-base text-gray-600">This usually takes a few seconds</p>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <motion.div 
              className="bg-black h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          {/* Loading Line Animation */}
          <div className="mt-6 space-y-2">
            <motion.div
              className="h-1 bg-gray-300 rounded-full mx-auto"
              initial={{ width: "20%" }}
              animate={{ width: ["20%", "80%", "40%", "90%", "20%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="h-1 bg-gray-400 rounded-full mx-auto"
              initial={{ width: "30%" }}
              animate={{ width: ["30%", "60%", "85%", "45%", "30%"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            />
            <motion.div
              className="h-1 bg-gray-500 rounded-full mx-auto"
              initial={{ width: "15%" }}
              animate={{ width: ["15%", "70%", "25%", "95%", "15%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="bg-gray-50 p-4 md:p-6 rounded-xl md:rounded-2xl">
          <div className="flex items-center mb-4">
            <img 
              src={selectedVehicle.image} 
              alt={selectedVehicle.name}
              className="w-24 h-16 object-contain"
            />
            <div className="ml-4 flex-1">
              <h4 className="font-bold text-lg">{selectedVehicle.name}</h4>
              <div className="flex items-center text-gray-500 mt-1">
                <ClockIcon className="w-4 h-4 mr-1" />
                <span className="text-sm">{selectedVehicle.time}</span>
              </div>
            </div>
            <span className="text-2xl font-bold">{selectedVehicle.price}</span>
          </div>
        </div>

        {/* Trip Details */}
        <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6">
          <h4 className="font-bold text-lg mb-4">Trip Details</h4>
          
          <div className="space-y-4">
            <div>
              <p className="text-gray-400 font-medium text-sm mb-1">PICKUP LOCATION</p>
              <p className="font-medium text-gray-900">{pickup || "Not specified"}</p>
            </div>
            
            <div className="border-l-2 border-gray-200 ml-2 h-6"></div>
            
            <div>
              <p className="text-gray-400 font-medium text-sm mb-1">DESTINATION</p>
              <p className="font-medium text-gray-900">{destination || "Not specified"}</p>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6">
          <h4 className="font-bold text-lg mb-3">Payment Method</h4>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center">
              {selectedPayment === 'cash' ? (
                <CurrencyRupeeIcon className="w-5 h-5 text-gray-700 mr-3" />
              ) : (
                <CreditCardIcon className="w-5 h-5 text-gray-700 mr-3" />
              )}
              <span className="font-medium capitalize">{selectedPayment || "Not selected"}</span>
            </div>
            <span className="font-bold">{selectedVehicle.price}</span>
          </div>
        </div>

        {/* Status Messages */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center space-y-2 pb-16 md:pb-20"
        >
          <p className="text-sm text-gray-500">🔍 Searching for nearby drivers</p>
          <p className="text-sm text-gray-500">📱 We'll notify you when a driver accepts</p>
        </motion.div>
      </div>

      {/* Cancel Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-white border-t">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCancelRide}
          className="w-full py-3 md:py-4 bg-red-100 text-red-700 rounded-xl font-bold text-base md:text-lg hover:bg-red-200 transition-colors border border-red-200"
        >
          Cancel Ride
        </motion.button>
      </div>
    </motion.div>
  )
}

export default LookingForDriver
