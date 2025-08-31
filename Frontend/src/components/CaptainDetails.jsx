import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { CaptainContext } from "../context/CaptainContext.jsx";

function CaptainDetails({
  isOnline: propIsOnline,
  setIsOnline: propSetIsOnline,
}) {
  const { captain } = useContext(CaptainContext);

  const [localIsOnline, setLocalIsOnline] = useState(() => {
    const saved = localStorage.getItem("captainOnlineStatus");
    return saved ? JSON.parse(saved) : true;
  });

  const isOnline = propIsOnline !== undefined ? propIsOnline : localIsOnline;
  const setIsOnline =
    propSetIsOnline ||
    ((newStatus) => {
      setLocalIsOnline(newStatus);
      localStorage.setItem("captainOnlineStatus", JSON.stringify(newStatus));
    });

  const toggleOnlineStatus = () => setIsOnline(!isOnline);

  const animations = {
    container: {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
      },
    },
    item: {
      hidden: { opacity: 0, y: 20 },
      show: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", damping: 25 },
      },
    },
  };

  const [captainStats, setCaptainStats] = useState({
    totalEarnings: 0,
    totalDistance: 0,
    totalRides: 0,
  });

  useEffect(() => {
    const fetchCaptainStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_BASE_URL}/api/captains/stats?t=${Date.now()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setCaptainStats({
            totalEarnings: data.stats.career.totalEarnings || 0,
            totalDistance: data.stats.career.totalDistance || 0,
            totalRides: data.stats.career.totalRides || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching captain stats:", error);
      }
    };

    if (captain) {
      fetchCaptainStats();
    }

    const handleRideCompleted = () => {
      setTimeout(() => {
        fetchCaptainStats();
      }, 2000);
    };

    window.addEventListener("rideCompleted", handleRideCompleted);

    return () => {
      window.removeEventListener("rideCompleted", handleRideCompleted);
    };
  }, [captain]);

  const statsConfig = React.useMemo(
    () => [
      {
        title: "Total Earnings",
        value: `₹${captainStats.totalEarnings.toFixed(2)}`,
        icon: "dollar",
        bgColor: "bg-green-100",
        iconColor: "text-green-600",
        valueColor: "text-green-700",
      },
      {
        title: "Total Distance",
        value: `${captainStats.totalDistance.toFixed(1)} km`,
        icon: "map",
        bgColor: "bg-blue-100",
        iconColor: "text-blue-600",
        valueColor: "text-blue-700",
      },
      {
        title: "Total Rides",
        value: captainStats.totalRides.toString(),
        icon: "users",
        bgColor: "bg-purple-100",
        iconColor: "text-purple-600",
        valueColor: "text-purple-700",
      },
      {
        title: "Status",
        value: isOnline ? "Online" : "Offline",
        icon: isOnline ? "check" : "x",
        bgColor: isOnline ? "bg-green-100" : "bg-red-100",
        iconColor: isOnline ? "text-green-600" : "text-red-600",
        valueColor: isOnline ? "text-green-700" : "text-red-700",
      },
    ],
    [captainStats, isOnline]
  );

  const IconComponent = ({ type, className }) => {
    const icons = {
      dollar: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
      map: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
        />
      ),
      users: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      ),
      check: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
      x: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
    };

    return (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {icons[type]}
      </svg>
    );
  };

  return (
    <motion.div
      variants={animations.container}
      initial="hidden"
      animate="show"
      className="p-3 sm:p-4 lg:p-6 pb-4 sm:pb-6 bg-white"
    >
      <motion.div
        variants={animations.item}
        className="flex items-center justify-between mb-4 sm:mb-5"
      >
        <div className="flex items-center">
          <div className="relative">
            <img
              src={
                captain?.photo ||
                "https://randomuser.me/api/portraits/men/32.jpg"
              }
              alt={`${captain?.name || "Captain"} profile`}
              className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-2 ${
                isOnline ? "border-yellow-400" : "border-red-400"
              }`}
            />
            <div
              className={`absolute -bottom-1 -right-1 p-1 rounded-full border-2 border-white ${
                isOnline ? "bg-green-500" : "bg-red-500"
              }`}
            >
              <svg
                className="w-2 h-2 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
              </svg>
            </div>
          </div>

          <div className="ml-3">
            <h2 className="font-bold text-gray-800 text-sm sm:text-base">
              {captain?.fullName
                ? `${captain.fullName.firstName} ${
                    captain.fullName.lastName || ""
                  }`.trim()
                : "Captain Jhonny"}
            </h2>
            {captain?.email && (
              <p className="text-xs text-gray-500">{captain.email}</p>
            )}
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(captain?.rating || 4.7)
                      ? "text-yellow-400"
                      : "text-gray-200"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-1 text-xs text-yellow-500 font-medium">
                {captain?.rating || "4.7"}
              </span>
              <span className="ml-1 text-xs text-gray-400">
                ({captain?.totalRides || captainStats.totalRides || 0} rides)
              </span>
            </div>
          </div>
        </div>

        <motion.div
          className={`rounded-full w-3 h-3 ${
            isOnline ? "bg-green-500" : "bg-red-500"
          }`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
      </motion.div>

      <motion.div
        variants={animations.container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4"
      >
        {statsConfig.map((stat, index) => (
          <motion.div
            key={index}
            variants={animations.item}
            className="bg-white rounded-lg p-2 sm:p-3 shadow-sm border border-gray-100"
          >
            <div
              className={`${stat.bgColor} w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center mb-1 sm:mb-2`}
            >
              <IconComponent
                type={stat.icon}
                className={`w-3 h-3 sm:w-4 sm:h-4 ${stat.iconColor}`}
              />
            </div>

            <p className="text-xs text-gray-500 font-medium">{stat.title}</p>
            <p
              className={`text-sm sm:text-base font-bold ${
                stat.valueColor || "text-gray-800"
              } mt-1`}
            >
              {stat.value}
            </p>
          </motion.div>
        ))}
      </motion.div>

      <motion.button
        variants={animations.item}
        className={`w-full py-3 rounded-lg font-medium shadow-md transition-colors duration-300 ${
          isOnline
            ? "bg-yellow-400 hover:bg-yellow-500 text-white"
            : "bg-green-500 hover:bg-green-600 text-white"
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={toggleOnlineStatus}
        aria-label={`Set status to ${isOnline ? "offline" : "online"}`}
      >
        {isOnline ? "Go Offline" : "Go Online"}
      </motion.button>
    </motion.div>
  );
}

export default CaptainDetails;
