import React, { useContext, useEffect, useState } from "react";
import { CaptainContext } from "../context/CaptainContext.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CaptainProtectedWrapper = ({ children }) => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const { captain, setCaptain } = useContext(CaptainContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCaptainData = async () => {
      if (!token) {
        navigate("/captain-login");
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/captains/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setCaptain(response.data.captain);
      } catch (error) {
        console.error("Error fetching captain data:", error);
        localStorage.removeItem("token");
        navigate("/captain-login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCaptainData();
  }, [token, navigate]);

  if (isLoading) {
    return <div>Loading...</div>; // You can replace this with a loading spinner or similar
  }
  return <>{children}</>;
};

export default CaptainProtectedWrapper;
