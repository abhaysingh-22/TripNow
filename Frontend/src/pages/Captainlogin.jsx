import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function CaptainLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [captain, setCaptain] = useState({});

  useEffect(() => {
    localStorage.setItem("darkMode", isDarkMode);
  }, [isDarkMode]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const userData = {
      email,
      password,
    };

    setEmail("");
    setPassword("");

    // Simulate API call
    setTimeout(() => {
      setCaptain(userData);
      setShowPopup(true);
      setIsLoading(false);
      setTimeout(() => setShowPopup(false), 3000);
    }, 1000);
  };

  return (
    <div
      className={`fixed inset-0 ${isDarkMode ? "bg-gray-900" : "bg-gray-50"} 
    transition-colors duration-300 animate-fadeIn flex items-center justify-center p-4 sm:p-6 md:p-8`}
    >
      {showPopup && (
        <div
          className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg
        shadow-lg animate-slideInRight"
        >
          Login Successful!
        </div>
      )}

      <div
        className={`w-full max-w-[calc(100%-2rem)] sm:max-w-[440px] mx-auto 
        ${isDarkMode ? "bg-gray-900" : "bg-white"} 
        rounded-xl sm:rounded-2xl shadow-[0_0_15px_rgba(251,191,36,0.3)] 
        ${isDarkMode ? "shadow-amber-400/20" : "shadow-amber-500/30"} 
        transition-all duration-300 animate-slideInUp 
        p-4 sm:p-6 md:p-8
        border border-amber-100/50`}
      >
        <div className="space-y-6 sm:space-y-8">
          <div className="flex justify-between items-center mb-8">
            <img
              className="w-16 sm:w-20 transition-all duration-300 hover:scale-105"
              src={
                isDarkMode
                  ? "https://cdn-assets-eu.frontify.com/s3/frontify-enterprise-files-eu/eyJwYXRoIjoid2VhcmVcL2ZpbGVcLzhGbTh4cU5SZGZUVjUxYVh3bnEyLnN2ZyJ9:weare:F1cOF9Bps96cMy7r9Y2d7affBYsDeiDoIHfqZrbcxAw?width=1200&height=417"
                  : "https://w7.pngwing.com/pngs/801/240/png-transparent-uber-hd-logo.png"
              }
              alt="Uber Logo"
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

          <form onSubmit={submitHandler} className="space-y-5">
            <div className="space-y-2 group">
              <h3
                className={`text-lg font-semibold transform transition-all duration-300
              group-hover:translate-x-1 ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}
              >
                What's your email? Captain!
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

            <div className="space-y-2 group">
              <h3
                className={`text-lg font-semibold transform transition-all duration-300
              group-hover:translate-x-1 ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}
              >
                Captain, enter your password
              </h3>
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
                type="password"
                placeholder="Enter your password"
              />
            </div>

            <button
              className={`w-full font-semibold py-3 rounded-lg transform 
              transition-all duration-300 relative overflow-hidden
              ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-black hover:bg-gray-800 active:scale-[0.98]"
              }
              text-white hover:shadow-xl`}
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
                  Processing...
                </span>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <p
            className={`text-center mt-5 transform hover:scale-105 transition-all duration-300
          ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            Join a fleet?{" "}
            <Link
              to="/captain-signup"
              className="text-blue-500 hover:text-blue-600 font-medium"
            >
              Register as a Captain
            </Link>
          </p>
        </div>

        <Link
          to="/login"
          className="block w-full bg-[#d5622d] text-white font-medium sm:font-semibold 
          py-2.5 sm:py-3 rounded-lg text-sm sm:text-base
          transform transition-all duration-300 mt-6 sm:mt-8 hover:bg-[#c45826] hover:shadow-xl
          active:scale-[0.98] text-center relative overflow-hidden
          hover:translate-y-[-2px]"
        >
          Sign in as User
        </Link>
      </div>
    </div>
  );
}

export default CaptainLogin;
