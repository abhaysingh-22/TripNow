import React from "react";
import { Link } from "react-router-dom";
import HomeCar from "../assets/HomeCar.jpg";

function Start() {
  return (
    <div
      className="fixed inset-0 h-screen w-screen overflow-hidden flex flex-col justify-between bg-black animate-fadeIn"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.6)), url(${HomeCar})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <header className="p-4 md:p-6 lg:p-8 animate-slideDown">
        <img
          className="w-[60px] md:w-[80px] lg:w-[100px] hover:scale-105 transition-transform duration-300"
          src="https://cdn-assets-eu.frontify.com/s3/frontify-enterprise-files-eu/eyJwYXRoIjoid2VhcmVcL2ZpbGVcLzhGbTh4cU5SZGZUVjUxYVh3bnEyLnN2ZyJ9:weare:F1cOF9Bps96cMy7r9Y2d7affBYsDeiDoIHfqZrbcxAw?width=1200&height=417"
          alt="Uber Logo"
        />
      </header>

      <div className="w-full animate-slideUp">
        <div
          className="bg-gray-100/95 backdrop-blur-md w-full 
        sm:rounded-t-xl shadow-2xl py-4 sm:py-5 px-6 sm:px-8 transition-all duration-500 
        ease-in-out hover:bg-gray-200/95 border-t border-gray-300/30"
        >
          <h2
            className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-4 
          text-gray-800"
          >
            Get Started with Uber
          </h2>
          <Link
            to="/login"
            className="group flex items-center justify-center w-full bg-black text-white 
            py-3 sm:py-3.5 rounded-lg text-base sm:text-lg font-medium 
            hover:bg-gray-900 active:scale-95 transition-all duration-300"
          >
            <span
              className="relative z-10 group-hover:translate-x-1 transition-all duration-300 
            flex items-center gap-2"
            >
              Continue
              <svg
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Start;
