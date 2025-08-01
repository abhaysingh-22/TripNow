import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

function CaptainDetails() {
  // Mock data - in a real app, this would come from an API
  const [captainData, setCaptainData] = useState({
    name: "John Doe",
    photo: "https://randomuser.me/api/portraits/men/34.jpg",
    earningsToday: 245.5,
    hoursOnline: 6.5,
    distanceTravelled: 78.3,
    totalRides: 12,
    rating: 4.8,
  });

  // In a real app, you would fetch captain data here
  useEffect(() => {
    // Example fetch code (commented out)
    // const fetchCaptainData = async () => {
    //     const response = await fetch('/api/captain/details');
    //     const data = await response.json();
    //     setCaptainData(data);
    // };
    // fetchCaptainData();
  }, []);

  // Enhanced animation variants
  const statVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  // Floating animation for icons
  const floatingAnimation = {
    y: [0, -4, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
    },
  };

  return (
    <div className="p-4 pb-8 bg-gradient-to-b from-white to-gray-50">
      {/* Header with photo and basic info - enhanced with better animation */}
      <motion.div
        className="flex items-center mb-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
      >
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              type: "spring",
              stiffness: 300,
            }}
            className="rounded-full p-1 bg-gradient-to-r from-yellow-400 via-yellow-300 to-green-400"
          >
            <motion.img
              src={captainData.photo}
              alt="Captain"
              className="w-20 h-20 rounded-full object-cover border-2 border-white"
              whileHover={{ scale: 1.05 }}
            />
          </motion.div>

          <motion.div
            className="absolute -bottom-1 -right-1 bg-green-500 p-1.5 rounded-full border-2 border-white shadow-md"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.2 }}
          >
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>
        </div>

        <motion.div
          className="ml-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.h2
            className="font-bold text-xl text-gray-800"
            initial={{ y: -10 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {captainData.name}
          </motion.h2>

          <div className="flex items-center mt-1">
            {[...Array(5)].map((_, i) => (
              <motion.svg
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(captainData.rating)
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </motion.svg>
            ))}
            <motion.span
              className="ml-1 text-sm font-semibold text-yellow-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {captainData.rating}
            </motion.span>
          </div>
        </motion.div>
      </motion.div>

      {/* Earnings - enhanced with pulsing effect */}
      <motion.div
        className="rounded-xl p-4 mb-6 text-white shadow-lg overflow-hidden relative"
        style={{
          background: "linear-gradient(135deg, #00c853 0%, #009624 100%)",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        whileHover={{ scale: 1.02 }}
      >
        {/* Background decorative elements */}
        <motion.div
          className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-white opacity-10"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
          }}
        />
        <motion.div
          className="absolute -left-4 -bottom-4 w-16 h-16 rounded-full bg-white opacity-10"
          animate={{
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            delay: 0.5,
          }}
        />

        <div className="flex justify-between items-center relative z-10">
          <div>
            <p className="text-white text-opacity-95 text-sm font-medium">
              Today's Earnings
            </p>
            <motion.p
              className="text-3xl font-bold"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              ${captainData.earningsToday.toFixed(2)}
            </motion.p>
          </div>
          <motion.div
            className="p-3 bg-white bg-opacity-20 backdrop-blur-sm rounded-full"
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.95 }}
            animate={floatingAnimation}
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid - enhanced with better animations and improved colors */}
      <motion.div
        className="grid grid-cols-2 gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Hours Online */}
        <motion.div
          className="bg-white rounded-xl p-4 shadow-md border border-gray-100 relative overflow-hidden"
          variants={statVariants}
          whileHover={{
            y: -5,
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
            transition: { duration: 0.2 },
          }}
        >
          <div className="absolute right-0 top-0 w-20 h-20 bg-yellow-100 rounded-bl-full opacity-60 -mr-6 -mt-6 z-0"></div>
          <div className="flex flex-col relative z-10">
            <motion.div
              className="p-2 bg-yellow-100 rounded-lg w-fit mb-2"
              animate={floatingAnimation}
            >
              <svg
                className="w-5 h-5 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </motion.div>
            <p className="text-xs text-gray-500 font-medium">HOURS ONLINE</p>
            <motion.p
              className="text-xl font-bold text-gray-800 mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {captainData.hoursOnline} hrs
            </motion.p>
          </div>
        </motion.div>

        {/* Distance */}
        <motion.div
          className="bg-white rounded-xl p-4 shadow-md border border-gray-100 relative overflow-hidden"
          variants={statVariants}
          whileHover={{
            y: -5,
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
            transition: { duration: 0.2 },
          }}
        >
          <div className="absolute right-0 top-0 w-20 h-20 bg-green-100 rounded-bl-full opacity-60 -mr-6 -mt-6 z-0"></div>
          <div className="flex flex-col relative z-10">
            <motion.div
              className="p-2 bg-green-100 rounded-lg w-fit mb-2"
              animate={floatingAnimation}
            >
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </motion.div>
            <p className="text-xs text-gray-500 font-medium">DISTANCE</p>
            <motion.p
              className="text-xl font-bold text-gray-800 mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {captainData.distanceTravelled} km
            </motion.p>
          </div>
        </motion.div>

        {/* Rides */}
        <motion.div
          className="bg-white rounded-xl p-4 shadow-md border border-gray-100 relative overflow-hidden"
          variants={statVariants}
          whileHover={{
            y: -5,
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
            transition: { duration: 0.2 },
          }}
        >
          <div className="absolute right-0 top-0 w-20 h-20 bg-yellow-100 rounded-bl-full opacity-60 -mr-6 -mt-6 z-0"></div>
          <div className="flex flex-col relative z-10">
            <motion.div
              className="p-2 bg-yellow-100 rounded-lg w-fit mb-2"
              animate={floatingAnimation}
            >
              <svg
                className="w-5 h-5 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </motion.div>
            <p className="text-xs text-gray-500 font-medium">TOTAL RIDES</p>
            <motion.p
              className="text-xl font-bold text-gray-800 mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {captainData.totalRides}
            </motion.p>
          </div>
        </motion.div>

        {/* Status */}
        <motion.div
          className="bg-white rounded-xl p-4 shadow-md border border-gray-100 relative overflow-hidden"
          variants={statVariants}
          whileHover={{
            y: -5,
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
            transition: { duration: 0.2 },
          }}
        >
          <div className="absolute right-0 top-0 w-20 h-20 bg-green-100 rounded-bl-full opacity-60 -mr-6 -mt-6 z-0"></div>
          <div className="flex flex-col relative z-10">
            <motion.div
              className="p-2 bg-green-100 rounded-lg w-fit mb-2"
              animate={floatingAnimation}
            >
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </motion.div>
            <p className="text-xs text-gray-500 font-medium">STATUS</p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center mt-1"
            >
              <motion.span
                className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1.5"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.8, 1, 0.8],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
              <p className="text-xl font-bold text-green-500">Active</p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Action button - enhanced with gradient and animation */}
      <motion.button
        className="w-full mt-6 py-3.5 rounded-xl shadow-lg font-medium text-lg text-white overflow-hidden relative"
        style={{
          background: "linear-gradient(90deg, #ffc107 0%, #ffeb3b 100%)",
          boxShadow: "0 4px 15px rgba(255, 193, 7, 0.3)",
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        whileHover={{
          scale: 1.02,
          boxShadow: "0 6px 20px rgba(255, 193, 7, 0.4)",
        }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.span
          className="absolute inset-0 bg-white"
          initial={{ x: "-100%", opacity: 0.3 }}
          whileHover={{
            x: "100%",
            opacity: 0.3,
            transition: { duration: 0.8 },
          }}
        />
        <span className="relative z-10 flex items-center justify-center">
          <span>Go Offline</span>
          <motion.svg
            className="w-5 h-5 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            animate={{
              x: [0, 3, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </motion.svg>
        </span>
      </motion.button>
    </div>
  );
}

export default CaptainDetails;
