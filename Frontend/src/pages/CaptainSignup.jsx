import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CaptainContext } from "../context/CaptainContext.jsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import TripNow from "../assets/TripNow.png";
import TripNowBlack from "../assets/TripNowBlack.png";

const CaptainSignup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [showPopup, setShowPopup] = useState(false);

  const navigate = useNavigate();

  const [vehicalColor, setVehicalColor] = useState("");
  const [vehicalCapacity, setVehicalCapacity] = useState("");
  const [vehicalNumber, setVehicalNumber] = useState("");
  const [vehicalType, setVehicalType] = useState("");

  const { captain, setCaptain } = React.useContext(CaptainContext);

  useEffect(() => {
    localStorage.setItem("darkMode", isDarkMode);
  }, [isDarkMode]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Add validation
    if (!firstName.trim() || !lastName.trim()) {
      alert("Please enter both first and last name");
      setIsLoading(false);
      return;
    }

    const newUser = {
      fullName: {
        firstName: firstName,
        lastName: lastName,
      },
      email: email,
      password: password,
      vehicle: {
        color: vehicalColor,
        numberPlate: vehicalNumber,
        capacity: vehicalCapacity,
        typeofVehicle: vehicalType,
      },
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/captains/register`,
        newUser
      );

      if (response.status === 201) {
        const data = response.data;
        setCaptain(data.captain);
        localStorage.setItem("token", data.token);
        setShowPopup(true);
        setEmail("");
        setFirstName("");
        setLastName("");
        setPassword("");
        setVehicalColor("");
        setVehicalCapacity("");
        setVehicalNumber("");
        setVehicalType("");
        setTimeout(() => {
          setShowPopup(false);
          navigate("/captain-home");
        }, 1500);
      }
    } catch (error) {
      console.error("Captain registration error:", error);
      console.error("Error response:", error.response?.data);

      let errorMessage = "Registration failed. Please try again.";

      if (error.response?.status === 400) {
        if (error.response.data?.errors) {
          errorMessage = error.response.data.errors
            .map((err) => err.msg)
            .join(", ");
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = "Invalid data provided. Please check your inputs.";
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 ${isDarkMode ? "bg-gray-900" : "bg-gray-50"} 
      transition-colors duration-300 animate-fadeIn
      flex items-center justify-center overflow-hidden`}
    >
      {showPopup && (
        <div
          className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg
        shadow-lg animate-slideInRight"
        >
          Account Created Successfully!
        </div>
      )}

      <div
        className={`w-full max-w-[calc(100%-1rem)] sm:max-w-[500px] mx-auto
        ${isDarkMode ? "bg-gray-900" : "bg-white"} 
        rounded-lg sm:rounded-xl shadow-[0_0_15px_rgba(251,191,36,0.3)] 
        ${isDarkMode ? "shadow-amber-400/20" : "shadow-amber-500/30"} 
        transition-all duration-300 animate-slideInUp 
        p-3 sm:p-4 md:p-6
        border border-amber-100/50
        h-[90vh]
        flex flex-col`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <img
            className="w-12 sm:w-16 md:w-20 transition-all duration-300 hover:scale-105"
            src={isDarkMode ? TripNow : TripNowBlack}
            alt="TripNow Logo"
          />
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-full transform hover:scale-110 active:scale-95 
              ${
                isDarkMode
                  ? "bg-gray-800 text-white"
                  : "bg-gray-200 text-gray-700"
              }
              transition-all duration-300 hover:shadow-md`}
          >
            {isDarkMode ? "🌙" : "☀️"}
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2">
          <div className="space-y-4">
            <form onSubmit={submitHandler} className="space-y-4">
              {/* Name Section */}
              <div className="space-y-1.5 sm:space-y-2 group">
                <h3
                  className={`text-base sm:text-lg font-semibold transform transition-all duration-300
                    group-hover:translate-x-1 ${
                      isDarkMode ? "text-white" : "text-gray-800"
                    }`}
                >
                  Your Name, Captain?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  <input
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border transform transition-all duration-300
                      group-hover:shadow-md
                      ${
                        isDarkMode
                          ? "bg-gray-800 border-gray-700 text-white"
                          : "bg-white border-gray-200"
                      }
                      focus:ring-2 focus:ring-black focus:border-transparent focus:scale-[1.01]
                      text-base outline-none`}
                    type="text"
                    placeholder="First name"
                  />
                  <input
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border transform transition-all duration-300
                      group-hover:shadow-md
                      ${
                        isDarkMode
                          ? "bg-gray-800 border-gray-700 text-white"
                          : "bg-white border-gray-200"
                      }
                      focus:ring-2 focus:ring-black focus:border-transparent focus:scale-[1.01]
                      text-base outline-none`}
                    type="text"
                    placeholder="Last name"
                  />
                </div>
              </div>

              {/* Email Section */}
              <div className="space-y-1.5 sm:space-y-2 group">
                <h3
                  className={`text-base sm:text-lg font-semibold transform transition-all duration-300
                    group-hover:translate-x-1 ${
                      isDarkMode ? "text-white" : "text-gray-800"
                    }`}
                >
                  What's your email, Captain?
                </h3>
                <input
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border transform transition-all duration-300
                    group-hover:shadow-md
                    ${
                      isDarkMode
                        ? "bg-gray-800 border-gray-700 text-white"
                        : "bg-white border-gray-200"
                    }
                    focus:ring-2 focus:ring-black focus:border-transparent focus:scale-[1.01]
                    text-base outline-none`}
                  type="email"
                  placeholder="Enter your email address"
                />
              </div>

              {/* Password Section */}
              <div className="space-y-1.5 sm:space-y-2 group">
                <h3
                  className={`text-base sm:text-lg font-semibold transform transition-all duration-300
                    group-hover:translate-x-1 ${
                      isDarkMode ? "text-white" : "text-gray-800"
                    }`}
                >
                  Create a password
                </h3>
                <div className="relative">
                  <input
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border transform transition-all duration-300
                      group-hover:shadow-md
                      ${
                        isDarkMode
                          ? "bg-gray-800 border-gray-700 text-white"
                          : "bg-white border-gray-200"
                      }
                      focus:ring-2 focus:ring-black focus:border-transparent focus:scale-[1.01]
                      text-base outline-none`}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className={`absolute right-3 top-1/2 -translate-y-1/2 
                      ${
                        isDarkMode
                          ? "text-gray-400 hover:text-gray-200"
                          : "text-gray-500 hover:text-gray-700"
                      } text-xl`}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              {/* Vehicle Details Section */}
              <div className="space-y-1.5 sm:space-y-2 group">
                <h3
                  className={`text-base sm:text-lg font-semibold transform transition-all duration-300
                    group-hover:translate-x-1 ${
                      isDarkMode ? "text-white" : "text-gray-800"
                    }`}
                >
                  Vehicle Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <input
                    required
                    value={vehicalColor}
                    onChange={(e) => setVehicalColor(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border transform transition-all duration-300
                      group-hover:shadow-md
                      ${
                        isDarkMode
                          ? "bg-gray-800 border-gray-700 text-white"
                          : "bg-white border-gray-200"
                      }
                      focus:ring-2 focus:ring-black focus:border-transparent focus:scale-[1.01]
                      text-base outline-none`}
                    type="text"
                    placeholder="Vehicle Color"
                  />
                  <input
                    required
                    value={vehicalCapacity}
                    onChange={(e) => setVehicalCapacity(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border transform transition-all duration-300
                      group-hover:shadow-md
                      ${
                        isDarkMode
                          ? "bg-gray-800 border-gray-700 text-white"
                          : "bg-white border-gray-200"
                      }
                      focus:ring-2 focus:ring-black focus:border-transparent focus:scale-[1.01]
                      text-base outline-none`}
                    type="number"
                    placeholder="Seating Capacity"
                  />
                  <input
                    required
                    value={vehicalNumber}
                    onChange={(e) => setVehicalNumber(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border transform transition-all duration-300
                      group-hover:shadow-md
                      ${
                        isDarkMode
                          ? "bg-gray-800 border-gray-700 text-white"
                          : "bg-white border-gray-200"
                      }
                      focus:ring-2 focus:ring-black focus:border-transparent focus:scale-[1.01]
                      text-base outline-none`}
                    type="text"
                    placeholder="Vehicle Number"
                  />
                  <select
                    required
                    value={vehicalType}
                    onChange={(e) => setVehicalType(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border transform transition-all duration-300
                      group-hover:shadow-md
                      ${
                        isDarkMode
                          ? "bg-gray-800 border-gray-700 text-white"
                          : "bg-white border-gray-200"
                      }
                      focus:ring-2 focus:ring-black focus:border-transparent focus:scale-[1.01]
                      text-base outline-none`}
                  >
                    <option value="">Select Vehicle Type</option>
                    <option value="car">Car</option>
                    <option value="bike">Bike</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <button
                className={`w-full font-medium sm:font-semibold py-2.5 sm:py-3 rounded-lg transform 
                  transition-all duration-300 relative overflow-hidden text-sm sm:text-base
                  ${
                    isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-black hover:bg-gray-800 active:scale-[0.98]"
                  }
                  text-white hover:shadow-xl mt-2 sm:mt-3`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-3"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Login Link */}
            <p
              className={`text-center text-sm sm:text-base transform hover:scale-105 transition-all duration-300
                ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              Already have an account?{" "}
              <Link
                to="/captain-login"
                className="text-blue-500 hover:text-blue-600 font-medium"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-2 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <p
            className={`text-center text-[10px] sm:text-xs 
              ${isDarkMode ? "text-gray-400" : "text-gray-600"} 
              leading-relaxed px-1 sm:px-2`}
          >
            This site is protected by reCAPTCHA and the{" "}
            <a
              href="#"
              className={`underline hover:text-blue-500 transition-colors duration-300
                ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              Google Privacy Policy
            </a>{" "}
            and{" "}
            <a
              href="#"
              className={`underline hover:text-blue-500 transition-colors duration-300
                ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
            >
              Terms of Service
            </a>{" "}
            apply.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CaptainSignup;
