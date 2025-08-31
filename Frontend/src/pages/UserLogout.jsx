import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function UserLogout() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("You are not logged in.");
        navigate("/login");
        return;
      }

      try {
        await axios.get(`${import.meta.env.VITE_BASE_URL}/api/users/logout`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        localStorage.removeItem("token");
        alert("You have been logged out successfully.");
        navigate("/login");
      } catch (error) {
        console.error(
          "Logout error details:",
          error.response?.data || error.message
        );

        // Still remove token locally even if backend fails
        localStorage.removeItem("token");

        if (error.response?.status === 401) {
          alert("Session expired. You have been logged out.");
        } else {
          alert("Logout completed locally. Please try again if needed.");
        }

        navigate("/login");
      }
    };

    handleLogout();
  }, [navigate]);

  return (
    <div>
      <h1>User Logout</h1>
    </div>
  );
}

export default UserLogout;
