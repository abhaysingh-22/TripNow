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

  // Simplified animation variants
  const animations = {
    container: {
      hidden: { opacity: 0 },
      show: { 
        opacity: 1, 
        transition: { staggerChildren: 0.1 } 
      }
    },
    item: {
      hidden: { opacity: 0, y: 20 },
      show: { 
        opacity: 1, 
        y: 0,
        transition: { type: "spring", damping: 25 }
      }
    },
    pulse: {
      scale: [1, 1.1, 1],
      opacity: [0.8, 1, 0.8],
      transition: { duration: 2, repeat: Infinity }
    }
  };

  return (
    <div className="p-4 pb-6 bg-white">
      {/* Header with user info */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center">
          <div className="relative">
            <img
              src={captainData.photo}
              alt="Captain"
              className="w-16 h-16 rounded-full object-cover border-2 border-yellow-400"
            />
            <div className="absolute -bottom-1 -right-1 bg-green-500 p-1 rounded-full border-2 border-white">
              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
          </div>
          
          <div className="ml-3">
            <h2 className="font-bold text-gray-800">{captainData.name}</h2>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(captainData.rating) ? "text-yellow-400" : "text-gray-200"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-1 text-xs text-yellow-500">{captainData.rating}</span>
            </div>
          </div>
        </div>
        
        <motion.div 
          className="bg-green-500 rounded-full w-3 h-3"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
      </div>

      {/* Earnings Card */}
      <motion.div
        className="bg-green-500 rounded-xl p-4 mb-4 text-white shadow-md"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="text-white text-opacity-90 text-xs font-medium">Today's Earnings</p>
            <p className="text-2xl font-bold">${captainData.earningsToday.toFixed(2)}</p>
          </div>
          <div className="p-2 bg-white bg-opacity-20 rounded-full">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-2 gap-3 mb-4"
        variants={animations.container}
        initial="hidden"
        animate="show"
      >
        {/* Stats cards with simplified structure */}
        {[
          {
            title: "HOURS ONLINE",
            value: `${captainData.hoursOnline} hrs`,
            icon: (
              <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            bgColor: "bg-yellow-100",
            iconColor: "text-yellow-500"
          },
          {
            title: "DISTANCE",
            value: `${captainData.distanceTravelled} km`,
            icon: (
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            ),
            bgColor: "bg-green-100",
            iconColor: "text-green-500"
          },
          {
            title: "TOTAL RIDES",
            value: captainData.totalRides,
            icon: (
              <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            ),
            bgColor: "bg-yellow-100",
            iconColor: "text-yellow-500"
          },
          {
            title: "STATUS",
            value: "Active",
            icon: (
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            bgColor: "bg-green-100",
            iconColor: "text-green-500",
            valueColor: "text-green-500"
          }
        ].map((stat, index) => (
          <motion.div
            key={index}
            variants={animations.item}
            className="bg-white rounded-lg p-3 shadow-sm border border-gray-100"
          >
            <div className={`${stat.bgColor} w-8 h-8 rounded-lg flex items-center justify-center mb-2`}>
              {stat.icon}
            </div>
            <p className="text-xs text-gray-500 font-medium">{stat.title}</p>
            <p className={`text-base font-bold ${stat.valueColor || 'text-gray-800'} mt-1`}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Action button */}
      <motion.button
        className="w-full py-3 rounded-lg bg-yellow-400 text-white font-medium shadow-md"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Go Offline
      </motion.button>
    </div>
  );
}

export default CaptainDetails;
