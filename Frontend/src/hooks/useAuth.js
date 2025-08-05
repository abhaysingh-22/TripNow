// Custom hook for authentication
export const useAuth = () => {
  const getAuthToken = () => {
    // Try localStorage first
    let token = localStorage.getItem("token");

    // Try sessionStorage if not in localStorage
    if (!token) {
      token = sessionStorage.getItem("token");
    }

    // Try cookies if not in storage
    if (!token) {
      const cookies = document.cookie.split(";");
      const tokenCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("token=")
      );
      if (tokenCookie) {
        token = tokenCookie.split("=")[1];
      }
    }

    // For debugging purposes - Add a test token if none found
    if (!token) {
      console.warn("No token found, using test token for debugging");
      token = "test-token-for-debugging";
    }

    return token || "";
  };

  return { getAuthToken };
};
