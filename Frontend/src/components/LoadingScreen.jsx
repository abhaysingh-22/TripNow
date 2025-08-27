import React from "react";
import { motion } from "framer-motion";
import {
  CubeTransparentIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import TripNowBlack from "../assets/TripNowBlack.png";

function LoadingScreen() {
  return (
    <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-black overflow-hidden z-50">
      {/* Animated Background Gradient */}
      <motion.div
        className="absolute inset-0 bg-[#000000]"
        animate={{
          background: [
            "radial-gradient(circle at 30% 20%, #1a1a1a 0%, #000000 70%)",
            "radial-gradient(circle at 70% 60%, #1a1a1a 0%, #000000 70%)",
            "radial-gradient(circle at 40% 80%, #1a1a1a 0%, #000000 70%)",
          ],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating Icons Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[CubeTransparentIcon, GlobeAltIcon, ShieldCheckIcon].map(
          (Icon, index) => (
            <motion.div
              key={index}
              className="absolute text-white/5"
              initial={{
                x: `${20 + Math.random() * 60}%`,
                y: `${20 + Math.random() * 60}%`,
                scale: 0.5,
                opacity: 0,
              }}
              animate={{
                x: [
                  `${20 + Math.random() * 60}%`,
                  `${20 + Math.random() * 60}%`,
                ],
                y: [
                  `${20 + Math.random() * 60}%`,
                  `${20 + Math.random() * 60}%`,
                ],
                scale: [0.5, 0.7, 0.5],
                opacity: [0.3, 0.5, 0.3],
                rotate: [0, 180],
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: index * 1.5,
              }}
            >
              <Icon className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32" />
            </motion.div>
          )
        )}
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4 sm:px-6 flex flex-col items-center">
        {/* Logo Section */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 1,
            ease: [0.23, 1.64, 0.32, 1] /* cubic-bezier */,
          }}
          className="mb-8 sm:mb-12 md:mb-16"
        >
          <div className="relative">
            {/* Outer Glow */}
            <motion.div
              className="absolute inset-0 bg-white/10 rounded-full blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.1, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <div className="relative bg-white p-4 sm:p-5 md:p-6 rounded-full shadow-[0_0_50px_rgba(255,255,255,0.15)] mx-auto w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex items-center justify-center">
              <img
                src={TripNowBlack}
                alt="TripNow Logo"
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain"
              />

              {/* Multiple Ripple Effects */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border-2 border-white/20"
                  initial={{ scale: 1, opacity: 0 }}
                  animate={{
                    scale: [1, 1.4],
                    opacity: [0.4, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut",
                    delay: i * 0.4,
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Text Content */}
        <div className="text-center space-y-6 sm:space-y-7 md:space-y-8 max-w-sm mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <motion.h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-400"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                backgroundSize: "200% 100%",
              }}
            >
              Welcome to TripNow
            </motion.h2>
            <motion.p
              className="text-gray-400 text-sm sm:text-base md:text-lg font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Your journey begins here
            </motion.p>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            className="w-full max-w-xs mx-auto px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="h-1.5 w-full bg-gray-800/50 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"
                initial={{ width: "0%", x: "-100%" }}
                animate={{
                  width: "100%",
                  x: ["0%", "100%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  backgroundSize: "200% 100%",
                }}
              />
            </div>
          </motion.div>

          {/* Loading Messages */}
          <motion.div
            className="text-sm sm:text-base text-gray-400/90 font-medium px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <motion.span
              className="inline-block"
              animate={{
                opacity: [1, 0.7, 1],
                y: [0, -2, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              Getting everything ready for you...
            </motion.span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
