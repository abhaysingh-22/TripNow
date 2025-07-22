import React from 'react'
import { motion } from 'framer-motion'
import { CubeTransparentIcon, GlobeAltIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'

function LoadingScreen() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-black relative overflow-hidden">
      {/* Animated Background Gradient */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "radial-gradient(circle at 0% 0%, #000000 0%, #171717 100%)",
            "radial-gradient(circle at 100% 100%, #000000 0%, #171717 100%)",
            "radial-gradient(circle at 50% 50%, #000000 0%, #171717 100%)",
          ]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating Icons Background */}
      <div className="absolute inset-0 overflow-hidden">
        {[CubeTransparentIcon, GlobeAltIcon, ShieldCheckIcon].map((Icon, index) => (
          <motion.div
            key={index}
            className="absolute text-white/5"
            initial={{ 
              x: `${Math.random() * 100}%`, 
              y: `${Math.random() * 100}%`,
              scale: 0.5 
            }}
            animate={{
              x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
              y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
              scale: [0.5, 0.8, 0.5],
              rotate: [0, 360]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear",
              delay: index * 2
            }}
          >
            <Icon className="w-24 h-24 md:w-32 md:h-32" />
          </motion.div>
        ))}
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        {/* Logo Section */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "backOut" }}
          className="mb-12 md:mb-16"
        >
          <div className="relative">
            <div className="bg-white p-5 md:p-6 rounded-full shadow-2xl border-0 mx-auto w-24 h-24 md:w-28 md:h-28 flex items-center justify-center">
              <img
                src="https://w7.pngwing.com/pngs/801/240/png-transparent-uber-hd-logo.png"
                alt="Uber"
                className="w-16 h-16 md:w-20 md:h-20 object-contain"
              />
              {/* Ripple Effect */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-white/20"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0, 0.1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Text Content */}
        <div className="text-center space-y-6 md:space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <motion.h2
              className="text-2xl md:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400"
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              Welcome to Uber
            </motion.h2>
            <motion.p
              className="text-gray-400 text-sm md:text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Your journey begins here
            </motion.p>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            className="w-full max-w-xs mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </motion.div>

          {/* Loading Messages */}
          <motion.div
            className="text-sm md:text-base text-gray-400"
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="inline-block">
              Getting everything ready for you...
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen
