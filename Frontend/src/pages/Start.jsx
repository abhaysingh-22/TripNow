import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HomeCar from "../assets/HomeCar.jpg";
import TripNow from "../assets/TripNow.png";

function Start() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY * 0.5);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-black animate-fadeIn">
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.8)), url(${HomeCar})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          transform: `translateY(${scrollY}px)`,
        }}
      />

      <div className="relative h-full flex flex-col justify-between z-10">
        <header className="p-3 sm:p-4 md:p-6 lg:p-8 flex justify-between items-center animate-slideDown">
          <img
            className="w-[80px] sm:w-[100px] md:w-[120px] lg:w-[140px] hover:scale-105 transition-all duration-300"
            src={TripNow}
            alt="Logo"
          />
          <div className="space-x-2 sm:space-x-4">
            <Link
              to="/captain-login"
              className="inline-flex items-center px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base font-medium
              text-white bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20
              transition-all duration-300 hover:scale-105 active:scale-95
              border border-white/10 hover:border-white/25 shadow-lg
              hover:shadow-white/20"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2"
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
              Drive
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base font-medium
              text-white bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20
              transition-all duration-300 hover:scale-105 active:scale-95
              border border-white/10 hover:border-white/25 shadow-lg
              hover:shadow-white/20"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              About
            </Link>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 -mt-8 sm:-mt-12 md:-mt-16">
          <div className="text-center text-white space-y-4 sm:space-y-6 animate-fadeIn">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Your Ride, Your Way
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto px-2">
              Experience the future of transportation
            </p>
          </div>
        </main>

        <div className="w-full animate-slideUp">
          <div
            className="bg-gradient-to-br from-black/40 via-gray-900/60 to-black/40 
            backdrop-blur-xl w-full sm:rounded-t-3xl shadow-2xl 
            py-4 sm:py-6 md:py-8 px-4 sm:px-6 md:px-8 transition-all duration-500 
            border-t border-white/10 hover:border-white/20"
          >
            <div className="max-w-md mx-auto space-y-4 sm:space-y-6">
              <h2
                className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4 sm:mb-6 
                bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent
                tracking-wide"
              >
                Get moving with TripNow
              </h2>

              <Link
                to="/login"
                className="group flex items-center justify-center w-full 
                bg-gradient-to-r from-white via-gray-100 to-white text-black 
                py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold 
                hover:from-gray-100 hover:via-white hover:to-gray-100 
                active:scale-[0.98] transition-all duration-300 
                shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                <span className="flex items-center gap-2 sm:gap-3 relative z-10">
                  Ride with us
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5-5 5"
                    />
                  </svg>
                </span>
              </Link>

              <Link
                to="/captain-signup"
                className="group flex items-center justify-center w-full 
                bg-transparent text-white py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold 
                border-2 border-white/20 hover:border-white/40
                hover:bg-white/5 active:scale-[0.98] transition-all duration-300
                shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                <span className="flex items-center gap-2 sm:gap-3">
                  Become a driver
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:translate-x-1 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5-5 5"
                    />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Start;
