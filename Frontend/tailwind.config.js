import React from "react";
import { Link } from "react-router-dom";
import HomeCar from "../assets/HomeCar.jpg";
import TripNowBlack from "../assets/TripNowBlack.png";

function Home() {
  return (
    <div
      className="fixed inset-0 h-screen w-screen overflow-hidden flex flex-col justify-between bg-black animate-fadeIn"
      style={{
        backgroundImage: `url(${HomeCar})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <header className="p-4 md:p-6 lg:p-8">
        <img
          className="w-[60px] md:w-[80px] lg:w-[100px]"
          src={TripNowBlack}
          alt="TripNow Logo"
        />
      </header>

      <div className="w-full px-0 sm:px-0">
        <div className="bg-white w-full sm:rounded-t-xl shadow-xl p-5 sm:p-6 md:p-8 animate-slideInUp">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-4 sm:mb-6">
            Get Started with TripNow
          </h2>
          <Link
            to="/login"
            className="flex items-center justify-center w-full bg-black text-white py-3 sm:py-4 rounded-lg text-base sm:text-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Continue
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
