import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// Custom hook for authentication and authorization
const useAuth = () => {
  // States to track loading and authentication status
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Function to check token validity, decode it, and handle navigation for invalid tokens
  const checkTokenValidity = (token) => {
    try {
      const decoded = jwtDecode(token); // Decode the JWT token
      const currentTime = Date.now() / 1000; // Get current time in seconds

      // Check if the token is expired
      if (decoded.exp < currentTime) {
        navigate("/login"); // Redirect to login if token is expired
        return false;
      }

      // Check if the user is an admin
      if (decoded.type !== "admin") {
        navigate("/"); // Redirect to homepage if not an admin
        return false;
      }

      // Return true if the token is valid and user is an admin
      return true;
    } catch (error) {
      console.error("Token decoding error:", error); // Log any decoding errors
      navigate("/login"); // Redirect to login if token is invalid
      return false;
    }
  };

  // Effect hook to run authentication checks when the component mounts
  useEffect(() => {
    const token = localStorage.getItem("token"); // Retrieve token from localStorage

    // If no token is found, navigate to login page
    if (!token) {
      navigate("/login");
    } else {
      // If token exists, check its validity
      const isValid = checkTokenValidity(token);
      if (isValid) {
        setIsAuthenticated(true); // Set authenticated state to true
        setIsLoading(false); // Set loading to false
      } else {
        setIsLoading(false); // Set loading to false if invalid
      }
    }
  }, [navigate]);

  // Return the authentication status and loading state
  return { isLoading, isAuthenticated };
};

export default useAuth;
