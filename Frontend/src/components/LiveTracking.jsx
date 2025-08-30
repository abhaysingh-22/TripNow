import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  GoogleMap,
  LoadScript,
  DirectionsRenderer,
  Marker,
} from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: false,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: false,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ],
};

// ✅ Define libraries outside component to prevent re-renders
const libraries = ["geometry", "drawing"];

function LiveTracking({
  pickup,
  destination,
  captainLocation,
  userLocation,
  rideStatus = "waiting",
  estimatedArrival,
  onLocationUpdate,
}) {
  // Map state
  const [map, setMap] = useState(null);
  const [currentUserLocation, setCurrentUserLocation] = useState(userLocation);
  const [currentCaptainLocation, setCurrentCaptainLocation] =
    useState(captainLocation);
  const [directions, setDirections] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFallback, setShowFallback] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false); // ✅ Add script loaded state

  // Refs for tracking
  const watchPositionRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const mapLoadTimeoutRef = useRef(null);

  // Check if Google Maps API key is available
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey) {
      console.warn("Google Maps API key not found, showing fallback");
      setShowFallback(true);
      setIsLoading(false);
      return;
    }

    // Set a timeout to show fallback if maps don't load
    mapLoadTimeoutRef.current = setTimeout(() => {
      console.warn("Google Maps loading timeout, showing fallback");
      setShowFallback(true);
      setIsLoading(false);
    }, 15000); // ✅ Increase timeout to 15 seconds

    return () => {
      if (mapLoadTimeoutRef.current) {
        clearTimeout(mapLoadTimeoutRef.current);
      }
    };
  }, [apiKey]);

  // Initialize user location tracking
  useEffect(() => {
    if (showFallback) return;

    if (navigator.geolocation) {
      setIsLoading(true);

      watchPositionRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentUserLocation(newLocation);
          if (onLocationUpdate) {
            onLocationUpdate(newLocation);
          }
          setIsLoading(false);
          setError(null);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setError("Unable to get your location");
          setIsLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000, // ✅ Increase timeout
          maximumAge: 60000, // ✅ Increase cache time
        }
      );
    } else {
      setError("Geolocation is not supported by this browser");
      setIsLoading(false);
    }

    return () => {
      if (watchPositionRef.current) {
        navigator.geolocation.clearWatch(watchPositionRef.current);
      }
    };
  }, [onLocationUpdate, showFallback]);

  // Update captain location when prop changes
  useEffect(() => {
    if (captainLocation) {
      setCurrentCaptainLocation(captainLocation);
    }
  }, [captainLocation]);

  // Calculate and update directions
  const updateDirections = useCallback(() => {
    // ✅ Add multiple safety checks
    if (
      showFallback ||
      !map ||
      !isScriptLoaded ||
      !window.google ||
      !window.google.maps ||
      !directionsServiceRef.current
    ) {
      console.log("Skipping directions update - requirements not met");
      return;
    }

    let origin, destination_point;

    // Determine route based on ride status
    if (rideStatus === "waiting" || rideStatus === "accepted") {
      // Captain to pickup location
      if (!currentCaptainLocation || !pickup) return;
      origin = currentCaptainLocation;
      destination_point = pickup;
    } else if (rideStatus === "in-progress") {
      // Current location to destination
      if (!currentUserLocation || !destination) return;
      origin = currentUserLocation;
      destination_point = destination;
    } else {
      return;
    }

    try {
      const request = {
        origin,
        destination: destination_point,
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
      };

      directionsServiceRef.current.route(request, (result, status) => {
        if (status === "OK") {
          setDirections(result);
        } else {
          console.error("Directions request failed:", status);
        }
      });
    } catch (error) {
      console.error("Error updating directions:", error);
    }
  }, [
    map,
    currentCaptainLocation,
    currentUserLocation,
    pickup,
    destination,
    rideStatus,
    showFallback,
    isScriptLoaded, // ✅ Add dependency
  ]);

  // Update directions when locations change
  useEffect(() => {
    if (!showFallback && isScriptLoaded) {
      // ✅ Check script loaded
      updateDirections();
    }
  }, [updateDirections, showFallback, isScriptLoaded]);

  // Handle map load
  const onLoad = useCallback((map) => {
    console.log("Map loaded successfully");
    if (mapLoadTimeoutRef.current) {
      clearTimeout(mapLoadTimeoutRef.current);
    }

    setMap(map);
    setIsLoading(false);
    setShowFallback(false);

    // ✅ Double check that Google Maps is available
    if (
      window.google &&
      window.google.maps &&
      window.google.maps.DirectionsService
    ) {
      directionsServiceRef.current = new window.google.maps.DirectionsService();
      console.log("DirectionsService initialized");
    } else {
      console.error("Google Maps DirectionsService not available");
      setShowFallback(true);
    }
  }, []);

  // Handle map unmount
  const onUnmount = useCallback(() => {
    setMap(null);
    directionsServiceRef.current = null;
  }, []);

  // Auto-center map based on ride status
  useEffect(() => {
    // ✅ Add script loaded check
    if (
      showFallback ||
      !map ||
      !isScriptLoaded ||
      !window.google ||
      !window.google.maps
    )
      return;

    try {
      if (rideStatus === "waiting" || rideStatus === "accepted") {
        // Show both captain and pickup location
        if (currentCaptainLocation && pickup) {
          const bounds = new window.google.maps.LatLngBounds();
          bounds.extend(currentCaptainLocation);
          bounds.extend(pickup);
          map.fitBounds(bounds);
        }
      } else if (rideStatus === "in-progress") {
        // Show route from current location to destination
        if (currentUserLocation && destination) {
          const bounds = new window.google.maps.LatLngBounds();
          bounds.extend(currentUserLocation);
          bounds.extend(destination);
          map.fitBounds(bounds);
        }
      }
    } catch (error) {
      console.error("Error fitting bounds:", error);
    }
  }, [
    map,
    currentCaptainLocation,
    currentUserLocation,
    pickup,
    destination,
    rideStatus,
    showFallback,
    isScriptLoaded, // ✅ Add dependency
  ]);

  // Get status-based info
  const getTrackingInfo = () => {
    switch (rideStatus) {
      case "waiting":
        return {
          title: "Looking for drivers...",
          subtitle: "We're finding the best driver for you",
          icon: "🔍",
        };
      case "accepted":
        return {
          title: "Driver on the way",
          subtitle: estimatedArrival
            ? `Arriving in ${estimatedArrival}`
            : "Calculating arrival time...",
          icon: "🚗",
        };
      case "in-progress":
        return {
          title: "Trip in progress",
          subtitle: "Following the best route to your destination",
          icon: "🎯",
        };
      default:
        return {
          title: "TripNow",
          subtitle: "Ready to go",
          icon: "📍",
        };
    }
  };

  const trackingInfo = getTrackingInfo();

  // Fallback UI when Google Maps fails to load
  const FallbackMap = () => (
    <div className="relative h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
      <div className="text-center p-8">
        <div className="text-6xl mb-4">{trackingInfo.icon}</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {trackingInfo.title}
        </h3>
        <p className="text-gray-600 mb-4">{trackingInfo.subtitle}</p>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        <div className="mt-6 p-4 bg-white rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">Maps temporarily unavailable</p>
          <p className="text-xs text-gray-400 mt-1">
            Using location services for tracking
          </p>
        </div>
      </div>
    </div>
  );

  if (error && showFallback) {
    return <FallbackMap />;
  }

  if (showFallback || !apiKey) {
    return <FallbackMap />;
  }

  return (
    <div className="relative h-full w-full">
      <LoadScript
        googleMapsApiKey={apiKey}
        libraries={libraries} // ✅ Use stable reference
        onLoad={() => {
          console.log("Google Maps LoadScript loaded successfully");
          setIsScriptLoaded(true); // ✅ Set script loaded state
          if (mapLoadTimeoutRef.current) {
            clearTimeout(mapLoadTimeoutRef.current);
          }
        }}
        onError={(error) => {
          console.error("Google Maps LoadScript error:", error);
          setShowFallback(true);
          setIsLoading(false);
          setIsScriptLoaded(false);
        }}
        loadingElement={
          <div className="absolute inset-0 bg-white flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-600">Loading Google Maps...</p>
            </div>
          </div>
        }
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={15}
          center={currentUserLocation || { lat: 28.6139, lng: 77.209 }}
          options={mapOptions}
          onLoad={onLoad}
          onUnmount={onUnmount}
        >
          {/* Directions Renderer - Only render if everything is ready */}
          {directions &&
            isScriptLoaded &&
            window.google &&
            window.google.maps && (
              <DirectionsRenderer
                directions={directions}
                options={{
                  suppressMarkers: false,
                  polylineOptions: {
                    strokeColor: "#000000",
                    strokeWeight: 4,
                  },
                }}
              />
            )}

          {/* Captain Location Marker */}
          {currentCaptainLocation &&
            (rideStatus === "waiting" || rideStatus === "accepted") &&
            isScriptLoaded &&
            window.google &&
            window.google.maps && (
              <Marker
                position={currentCaptainLocation}
                icon={{
                  url:
                    "data:image/svg+xml;charset=UTF-8," +
                    encodeURIComponent(`
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="16" fill="#10B981"/>
                    <path d="M21 12L14 19L11 16" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                `),
                  scaledSize: new window.google.maps.Size(32, 32),
                }}
                title="Driver Location"
              />
            )}

          {/* User Location Marker */}
          {currentUserLocation &&
            isScriptLoaded &&
            window.google &&
            window.google.maps && (
              <Marker
                position={currentUserLocation}
                icon={{
                  url:
                    "data:image/svg+xml;charset=UTF-8," +
                    encodeURIComponent(`
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="16" fill="#3B82F6"/>
                    <circle cx="16" cy="16" r="6" fill="white"/>
                  </svg>
                `),
                  scaledSize: new window.google.maps.Size(32, 32),
                }}
                title="Your Location"
              />
            )}

          {/* Pickup Location Marker */}
          {pickup &&
            (rideStatus === "waiting" || rideStatus === "accepted") &&
            isScriptLoaded &&
            window.google &&
            window.google.maps && (
              <Marker
                position={pickup}
                icon={{
                  url:
                    "data:image/svg+xml;charset=UTF-8," +
                    encodeURIComponent(`
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="16" fill="#F59E0B"/>
                    <circle cx="16" cy="12" r="3" stroke="white" stroke-width="2"/>
                    <path d="M16 16L16 20" stroke="white" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                `),
                  scaledSize: new window.google.maps.Size(32, 32),
                }}
                title="Pickup Location"
              />
            )}

          {/* Destination Marker */}
          {destination &&
            isScriptLoaded &&
            window.google &&
            window.google.maps && (
              <Marker
                position={destination}
                icon={{
                  url:
                    "data:image/svg+xml;charset=UTF-8," +
                    encodeURIComponent(`
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="16" fill="#EF4444"/>
                    <path d="M21 12L14 19L11 16" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                `),
                  scaledSize: new window.google.maps.Size(32, 32),
                }}
                title="Destination"
              />
            )}
        </GoogleMap>
      </LoadScript>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default LiveTracking;
