import { useState, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "./useAuth";

// API Configuration
const API_BASE_URL = "http://localhost:3000/api";

// Utility function for debouncing
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const useSuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { getAuthToken } = useAuth();

  // Fetch suggestions from backend
  const fetchSuggestions = async (input) => {
    console.log("fetchSuggestions called with input:", input);

    if (!input || input.trim().length < 2) {
      console.log("Input too short, clearing suggestions");
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    console.log("Starting to fetch suggestions...");

    try {
      const token = getAuthToken();
      console.log("Token found:", !!token);

      if (!token) {
        console.log("No token found");
        toast.error("Please login to search locations");
        setSuggestions([]);
        setShowSuggestions(false);
        setIsLoadingSuggestions(false);
        return;
      }

      console.log("Making API call to:", `${API_BASE_URL}/maps/suggestions`);
      const response = await axios.get(`${API_BASE_URL}/maps/suggestions`, {
        params: { input: input.trim() },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      });

      console.log("API response status:", response.status);
      console.log("API response:", response.data);

      if (response.data && Array.isArray(response.data)) {
        console.log("Setting suggestions:", response.data.length, "items");
        setSuggestions(response.data);
        setShowSuggestions(response.data.length > 0);
      } else {
        console.log("Invalid response format:", response.data);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);

      // Handle different error types
      if (error.code === "ECONNABORTED") {
        toast.error("Request timeout. Please try again.");
      } else if (error.response?.status === 401) {
        toast.error("Please login to search locations");
      } else if (error.response?.status === 429) {
        toast.error("Too many requests. Please wait a moment.");
      } else if (error.response?.status >= 500) {
        toast.error("Server error. Please try again later.");
      } else if (!navigator.onLine) {
        toast.error("Please check your internet connection");
      } else {
        toast.error(`Failed to fetch location suggestions: ${error.message}`);
      }

      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Debounced version of fetchSuggestions
  const debouncedFetchSuggestions = useCallback(
    debounce(fetchSuggestions, 300),
    []
  );

  const clearSuggestions = () => {
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return {
    suggestions,
    isLoadingSuggestions,
    showSuggestions,
    fetchSuggestions: debouncedFetchSuggestions,
    clearSuggestions,
    setSuggestions,
    setShowSuggestions,
  };
};
